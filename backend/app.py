from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import main  # 사진 분석용 main.py
import os
import sqlite3
import json
from weather import get_today_weather_and_outfit
from flask import send_from_directory
from chatbot_part import chat_with_closet  # 우리가 구체화한 챗봇 함수

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
    
    # 챗봇(Groq) 함수를 호출하여 JSON 포맷의 대답 문자열 수신
    ai_string_response = chat_with_closet(user_message)
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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)