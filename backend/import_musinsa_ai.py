import os
import re
import sqlite3
import pandas as pd
import requests
from io import BytesIO
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel
from rembg import remove
from uuid import uuid4

# ==========================================
# 1. CLIP 모델 및 프로세서 전역 로드
# ==========================================
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"⚙️ Using device: {device}")

model_id = "openai/clip-vit-base-patch32"
clip_model = CLIPModel.from_pretrained(model_id).to(device)
clip_processor = CLIPProcessor.from_pretrained(model_id)

# ==========================================
# 2. AI 스타일 & 색상 분류 및 누끼 함수
# ==========================================
def classify_color(image):
    colors = {
        "블랙": "a photo of black colored clothing",
        "화이트": "a photo of white colored clothing",
        "그레이": "a photo of grey colored clothing",
        "베이지/브라운": "a photo of beige, tan, or brown clothing",
        "네이비/블루": "a photo of navy or blue clothing",
        "데님": "a photo of blue denim texture clothing",
        "레드/핑크": "a photo of red or pink clothing",
        "그린/카키": "a photo of green or khaki clothing",
        "보라": "a photo of purple clothing",
        "민트": "a photo of mint colored clothing",
        "오렌지": "a photo of orange colored clothing",
        "옐로우": "a photo of yellow colored clothing"
    }
    labels = list(colors.keys())
    descriptions = list(colors.values())
    inputs = clip_processor(text=descriptions, images=image, return_tensors="pt", padding=True).to(device)
    with torch.no_grad():
        outputs = clip_model(**inputs)
    probs = outputs.logits_per_image.softmax(dim=1)
    return labels[probs.argmax().item()]

def classify_style(image):
    styles = {
        "캐주얼": "a photo of comfortable everyday basic clothing like a simple t-shirt or hoodie",
        "비즈니스룩": "a photo of business or formal style clothing",
        "페미닌": "a photo of feminine clothing like dresses, skirts, and blouses",
        "빈티지": "a photo of retro, old-fashioned, or distressed vintage style clothing",
        "미니멀": "a photo of minimal or simple style clothing"
    }
    labels = list(styles.keys())
    descriptions = list(styles.values())
    inputs = clip_processor(text=descriptions, images=image, return_tensors="pt", padding=True).to(device)
    with torch.no_grad():
        outputs = clip_model(**inputs)
    
    probs = outputs.logits_per_image.softmax(dim=1)
    top_probs, top_indices = torch.topk(probs, 2)
    top1_prob, top2_prob = top_probs[0][0].item(), top_probs[0][1].item()
    top1_label, top2_label = labels[top_indices[0][0].item()], labels[top_indices[0][1].item()]

    if (top1_prob - top2_prob) < 0.2:
        return f"{top1_label}, {top2_label}"
    else:
        return top1_label

# 🌟 누끼 딴 이미지를 RGBA 형태로 저장하고 파일명 반환하는 함수로 개편
def process_no_bg_and_save(raw_img, output_folder="static/output"):
    os.makedirs(output_folder, exist_ok=True)
    
    # 1. 배경 제거 (rembg)
    output_image = remove(raw_img)
    if output_image.mode != "RGBA":
        output_image = output_image.convert("RGBA")

    # 2. 여백 자르기 & 비율 맞추기 (투명 알파 채널 유지)
    bbox = output_image.getbbox()
    if bbox:
        output_image = output_image.crop(bbox)
        scale = 0.9
        w, h = output_image.size
        new_w, new_h = int(w * scale), int(h * scale)
        resized = output_image.resize((new_w, new_h), Image.Resampling.LANCZOS)

        # 🌟 투명 배경 캔버스 생성 (0, 0, 0, 0)
        canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        x, y = (w - new_w) // 2, (h - new_h) // 2
        canvas.paste(resized, (x, y), resized)
        output_image = canvas

    # 3. ✨ 투명 배경(RGBA) 상태 그대로 PNG 파일 저장!
    filename = f"{uuid4()}_no_bg.png"
    save_path = os.path.join(output_folder, filename)
    output_image.save(save_path, format="PNG") # PNG 포맷으로 투명도 보존
    
    # 4. CLIP 스타일 분류기용으로만 '흰색 배경'을 임시 합성해서 반환
    white_bg_for_clip = Image.new("RGB", output_image.size, (255, 255, 255))
    white_bg_for_clip.paste(output_image, mask=output_image.split()[3])

    return filename, white_bg_for_clip

# 숫자로 안전하게 변환해 주는 도우미 함수 (가격 변환용)
def parse_price(val):
    if pd.isna(val) or not val:
        return 0
    numbers = re.findall(r'\d+', str(val))
    return int("".join(numbers)) if numbers else 0

# ==========================================
# 3. 무신사 CSV ➔ AI(스타일,색상) 분석 ➔ DB 저장
# ==========================================
def process_musinsa_csv_to_db(csv_file_path="musinsa_items.csv"):
    if not os.path.exists(csv_file_path):
        print(f"❌ CSV 파일을 찾을 수 없습니다: {csv_file_path}")
        return

    # 1. DB 연결 및 기존 테이블 재작성 (no_bg_url 컬럼 추가!)
    conn = sqlite3.connect("codi_v2.db")
    cursor = conn.cursor()

    cursor.execute("DROP TABLE IF EXISTS musinsa_clothes")
    cursor.execute("""
        CREATE TABLE musinsa_clothes (
            musinsa_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            category TEXT,
            style TEXT,
            color TEXT,
            price INTEGER,
            img_url TEXT,
            no_bg_url TEXT,
            product_url TEXT
        )
    """)
    conn.commit()

    # 2. CSV 읽기
    df = pd.read_csv(csv_file_path)
    print(f"📦 총 {len(df)}개 무신사 상품 분석을 시작합니다...")

    # 무신사 서버 차단 방지 헤더
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        'Referer': 'https://www.musinsa.com/'
    }

    for idx, row in df.iterrows():
        name = str(row.get("상품명") or row.get("name") or "이름없음").strip()
        category = str(row.get("카테고리") or row.get("category") or "기타").strip()
        price = parse_price(row.get("가격") or row.get("price"))
        img_url = str(row.get("이미지링크") or row.get("img_url") or row.get("이미지") or "").strip()
        product_url = str(row.get("구매링크") or row.get("product_url") or "").strip()

        if not img_url or img_url == "nan":
            print(f"[{idx+1}/{len(df)}] ⚠️ {name} : 이미지 링크가 없어 건너뜁니다.")
            continue

        if img_url.startswith("//"):
            img_url = "https:" + img_url

        try:
            # 1) 온라인 이미지 다운로드 (헤더 포함)
            resp = requests.get(img_url, headers=headers, timeout=10)
            raw_img = Image.open(BytesIO(resp.content))

            # 2) 배경 누끼 제거 및 투명 PNG 파일 저장!
            no_bg_filename, processed_img_for_clip = process_no_bg_and_save(raw_img)
            
            # 💡 서버에서 보낼 누끼 이미지 상대/절대 URL 생성 (예: static/output/xxx_no_bg.png)
            no_bg_url = f"/static/output/{no_bg_filename}"

            # 3) AI 모델 분석 (스타일, 색상)
            style = classify_style(processed_img_for_clip)
            color = classify_color(processed_img_for_clip)

            # 4) DB에 삽입 (no_bg_url 포함 8개 항목)
            cursor.execute("""
                INSERT INTO musinsa_clothes (name, category, style, color, price, img_url, no_bg_url, product_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (name, category, style, color, price, img_url, no_bg_url, product_url))

            print(f"[{idx+1}/{len(df)}] ✅ {name} | 카테고리: {category} | AI스타일: {style} | AI색상: {color} | 누끼파일: {no_bg_filename}")

        except Exception as e:
            print(f"[{idx+1}/{len(df)}] ❌ {name} 분석 오류 상세: {type(e).__name__} - {e}")

    conn.commit()
    conn.close()
    print("\n🎉 모든 무신사 데이터의 AI 분석, 누끼 따기 및 DB 저장 완료!")

if __name__ == "__main__":
    process_musinsa_csv_to_db("musinsa_items.csv")