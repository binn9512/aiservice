from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import main  # 사진 분석용 main.py
import os
import sqlite3
import json
from weather import get_today_weather_and_outfit
from flask import send_from_directory
from chatbot_part import chat_with_closet  # 우리가 구체화한 챗봇 함수
<<<<<<< Updated upstream
=======
import requests
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
from PIL import Image
from datetime import datetime
import uuid
from flask import Flask, jsonify, request, redirect # 👈 redirect 추가 확인!
import google_calendar as gc # 👈 google_calendar 모듈 import

from avatar_generator import generate_avatar_image
from prompt_builder import build_prompt
from outfit_generator import generate_outfit_image

import os
import re

import google_calendar as gcal


print("=== APP START ===")
print("현재 작업 폴더:", os.getcwd())
print("DB 절대경로:", os.path.abspath("codi_v2.db"))

conn = sqlite3.connect("codi_v2.db")
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
print("현재 DB 테이블:", cursor.fetchall())
conn.close()

load_dotenv()

SERVER_URL = os.getenv("SERVER_URL")

HF_TOKEN = os.getenv("HF_TOKEN")

print("HF TOKEN =", HF_TOKEN)
>>>>>>> Stashed changes

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
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =========================================================================
# 💬 4. AI 챗봇 및 코디 추천 API
# =========================================================================

# 옷 ID를 기반으로 DB에서 실제 이미지 경로를 찾아주는 내부 도우미 함수
def get_image_path_by_id(clothing_id):
    if not clothing_id or clothing_id == "null" or clothing_id == "":
        return None
        
    try:
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

# 사용자와 챗봇이 대화하고 옷 정보/사진 주소까지 연동해주는 라우트
@app.route('/chat', methods=['POST'])
def chat_api():
    user_data = request.json
    user_message = user_data.get('message', '')

    # 🌟 [수정 1] 프론트엔드가 보낸 방 번호를 읽어옵니다. (없으면 default)
    room_id = user_data.get('room_id', 'default')
    
    # 챗봇(Groq) 함수를 호출하여 JSON 포맷의 대답 문자열 수신
    ai_string_response = chat_with_closet(user_message, room_id)
    print(f"\n🤖 [서버 내부 로그] AI가 반환한 JSON: {ai_string_response}\n")
    
    try:
        ai_json = json.loads(ai_string_response)
        
        # AI가 추천한 부위별 옷 ID 추출
        top_id = ai_json.get('top')
        bottom_id = ai_json.get('bottom')
        outer_id = ai_json.get('outer')
        shoes_id = ai_json.get('shoes')
        bag_id = ai_json.get('bag')
        accessory_id = ai_json.get('accessory')
        
        # ID를 바탕으로 실제 웹에서 접근 가능한 이미지 주소로 치환
        return jsonify({
            "success": True,
            "message": ai_json.get('message'),
            "images": {
                "top": get_image_path_by_id(top_id),
                "bottom": get_image_path_by_id(bottom_id),
                "outer": get_image_path_by_id(outer_id),
                "shoes": get_image_path_by_id(shoes_id),
                "bag": get_image_path_by_id(bag_id),
                "accessory": get_image_path_by_id(accessory_id)
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"코디 생성 처리 중 오류가 발생했습니다. (에러: {e})",
            "images": {}
        })


# =========================================================================
# 👗 5. 옷장(Closet) 및 코디 저장 관리 API
# =========================================================================

# 전체 옷장 목록 조회 API
@app.route('/api/closet', methods=['GET'])
def get_closet():
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()

        cursor.execute("""
            SELECT clothes_id, processed_image, category, style, color 
            FROM clothes
        """)
        rows = cursor.fetchall()
        conn.close()

        result = []
        for row in rows:
            result.append({
                "id": row[0],
                "image": f"http://127.0.0.1:5001/{row[1]}",
                "category": row[2],
                "style": row[3],
                "color": row[4]
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


<<<<<<< Updated upstream
=======
# =========================================================================
# 👤 AI 아바타 생성 API
# =========================================================================

# 사용자의 얼굴 사진을 base_avatar에 합성하여 AI 아바타를 생성하는 API
@app.route("/generate-avatar", methods=["POST"])
def generate_avatar():

    if "photo" not in request.files:
        return jsonify({
            "success": False,
            "error": "photo is required"
        }), 400

    try:

        photo = request.files["photo"]

        print(photo.filename)

        avatar_path = generate_avatar_image(photo)

        # 상대 경로 처리 및 URL 조합 (슬래시 중복 방지)
        clean_path = str(avatar_path).lstrip("/")
        avatar_url = f"{SERVER_URL}/{clean_path}"

        return jsonify({
            "success": True,
            "avatar_path": avatar_path,
            "avatar_url": avatar_url
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# 생성된 AI 아바타에 추천 코디를 적용하여 최종 이미지를 생성하는 API
@app.route("/generate-outfit", methods=["POST"])
def generate_outfit():
    print("🔥 /generate-outfit 호출됨")

    data = request.get_json() or {}

    avatar_path = data.get("avatar_path")
    prompt = data.get("prompt")
    item_images = data.get("item_images", [])

    if not avatar_path:
        return jsonify({
            "success": False,
            "error": "avatar_path 없음"
        }), 400

    if not prompt:
        return jsonify({
            "success": False,
            "error": "prompt 없음"
        }), 400

    try:
        result = generate_outfit_image(
            avatar_path=avatar_path,
            prompt=prompt,
            item_images=item_images,
        )

        image_url = f"{SERVER_URL}/{result}"

        return jsonify({
            "success": True,
            "image_path": result,
            "image_url": image_url,
        })

    except Exception as e:
        print("❌ 옷 입히기 오류:", e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# =========================================================================
# 📅 Google Calendar 연동 API
# =========================================================================
# 1️⃣ [추가] 웹뷰 연동 시작점: 프론트엔드 웹뷰가 이 URL을 호출하면 구글 로그인 페이지로 이동
@app.route('/api/calendar/login', methods=['GET'])
def calendar_login():
    return redirect(gc.get_google_auth_url())


# 2️⃣ [추가] 구글 OAuth 콜백: 구글 로그인 완료 후 토큰을 받아 DB에 저장
@app.route('/api/calendar/authS/callback', methods=['GET'])
def calendar_callback():
    code = request.args.get('code')
    error = request.args.get('error')

    if error or not code:
        return """
        <html><body><script>
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CALENDAR_AUTH', success: false }));
            }
        </script><h3>로그인이 취소되었습니다. 창을 닫아주세요.</h3></body></html>
        """

    try:
        # 구글 서버에서 토큰 교환
        tokens = gc.exchange_code_for_tokens(code)
        access_token = tokens.get("access_token")
        refresh_token = tokens.get("refresh_token")
        expires_in = tokens.get("expires_in", 3600)

        # 사용자 이메일 가져온 뒤 DB 저장
        email = gc.get_user_email(access_token)
        gc.save_account(access_token, refresh_token, expires_in, email)

        return """
        <html><body><script>
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CALENDAR_AUTH', success: true }));
            }
        </script><h3>구글 캘린더 연동 성공! 이 창을 닫아주세요.</h3></body></html>
        """
    except Exception as e:
        return f"<h3>연동 실패: {str(e)}</h3>"

# 1) 캘린더 연결 상태 확인 API
@app.route('/api/calendar/status', methods=['GET'])
def calendar_status():
    account = gcal.get_account()
    return jsonify({
        "connected": account is not None,
        "email": account.get("email") if account else None,
    })


# 2) 구글 OAuth 로그인 인증 토큰 교환 API
@app.route('/api/calendar/auth/google', methods=['POST'])
def calendar_auth_google():
    data = request.json or {}
    code = data.get('code')
    redirect_uri = data.get('redirectUri')
    code_verifier = data.get('codeVerifier')

    if not code or not redirect_uri:
        return jsonify({"success": False, "error": "code와 redirectUri가 필요합니다."}), 400

    try:
        tokens = gcal.exchange_code_for_tokens(code, redirect_uri, code_verifier)
        email = gcal.get_user_email(tokens['access_token'])
        gcal.save_account(
            access_token=tokens['access_token'],
            refresh_token=tokens.get('refresh_token'),
            expires_in=tokens.get('expires_in'),
            email=email,
        )
        return jsonify({"success": True, "email": email})
    except gcal.GoogleCalendarError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"캘린더 연결 중 오류가 발생했습니다: {e}"}), 500


# 3) 캘린더 연동 해제 API
@app.route('/api/calendar/disconnect', methods=['POST'])
def calendar_disconnect():
    try:
        gcal.delete_account()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# 4) 기간별 일정 목록 가져오기 API
@app.route('/api/calendar/events', methods=['GET'])
def calendar_events():
    start = request.args.get('start')
    end = request.args.get('end')
    if not start or not end:
        return jsonify({"success": False, "error": "start와 end가 필요합니다."}), 400

    try:
        access_token = gcal.get_valid_access_token()
    except gcal.GoogleCalendarError:
        access_token = None

    if not access_token:
        return jsonify({"success": False, "error": "캘린더가 연결되어 있지 않습니다."}), 401

    try:
        events = gcal.list_events(access_token, start, end)
        return jsonify({"success": True, "events": events})
    except Exception as e:
        return jsonify({"success": False, "error": f"일정을 불러오지 못했습니다: {e}"}), 502


# 5) 일정 기반 코디 전용 단독 요청 API
@app.route('/api/chat/schedule-outfit', methods=['POST'])
def chat_schedule_outfit():
    data = request.json or {}
    message = data.get('message', '')
    room_id = data.get('room_id', 'default')

    if not message:
        return jsonify({"success": False, "error": "message가 필요합니다."}), 400

    result = generate_schedule_outfit_response(message, room_id)
    result["success"] = True
    return jsonify(result)


import sqlite3
from flask import request, jsonify

@app.route('/schedule', methods=['POST'])
def add_schedule():
    try:
        data = request.json or {}
        title = data.get('title')
        event_date = data.get('event_date')
        tpo_tag = data.get('tpo_tag', 'Casual')

        if not title or not event_date:
            return jsonify({"success": False, "message": "제목과 날짜를 지정해 주세요."}), 400

        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()
        
        # schedules 테이블이 없을 경우를 대비해 자동 생성
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS schedules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                event_date TEXT NOT NULL,
                tpo_tag TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute(
            "INSERT INTO schedules (title, event_date, tpo_tag) VALUES (?, ?, ?)",
            (title, event_date, tpo_tag)
        )
        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "일정이 성공적으로 등록되었습니다."})

    except Exception as e:
        print(f"❌ /schedule 라우트 에러: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

# -------------------------------------------------------------
# 📅 등록된 모든 일정 목록 조회 API (캘린더 복원용)
# -------------------------------------------------------------
@app.route('/schedules', methods=['GET'])
def get_all_schedules():
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()
        
        # 테이블이 없는 경우 자동 생성
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS schedules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                event_date TEXT NOT NULL,
                tpo_tag TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 저장된 모든 일정 가져오기
        cursor.execute("SELECT title, event_date, tpo_tag FROM schedules")
        rows = cursor.fetchall()
        conn.close()

        schedules_list = [
            {"title": r[0], "event_date": r[1], "tpo_tag": r[2]} 
            for r in rows
        ]

        return jsonify({"success": True, "schedules": schedules_list})

    except Exception as e:
        print(f"❌ 전체 일정 조회 에러: {e}")
        return jsonify({"success": False, "schedules": []}), 500

# -------------------------------------------------------------
# 🗑️ 일정 삭제 API
# -------------------------------------------------------------
@app.route('/schedule', methods=['DELETE'])
def delete_schedule():
    try:
        data = request.json
        title = data.get('title')
        event_date = data.get('event_date')

        if not title or not event_date:
            return jsonify({"success": False, "message": "삭제할 일정을 찾을 수 없습니다."}), 400

        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()
        
        # 해당 제목과 날짜가 일치하는 일정 삭제
        cursor.execute(
            "DELETE FROM schedules WHERE title = ? AND event_date = ?",
            (title, event_date)
        )
        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "일정이 삭제되었습니다."})
    except Exception as e:
        print(f"❌ 일정 삭제 에러: {e}")
        return jsonify({"success": False, "message": "삭제 중 오류 발생"}), 500

>>>>>>> Stashed changes
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)