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
        conn = sqlite3.connect('codi_ai.db')
        cursor = conn.cursor()
        
        # 🔴 중요: 아까 성공했던 테이블과 컬럼 구조(clothes_id)에 맞춰 조회합니다.
        cursor.execute("SELECT processed_image FROM clothes WHERE clothes_id = ?", (clothing_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row and row[0]:
            return row[0]  # 예: 'output/blouse_no_bg.png' 같은 경로 반환
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)