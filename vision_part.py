import os
import json
import requests
from datetime import datetime
from pathlib import Path
from rembg import remove
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel

# CLIP 모델 및 프로세서 초기화 (전역 로드)
device = "cuda" if torch.cuda.is_available() else "cpu"
model_id = "openai/clip-vit-base-patch32"
clip_model = CLIPModel.from_pretrained(model_id).to(device)
clip_processor = CLIPProcessor.from_pretrained(model_id)

def remove_background(image_path: str, output_folder: str = "output"):
    """
    rembg를 사용하여 이미지의 배경을 제거하고 결과를 저장합니다.
    """
    # output 폴더가 없으면 생성
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        print(f"Created directory: {output_folder}")

    # 이미지 열기
    input_path = Path(image_path)
    input_image = Image.open(input_path)

    # 배경 제거
    output_image = remove(input_image)

    # 결과 저장 경로 설정 (확장자를 .png로 변경하여 투명도 유지)
    output_filename = f"{input_path.stem}_no_bg.png"
    output_path = os.path.join(output_folder, output_filename)

    # Pillow를 사용하여 저장
    output_image.save(output_path)
    print(f"Saved: {output_path}")
    
    return output_path

def classify_clothing(image):
    """
    CLIP 모델을 사용하여 이미지를 분류합니다. (이미지는 이미 PIL Image 객체여야 함)
    """
    # 카테고리 정의
    categories = {
       # 상의
        "반팔 티셔츠": "a photo of a short-sleeved t-shirt",
        "긴팔 티셔츠": "a photo of a long-sleeved t-shirt",
        "셔츠/블라우스": "a photo of a dress shirt, button-up shirt, or blouse",
        "니트/스웨터": "a photo of a knitted sweater or pullover",
        "맨투맨/후드": "a photo of a sweatshirt or a hoodie",
        "슬리브리스": "a photo of a sleeveless top, tank top, or vest",
        # 하의
        "데님 팬츠": "a photo of denim jeans",
        "슬랙스": "a photo of formal slacks or dress pants",
        "반바지": "a photo of shorts",
        "트레이닝 팬츠": "a photo of sweatpants or jogger pants",
        "스커트": "a photo of a skirt",
        # 아우터
        "코트": "a photo of a long coat",
        "패딩": "a photo of a puffer jacket or down coat",
        "자켓": "a photo of a blazer or casual jacket",
        "가디건": "a photo of a cardigan",
        "집업": "a photo of a zip-up hoodie or track jacket",
        #신발
        "운동화/스니커즈": "a photo of sneakers, running shoes, or canvas shoes",
        "구두/로퍼": "a photo of dress shoes, loafers, or oxfords",
        "힐": "a photo of high heels",
        "부츠": "a photo of boots",
        "샌들/슬리퍼": "a photo of sandals, flip-flops, or slippers",
        #가방
        "백팩": "a photo of a backpack",
        "숄더백/토트백": "a photo of a shoulder bag, tote bag, or handbag",
        "크로스백": "a photo of a cross-body bag or messenger bag",
        "클러치": "a photo of a clutch bag",
        #악세서리
        "모자": "a photo of a hat, cap, or beanie",
        "머플러/스카프": "a photo of a muffler, scarf, or neck-wrap",
        "벨트": "a photo of a waist belt",
        "안경/선글라스": "a photo of eyeglasses or sunglasses",
        "주얼리": "a photo of jewelry, a necklace, a bracelet, or earrings"
    }
    
    labels = list(categories.keys())
    descriptions = list(categories.values())
    
    inputs = clip_processor(text=descriptions, images=image, return_tensors="pt", padding=True).to(device)
    
    with torch.no_grad():
        outputs = clip_model(**inputs)
        
    logits_per_image = outputs.logits_per_image
    probs = logits_per_image.softmax(dim=1)
    
    best_idx = probs.argmax().item()
    return labels[best_idx]

def classify_color(image):
    """
    의류의 주요 색상을 분류합니다.
    """
    colors = {
        "블랙": "a photo of black colored clothing",
        "화이트": "a photo of white colored clothing",
        "그레이": "a photo of grey colored clothing",
        "베이지/브라운": "a photo of beige, tan, or brown clothing",
        "네이비/블루": "a photo of navy or blue clothing",
        "데님": "a photo of blue denim texture clothing",
        "레드/핑크": "a photo of red or pink clothing",
        "그린/카키": "a photo of green or khaki clothing"
    }
    
    labels = list(colors.keys())
    descriptions = list(colors.values())
    
    inputs = clip_processor(text=descriptions, images=image, return_tensors="pt", padding=True).to(device)
    
    with torch.no_grad():
        outputs = clip_model(**inputs)
        
    probs = outputs.logits_per_image.softmax(dim=1)
    return labels[probs.argmax().item()]
def classify_style(image):
    """
    CLIP 모델을 사용하여 이미지의 스타일을 분류합니다.
    점수가 비슷할 경우 최대 2개까지 반환합니다.
    """
    # 스타일 정의
    styles = {
        "캐주얼": "a photo of comfortable everyday basic clothing like a simple t-shirt or hoodie",
        "비즈니스룩": "a photo of business or formal style clothing",
        "페미닌": "a photo of feminine clothing like dresses, skirts, and blouses",
        "빈티지": "a photo of a photo of retro, old-fashioned, or distressed vintage style clothing",
        "미니멀": "a photo of minimal or simple style clothing"
    }

    labels = list(styles.keys())
    descriptions = list(styles.values())
    
    inputs = clip_processor(text=descriptions, images=image, return_tensors="pt", padding=True).to(device)
    
    with torch.no_grad():
        outputs = clip_model(**inputs)
        
    logits_per_image = outputs.logits_per_image
    probs = logits_per_image.softmax(dim=1)
    
    # 1. 모든 스타일의 확률과 인덱스를 내림차순으로 정렬
    # topk(2)를 써서 상위 2개의 확률(top_probs)과 인덱스(top_indices)를 가져옵니다.
    top_probs, top_indices = torch.topk(probs, 2)
    
    top1_prob = top_probs[0][0].item()
    top2_prob = top_probs[0][1].item()
    top1_label = labels[top_indices[0][0].item()]
    top2_label = labels[top_indices[0][1].item()]

    # 2. 점수 차이가 크지 않을 때(예: 0.1 이하) 두 스타일을 합쳐서 반환
    # 이 수치(0.1)를 조절해서 '얼마나 비슷할 때 두 개를 보여줄지' 결정할 수 있어요.
    if (top1_prob - top2_prob) < 0.2:
        return f"{top1_label}, {top2_label}"
    else:
        return top1_label
 

def analyze_style(image_path: str, output_folder: str = "output"):
    """
    배경 제거, 의류 종류 분류, 그리고 스타일 분석을 수행합니다.
    """
    # 1. 배경 제거
    no_bg_path = remove_background(image_path, output_folder)
    
    # 2. 이미지 로드 및 전처리 (누끼 이미지 최적화)
    image = Image.open(no_bg_path)
    if image.mode == 'RGBA':
        white_bg = Image.new("RGB", image.size, (255, 255, 255))
        white_bg.paste(image, mask=image.split()[3])
        processed_image = white_bg
    else:
        processed_image = image.convert("RGB")
    
    # 3. 의류 종류 분류
    category = classify_clothing(processed_image)
    
    # 4. 스타일 분석
    style = classify_style(processed_image)
    
    # 5. 색상 분류
    color = classify_color(processed_image)
    
    print(f"Analysis Result - Category: {category}, Style: {style}, Color: {color}")
    return no_bg_path, category, style, color

def process_and_classify(image_path: str, output_folder: str = "output"):
    """
    하위 호환성을 위해 유지합니다.
    """
    no_bg_path, category, style, color = analyze_style(image_path, output_folder)
    return no_bg_path, category, style, color


def send_to_backend2_api(image_path):
    """
    분석 결과를 백엔드 2의 API 서버로 전송합니다.
    """
    # 1. 이미지 분석 수행 (기존 함수 활용)
    no_bg_path, category, style, color = analyze_style(image_path)
    
    # 2. 전송할 데이터 정리
    cloth_data = {  
        "user_id": "sungshin_user_01",
        "category": category,
        "style": style,
        "color": color,
        "processed_image": no_bg_path,
        "original_image":image_path,
        "analyzed_at": datetime.now().isoformat()
    }

    # 3. 백엔드 2의 API 주소 (친구가 알려준 주소로 수정 필요)
    # 예: "http://127.0.0.1:8000/api/clothes"
    api_url = "http://localhost:8000/items" 

    try:
        # 데이터를 JSON 형태로 전송
        response = requests.post(api_url, json=cloth_data)
        
        if response.status_code == 200 or response.status_code == 201:
            print(f"✅ 성공적으로 API 전송 완료! (상태 코드: {response.status_code})")
            return response.json()
        else:
            print(f"⚠️ 전송 실패: {response.status_code}, 메시지: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ API 서버 연결 오류: {e}")
        return None

if __name__ == "__main__":
    test_image = "test_cloth.jpg"
    if os.path.exists(test_image):
        # 이제 파일 저장이 아니라 'API 전송'을 호출합니다.
        send_to_backend2_api(test_image)