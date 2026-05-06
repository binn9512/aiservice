from flask import Flask, request, jsonify
from flask_cors import CORS
import main  # 우리가 만든 main.py를 가져옵니다
import os

app = Flask(__name__)
CORS(app)  # 다른 도메인(앱 등)에서 접근할 수 있게 허용

@app.route('/analyze', methods=['POST'])
def analyze_image():
    # 1. 앱으로부터 데이터 받기 (JSON 형식)
    data = request.json
    user_id = data.get('user_id')
    image_path = data.get('image_path') # 실제 앱에선 파일 전송 방식을 쓰지만, 지금은 경로로 테스트!

    if not user_id or not image_path:
        return jsonify({"error": "데이터가 부족합니다."}), 400

    try:
        # 2. 우리가 만든 분석+저장 함수 실행
        # main.py의 process_and_save 함수를 호출합니다.
        path, cat, st, col = main.process_and_save(user_id, image_path)
        
        # 3. 분석 결과를 앱에 응답으로 보내주기
        return jsonify({
            "status": "success",
            "category": cat,
            "style": st,
            "color": col,
            "image_url": path
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)