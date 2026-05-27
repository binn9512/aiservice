from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import main  # 사진 분석용 main.py
import os
import sqlite3
import json
from chatbot_part import chat_with_closet  # 우리가 구체화한 챗봇 함수

app = Flask(__name__)
CORS(app)  # 다른 도메인(앱 등)에서 접근할 수 있게 허용

# 🏠 1. [추가] 사용자가 처음 웹사이트(http://127.0.0.1:5000)에 접속했을 때 화면 띄우기
@app.route('/')
def index():
    return render_template('index.html')


# 📸 2. [기존 유지] 앱/웹에서 사진 주소를 받아 분석하고 DB에 등록하는 라우트
@app.route('/analyze', methods=['POST'])
def analyze_image():
    data = request.json
    user_id = data.get('user_id')
    image_path = data.get('image_path')

    if not user_id or not image_path:
        return jsonify({"error": "데이터가 부족합니다."}), 400

    try:
        # 기존 main.py의 분석 및 저장 로직 호출
        path, cat, st, col = main.process_and_save(user_id, image_path)
        
        return jsonify({
            "status": "success",
            "category": cat,
            "style": st,
            "color": col,
            "image_url": path
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔍 3. [추가] 옷 ID 숫자를 주면 DB에서 '진짜 이미지 경로'를 찾아오는 도우미 함수
def get_image_path_by_id(clothing_id):
    if not clothing_id or clothing_id == "null" or clothing_id == "":
        return None
        
    try:
        # 질문자님의 진짜 DB 연결!
        conn = sqlite3.connect('codi_v2.db') 
        cursor = conn.cursor()
        
        cursor.execute("SELECT processed_image FROM clothes WHERE clothes_id = ?", (clothing_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row and row[0]:
            db_path = row[0] # 예: 'output\skirt_no_bg.png'
            
            # 🌟 [방금 추가한 마법의 코드] 
            # 역슬래시(\)를 슬래시(/)로 바꾸고, 앞에 'static/'을 강제로 붙여줍니다!
            clean_path = db_path.replace('\\', '/')
            if not clean_path.startswith('static/'):
                clean_path = 'static/' + clean_path
                
            return clean_path  # 프론트엔드가 쓰기 딱 좋은 주소로 변신 완료!
            
        return None
    except Exception as e:
        print(f"❌ DB 이미지 경로 조회 오류: {e}")
        return None
# 💬 4. [추가] 사용자와 챗봇이 대화하고 사진 주소까지 연동해주는 라우트
@app.route('/chat', methods=['POST'])
def chat_api():
    user_data = request.json
    user_message = user_data.get('message', '')
    
    # 챗봇(Groq)에게 메시지를 던져 JSON 포맷의 대답 문자열을 받음
    ai_string_response = chat_with_closet(user_message)
    print(f"\n🤖 [서버 내부 로그] AI가 반환한 JSON: {ai_string_response}\n")
    
    try:
        # 문자열을 파이썬 딕셔너리로 변환
        ai_json = json.loads(ai_string_response)
        
        # 🌟 AI가 고른 ID 번호들을 쏙쏙 뽑아내기
        top_id = ai_json.get('top')
        bottom_id = ai_json.get('bottom')
        outer_id = ai_json.get('outer')
        shoes_id = ai_json.get('shoes')
        bag_id = ai_json.get('bag')
        accessory_id = ai_json.get('accessory')
        
        # 🌟 도우미 함수를 거쳐 숫자 ID를 '진짜 사진 주소'로 교환!
        top_src = get_image_path_by_id(top_id)
        bottom_src = get_image_path_by_id(bottom_id)
        outer_src = get_image_path_by_id(outer_id)
        shoes_src = get_image_path_by_id(shoes_id)
        bag_src = get_image_path_by_id(bag_id)
        accessory_src = get_image_path_by_id(accessory_id)
        
        # 프론트엔드가 받아서 요리하기 좋게 최종 패키징해서 응답
        return jsonify({
            "success": True,
            "message": ai_json.get('message'),  # 말풍선 텍스트 ("원하시는 스타일이 있나요?" 등)
            "images": {
                "top": top_src,
                "bottom": bottom_src,
                "outer": outer_src,
                "shoes": shoes_src,
                "bag": bag_src,
                "accessory": accessory_src
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"코디 생성 처리 중 오류가 발생했습니다. (에러: {e})",
            "images": {}
        })

# 📂 1. 프론트엔드가 "저장할 폴더 목록 보여주게 리스트 좀 줘!" 할 때 보내주는 API
@app.route('/get-collections', methods=['GET'])
def get_collections():
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()
        # 일단 테스트용 유저인 'su_ryong'의 폴더 목록을 가져옵니다.
        cursor.execute("SELECT collection_id, collection_name FROM collections WHERE user_id = 'su_ryong'")
        rows = cursor.fetchall()
        conn.close()
        
        # 프론트엔드가 쓰기 좋게 배열(리스트) 형태로 이쁘게 포장합니다.
        collection_list = []
        for row in rows:
            collection_list.append({
                "id": row[0],
                "name": row[1]
            })
            
        return jsonify({"success": True, "collections": collection_list})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


# 💾 2. 프론트엔드가 폴더 고르고 [저장하기] 버튼 최종 클릭했을 때 DB에 인서트하는 API
@app.route('/save-outfit', methods=['POST'])
def save_outfit():
    data = request.json  # 프론트가 보낸 데이터 덩어리 받기
    
    user_id = 'su_ryong' # 지금은 로그인 기능이 없으니 임시 고정!
    collection_id = data.get('collection_id') # 사용자가 선택한 폴더 ID
    
    # AI가 추천해줬던 옷들의 진짜 이미지 경로 혹은 ID를 받습니다.
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
        
        # DB에 사용자가 고른 폴더와 옷 조합을 쏙 집어넣습니다.
        cursor.execute("""
            INSERT INTO saved_outfits (user_id, collection_id, top_id, bottom_id, outer_id, shoes_id, bag_id, accessory_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, collection_id, top, bottom, outer, shoes, bag, accessory))
        
        conn.commit()
        conn.close()
        
        # 기획서 5번에 있는 "저장 완료 토스트 메시지"를 띄우도록 성공 신호를 보냅니다!
        return jsonify({"success": True, "message": "코디가 성공적으로 저장되었습니다! ❤️"})
    except Exception as e:
        return jsonify({"success": False, "message": f"저장 실패 ㅠㅠ 에러: {e}"})      

@app.route('/chat-room/create', methods=['POST'])
def create_chat_room():
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()
        cursor.execute("INSERT INTO chat_rooms (user_id, room_title) VALUES ('su_ryong', '새 채팅')")
        new_room_id = cursor.lastrowid # 방금 만들어진 방 번호
        conn.commit()
        conn.close()
        return jsonify({"success": True, "room_id": new_room_id, "title": "새 채팅"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}) 

@app.route('/chat-room/pin', methods=['POST'])
def pin_chat_room():
    data = request.json
    room_id = data.get('room_id')
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()
        # 현재 고정 상태를 반대로 토글 (0이면 1로, 1이면 0으로)
        cursor.execute("UPDATE chat_rooms SET is_pinned = NOT is_pinned WHERE room_id = ?", (room_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "고정 상태가 변경되었습니다."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

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
        return jsonify({"success": False, "error": str(e)})

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
        return jsonify({"success": False, "error": str(e)})

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
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)