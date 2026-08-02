from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import main  # 사진 분석용 main.py
import os
import sqlite3
import json
from weather import get_today_weather_and_outfit
from flask import send_from_directory
from chatbot_part import chat_with_closet  # 우리가 구체화한 챗봇 함수
import requests
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
from PIL import Image
import uuid
from outfit_generator import generate_outfit_image

import os
import re

print("=== APP START ===")
print("현재 작업 폴더:", os.getcwd())
print("DB 절대경로:", os.path.abspath("codi_v2.db"))

conn = sqlite3.connect("codi_v2.db")
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
print("현재 DB 테이블:", cursor.fetchall())
conn.close()

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

print("HF TOKEN =", HF_TOKEN)

app = Flask(__name__)
CORS(app)  # 다른 도메인(앱 등)에서 접근할 수 있게 허용

# =========================================================================
# 🏠 1. 기본 페이지 및 미디어 서빙 라우트
# =========================================================================

# 사용자가 처음 웹사이트(http://127.0.0.1:5000)에 접속했을 때 화면 띄우기
@app.route('/')
def index():
    return render_template('index.html')

# 분석 후 생성된 이미지 서빙 라우트
@app.route('/output/<path:filename>')
def serve_output_image(filename):
    return send_from_directory(
        'output',
        filename
    )


# =========================================================================
# 🌤 2. 날씨 정보 API
# =========================================================================

# 오늘 날씨와 추천 옷차림 정보를 가져오는 API
@app.route('/weather', methods=['GET'])
def get_weather():
    API_KEY = "e62c1806eb7b13df76cbdfb855dff027"
    weather_info = get_today_weather_and_outfit(API_KEY)

    if weather_info:
        return jsonify(weather_info)

    return jsonify({
        "error": "날씨 정보를 가져오지 못했습니다."
    }), 500


# =========================================================================
# 📸 3. 이미지 분석 및 등록 API
# =========================================================================

# 앱/웹에서 사진 주소를 받아 분석하고 DB에 등록하는 라우트
@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'photo' not in request.files:
        return jsonify({
            "success": False,
            "error": "사진 파일이 없습니다."
        }), 400

    photo = request.files['photo']
    user_id = request.form.get('user_id', 'user1')

    try:
        os.makedirs('uploads', exist_ok=True)
        save_path = os.path.join('uploads', photo.filename)
        photo.save(save_path)

        path, cat, st, col = main.process_and_save(user_id, save_path)

        return jsonify({
            "success": True,
            "item": {
                "id": path,
                "image": path,
                "category": cat,
                "style": st,
                "color": col
            }
        })

    except Exception as e:
        import traceback

        print("❌ AVATAR ERROR:")
        traceback.print_exc()

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =========================================================================
# 💬 4. AI 챗봇 및 코디 추천 API
# =========================================================================

# 옷 ID를 기반으로 DB에서 실제 이미지 경로를 찾아주는 내부 도우미 함수
def get_image_path_by_id(item_id):
    # (기존 DB 조회 및 파일명 가져오는 로직...)
    # 예: image_name = row[0]
    
    # 💡 반환되는 URL 주소에서 역슬래시(\)를 슬래시(/)로 완벽 교체!
    if image_name:
        clean_path = str(image_name).replace("\\", "/")
        if not clean_path.startswith("http"):
            if not clean_path.startswith("/"):
                clean_path = "/" + clean_path
            return f"http://172.20.10.3:5001{clean_path}"
        return clean_path
    return None
        
    try:
        import os

        print("현재 작업 폴더:", os.getcwd())
        print("DB 절대경로:", os.path.abspath("codi_v2.db"))

        conn = sqlite3.connect('codi_v2.db') 
        cursor = conn.cursor()
        
        cursor.execute("SELECT processed_image FROM clothes WHERE clothes_id = ?", (clothing_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row and row[0]:
            db_path = row[0]  # 예: 'output\skirt_no_bg.png'
            
            # 역슬래시(\)를 슬래시(/)로 변환하고 static 경로 포맷팅
            clean_path = db_path.replace('\\', '/')
            if not clean_path.startswith('static/'):
                clean_path = 'static/' + clean_path
                
            return clean_path
            
        return None
    except Exception as e:
        print(f"❌ DB 이미지 경로 조회 오류: {e}")
        return None
    
# 옷 입히기 데모 이미지를 불러오는 함수
def get_demo_outfit_image(ai_json):

    style_text = (
        ai_json.get("message", "")
    )

    if "출근" in style_text:
        return "static/demo_outfits/office.png"

    if "데이트" in style_text:
        return "static/demo_outfits/date.png"

    if "캐주얼" in style_text:
        return "static/demo_outfits/casual.png"

    if "페미닌" in style_text:
        return "static/demo_outfits/feminine.png"

    return "static/demo_outfits/minimal.png"
    

# 옷 ID를 기반으로 실제 옷 정보를 조회하는 내부 도우미 함수


def extract_id(val):
    if not val or val == "null" or val is None:
        return None
    # "ID:4 | 종류:집업..." 같은 문자열에서 첫 번째 발견되는 숫자만 추출
    numbers = re.findall(r'\d+', str(val))
    return int(numbers[0]) if numbers else None

def get_item_info_by_id(clothing_id):
    if not clothing_id or clothing_id == "null" or clothing_id == "":
        return None

    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()

        cursor.execute("""
            SELECT clothes_id,
                   category,
                   style,
                   color,
                   processed_image,
                   name
            FROM clothes
            WHERE clothes_id = ?
        """, (clothing_id,))

        row = cursor.fetchone()
        conn.close()

        if not row:
            return None

        # 💡 [핵심 해결] 역슬래시(\)를 웹 URL용 슬래시(/)로 바꾸고 호스팅 Full URL 생성
        raw_img = row[4]
        img_path = None

        if raw_img:
            # 1. 역슬래시 -> 슬래시 변환
            clean_path = str(raw_img).replace("\\", "/").strip()
            
            # 2. 이미 http로 시작하는 URL이 아니면 풀 URL로 가공
            if not clean_path.startswith("http"):
                if not clean_path.startswith("/"):
                    clean_path = "/" + clean_path
                img_path = f"http://172.20.10.3:5001{clean_path}"
            else:
                img_path = clean_path

        return {
            "id": row[0],
            "category": row[1],
            "style": row[2],
            "color": row[3],
            "image": img_path,      # 🌟 슬래시(/) 변환된 full URL
            "img_url": img_path,    # 🌟 img_url 키도 동일하게 제공 (호환성 보장)
            "name": row[5]
        }

    except Exception as e:
        print(f"❌ 옷 정보 조회 오류: {e}")
        return None

def generate_outfit_image(
    dress=None,
    top=None,
    bottom=None,
    outer=None,
    shoes=None,
    bag=None,
):
    print("🔥 합성 함수 진입")
    print("========== 합성 시작 ==========")
    print("dress =", dress)
    print("top =", top)
    print("bottom =", bottom)
    print("outer =", outer)
    print("shoes =", shoes)
    print("bag =", bag)
    print("==============================")

    try:
        print(
            "🔥 base exists =",
            os.path.exists(
                "static/avatar/base_avatar.png"
            )
        )
        base = Image.open(
            "static/avatar/base_avatar.png"
        ).convert("RGBA")

        print("아바타 크기 =", base.size)

        def paste_item(
            image_path,
            x,
            y,
            w,
            h,
        ):
            
            print("입히는 옷 =", image_path)
            print(
                "파일 존재 =",
                os.path.exists(image_path)
            )

            if not image_path:
                return

            item = Image.open(
                image_path
            ).convert("RGBA")

            bbox = item.getbbox()

            if bbox:
                item = item.crop(bbox)

            item = item.resize(
                (w, h)
            )

            base.paste(
                item,
                (x, y),
                item,
            )

            print("dress =", dress)
            print("top =", top)
            print("bottom =", bottom)
            print("outer =", outer)
            print("shoes =", shoes)
            print("bag =", bag)

        if dress:
            paste_item(
                dress,
                450,
                300,
                850,
                1300,
            )

        if outer:
            paste_item(
                outer,
                420,
                250,
                900,
                1100,
            )

        if top:
            paste_item(
                top,
                520,
                350,
                700,
                700,
            )

        if bottom:
            paste_item(
                bottom,
                500,
                950,
                700,
                800,
            )

        if shoes:
            paste_item(
                shoes,
                550,
                2000,
                450,
                200,
            )

        if bag:
            paste_item(
                bag,
                1050,
                600,
                280,
                350,
            )

        filename = (
            f"final_{uuid.uuid4()}.png"
        )

        save_path = os.path.join(
            "output",
            filename,
        )

        base.save(save_path)

        print(
            "파일 저장 확인 =",
            os.path.exists(save_path)
        )

        print(
            "✅ 저장 완료:",
            save_path
        )

        return f"output/{filename}"

    except Exception as e:
        print(
            "합성 오류:",
            e,
        )
        return None

def get_musinsa_item_by_id(musinsa_id):
    if not musinsa_id or musinsa_id == "null" or musinsa_id == "":
        return None

    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()

        clean_musinsa_id = str(musinsa_id).replace("SHOP_", "").replace("ID:", "").strip()

        cursor.execute("""
            SELECT musinsa_id,
                   category,
                   style,
                   color,
                   img_url,
                   name,
                   product_url,
                   price
            FROM musinsa_clothes
            WHERE musinsa_id = ? OR musinsa_id = ?
        """, (clean_musinsa_id, f"SHOP_{clean_musinsa_id}"))

        row = cursor.fetchone()
        conn.close()

        # 🔍 DB에서 실제 읽어온 데이터 원본 터미널에 출력하기!
        print(f"🔍 [무신사 DB Raw Row ({clean_musinsa_id})]:", row)

        if not row:
            return None

        # row[4]가 img_url 위치입니다.
        img_link = row[4] if len(row) > 4 else None
        if img_link:
            img_link = str(img_link).replace("\\", "/").strip()

        buy_link = row[6] if len(row) > 6 else None

        return {
            "id": f"SHOP_{row[0]}",
            "category": row[1],
            "style": row[2],
            "color": row[3],
            "img_url": img_link,
            "image": img_link,
            "name": row[5],
            "product_url": buy_link,
            "buy_url": buy_link,
            "price": row[7] if len(row) > 7 else 0,
            "is_shop": True
        }

    except Exception as e:
        print(f"❌ 무신사 옷 정보 조회 오류: {e}")
        return None
# ID가 MY_인지 SHOP_인지 판별하여 맞춤 조회를 해주는 통합 함수
def get_any_item_info(item_code):
    if not item_code or item_code == "null" or item_code == "":
        return None
    
    item_str = str(item_code).strip()
    
    # "SHOP_12" 또는 "ID:SHOP_12" 형태로 넘어온 경우 ➔ 무신사 DB 조회
    if "SHOP_" in item_str:
        # "SHOP_218" -> "218" 추출
        clean_id = item_str.replace("ID:", "").replace("SHOP_", "").strip()
        return get_musinsa_item_by_id(clean_id)
    
    # "MY_4" 또는 "4" 또는 "ID:4" 형태 ➔ 내 옷장 DB 조회
    else:
        clean_id = extract_id(item_str) if 'extract_id' in globals() else item_str.replace("ID:", "").replace("MY_", "").strip()
        info = get_item_info_by_id(clean_id)
        if info:
            info["is_shop"] = False  # 내 옷장 옷
            info["product_url"] = None
            info["buy_url"] = None
        return info
    
# 사용자와 챗봇이 대화하고 옷 정보/사진 주소까지 연동해주는 라우트
@app.route('/chat', methods=['POST'])
def chat_api():
    user_data = request.json
    user_message = user_data.get('message', '')

    # 🌟 프론트엔드가 보낸 방 번호를 읽어옵니다. (없으면 default)
    room_id = user_data.get('room_id', 'default')
    
    # 챗봇(Groq) 함수를 호출하여 JSON 포맷의 대답 문자열 수신
    ai_string_response = chat_with_closet(user_message, room_id)
    print(f"\n🤖 [서버 내부 로그] AI가 반환한 JSON: {ai_string_response}\n")
    
    try:
        ai_json = json.loads(ai_string_response)

        # 💡 [핵심] get_any_item_info를 통해 내 옷장(MY_)과 무신사(SHOP_)를 자동 판별하여 정보 조회
        top_info = get_any_item_info(ai_json.get('top'))
        bottom_info = get_any_item_info(ai_json.get('bottom'))
        outer_info = get_any_item_info(ai_json.get('outer'))
        dress_info = get_any_item_info(ai_json.get('dress'))
        shoes_info = get_any_item_info(ai_json.get('shoes'))
        bag_info = get_any_item_info(ai_json.get('bag'))
        accessory_info = get_any_item_info(ai_json.get('accessory'))
        
        # 터미널 디버깅용 출력
        print(json.dumps({
            "top": top_info,
            "bottom": bottom_info,
            "outer": outer_info,
            "dress": dress_info,
            "shoes": shoes_info,
            "bag": bag_info,
            "accessory": accessory_info
        }, indent=2, ensure_ascii=False))

        # 합성 데모 이미지 생성 함수 호출
        outfit_image = get_demo_outfit_image(ai_json)
        
        # 이미지 주소 추출 보조 도구 (무신사/내 옷장 이미지 및 역슬래시 통합 처리)
        def resolve_image_url(info):
            if not info:
                return None
            
            # 무신사는 img_url, 내 옷장은 image/image_url 필드 참조
            image_val = info.get("img_url") or info.get("image") or info.get("image_url")
            if not image_val:
                return None

            image_str = str(image_val).replace("\\", "/")  # 윈도우 역슬래시(\) -> 웹 슬래시(/) 변환

            # 무신사 이미지 (http/https로 시작하는 경우)
            if image_str.startswith("http"):
                return image_str
            
            # 내 옷장 이미지 (상대 경로인 경우 호스팅 경로 처리)
            return get_image_path_by_id(extract_id(info.get("id")))

        # 프론트엔드가 image, img_url 어떤 필드로 읽어도 다 뜨도록 items 객체 내부 정제
        all_items = {
            "top": top_info,
            "bottom": bottom_info,
            "outer": outer_info,
            "dress": dress_info,
            "shoes": shoes_info,
            "bag": bag_info,
            "accessory": accessory_info
        }

        for cat, item in all_items.items():
            if item and isinstance(item, dict):
                final_url = resolve_image_url(item)
                item["image"] = final_url
                item["img_url"] = final_url

                # 무신사 구매 링크 키 통일
                raw_link = item.get("product_url") or item.get("buy_url")
                if raw_link:
                    item["buy_url"] = raw_link
                    item["product_url"] = raw_link

        # 프론트엔드로 반환할 최종 데이터
        return jsonify({
            "success": True,
            "message": ai_json.get('message'),
            "outfit_image": outfit_image,

            # 개별 이미지 주소 맵
            "images": {
                "top": resolve_image_url(top_info),
                "bottom": resolve_image_url(bottom_info),
                "outer": resolve_image_url(outer_info),
                "dress": resolve_image_url(dress_info),
                "shoes": resolve_image_url(shoes_info),
                "bag": resolve_image_url(bag_info),
                "accessory": resolve_image_url(accessory_info)
            },

            # 상세 옷 정보 맵
            "items": all_items
        })
        
    except Exception as e:
        print(f"❌ /chat 라우트 에러 발생: {e}")
        return jsonify({
            "success": False,
            "message": f"코디 생성 처리 중 오류가 발생했습니다. (에러: {e})",
            "images": {},
            "items": {}
        })

# =========================================================================
# 👗 5. 옷장(Closet) 및 코디 저장 관리 API
# =========================================================================

# 전체 옷장 목록 조회 API
@app.route('/api/closet', methods=['GET'])
def get_closet():
    print("★★★★★ get_closet 실행 ★★★★★")
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()

        cursor.execute("""
            SELECT clothes_id,
                processed_image,
                category,
                style,
                color,
                name,
                analyzed_at
            FROM clothes
        """)
        rows = cursor.fetchall()
        conn.close()


        from flask import request
        result = []
        for row in rows:
            image_path=row[1].replace("\\","/")
            result.append({
                "id": row[0],
                "image": request.host_url+image_path,
                "category": row[2],
                "style": row[3],
                "color": row[4],
                "name":row[5],
                "analyzed_at": row[6]
            })
     

        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# 🗑 옷 삭제 API
@app.route('/api/closet/<int:item_id>', methods=['DELETE'])
def delete_closet_item(item_id):
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM clothes WHERE clothes_id = ?",
            (item_id,)
        )

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "삭제 완료"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    
# ✏️ 옷 정보 수정 API
@app.route(
    '/api/closet/<int:item_id>',
    methods=['PUT']
)
def update_closet_item(item_id):
    try:
        data = request.json

        conn = sqlite3.connect(
            'codi_v2.db'
        )

        cursor = conn.cursor()

        cursor.execute(
            """
            UPDATE clothes
            SET category = ?,
                style = ?,
                color = ?,
                name = COALESCE(?, name)
            WHERE clothes_id = ?
            """,
            (
                data['category'],
                data['style'],
                data['color'],
                data.get('name'),
                item_id,
            ),
        )

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "수정 완료"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# 사용자의 콜렉션(폴더) 목록 조회 API
@app.route('/get-collections', methods=['GET'])
def get_collections():
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()
        cursor.execute("SELECT collection_id, collection_name FROM collections WHERE user_id = 'su_ryong'")
        rows = cursor.fetchall()
        conn.close()
        
        collection_list = [{"id": row[0], "name": row[1]} for row in rows]
        return jsonify({"success": True, "collections": collection_list})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# 사용자가 선택한 폴더에 추천 코디 세트를 저장하는 API
@app.route('/save-outfit', methods=['POST'])
def save_outfit():
    data = request.json
    user_id = 'su_ryong'  # 로그인 대용 임시 고정 유저
    collection_id = data.get('collection_id')
    
    images = data.get('images', {})
    top = images.get('top')
    bottom = images.get('bottom')
    outer = images.get('outer')
    shoes = images.get('shoes')
    bag = images.get('bag')
    accessory = images.get('accessory')
    
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO saved_outfits (user_id, collection_id, top_id, bottom_id, outer_id, shoes_id, bag_id, accessory_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, collection_id, top, bottom, outer, shoes, bag, accessory))
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "코디가 성공적으로 저장되었습니다! ❤️"})
    except Exception as e:
        return jsonify({"success": False, "message": f"저장 실패 ㅠㅠ 에러: {e}"}), 500


# =========================================================================
# 💬 6. 채팅방(Chat Room) 관리 API
# =========================================================================

# 새 채팅방 생성 API
@app.route('/chat-room/create', methods=['POST'])
def create_chat_room():
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()
        cursor.execute("INSERT INTO chat_rooms (user_id, room_title) VALUES ('su_ryong', '새 채팅')")
        new_room_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return jsonify({"success": True, "room_id": new_room_id, "title": "새 채팅"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# 채팅방 상단 고정/해제 토글 API
@app.route('/chat-room/pin', methods=['POST'])
def pin_chat_room():
    data = request.json
    room_id = data.get('room_id')
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()
        cursor.execute("UPDATE chat_rooms SET is_pinned = NOT is_pinned WHERE room_id = ?", (room_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "고정 상태가 변경되었습니다."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# 채팅방 이름 변경 API
@app.route('/chat-room/rename', methods=['POST'])
def rename_chat_room():
    data = request.json
    room_id = data.get('room_id')
    new_title = data.get('title') # 프론트가 보낸 새 이름
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()
        cursor.execute("UPDATE chat_rooms SET room_title = ? WHERE room_id = ?", (new_title, room_id))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "이름이 변경되었습니다."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# 채팅방 아카이브 보관 API
@app.route('/chat-room/archive', methods=['POST'])
def archive_chat_room():
    data = request.json
    room_id = data.get('room_id')
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()
        cursor.execute("UPDATE chat_rooms SET is_archived = 1 WHERE room_id = ?", (room_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "아카이브에 보관되었습니다."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# 채팅방 삭제 API
@app.route('/chat-room/delete', methods=['POST'])
def delete_chat_room():
    data = request.json
    room_id = data.get('room_id')
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()
        cursor.execute("DELETE FROM chat_rooms WHERE room_id = ?", (room_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "채팅방이 삭제되었습니다."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# =========================================================================
# 👤 AI 아바타 생성 API
# =========================================================================

@app.route('/generate-avatar', methods=['POST'])
def generate_avatar():

    if 'photo' not in request.files:
        return jsonify({
            "success": False,
            "error": "사진 없음"
        }), 400

    photo = request.files['photo']

    try:
        image_bytes = photo.read()

        API_URL = (
            "https://api-inference.huggingface.co/models/"
            "stabilityai/stable-diffusion-xl-base-1.0"
        )

        headers = {
            "Authorization": f"Bearer {HF_TOKEN}"
        }

        prompt = """
        full body korean woman,
        fashion model,
        standing pose,
        clean white background,
        realistic,
        soft lighting,
        fashion avatar
        """

        print("🔥 avatar request start")

        response = requests.post(
            API_URL,
            headers=headers,
            json={
                "inputs": prompt
            },
            timeout=120
        )

        print("STATUS =", response.status_code)
        print("TEXT =", response.text[:500])

        if response.status_code != 200:
            return jsonify({
                "success": False,
                "error": response.text
            }), 500

        os.makedirs(
            "output",
            exist_ok=True
        )

        avatar_filename = (
            f"avatar_{photo.filename}.png"
        )

        avatar_path = os.path.join(
            "output",
            avatar_filename
        )

        image = Image.open(
            BytesIO(response.content)
        )

        image.save(
            avatar_path
        )

        return jsonify({
            "success": True,
            "avatar_url":
            f"http://192.168.219.123:5001/output/{avatar_filename}"
        })

    except Exception as e:
        import traceback

        print("\n❌ AVATAR ERROR ❌")
        traceback.print_exc()

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)