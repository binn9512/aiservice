import sqlite3
import google.generativeai as genai
import json

# 1. Gemini API 설정
GEMINI_API_KEY = "AIzaSyAGaWclbvrj6xzrZksPREa17EbOyPSw9hY"  # 발급받으신 Gemini API 키를 입력하세요
genai.configure(api_key=GEMINI_API_KEY)

def get_closet_data(user_id):
    """DB에서 특정 사용자의 옷장 데이터를 가져와 문자열로 포맷팅합니다."""
    conn = sqlite3.connect('codi_ai.db')
    cursor = conn.cursor()
    
    # 앞서 생성한 테이블 구조(ID, 카테고리, 스타일)에 맞게 데이터를 가져옵니다.
    # 만약 테이블에 '색상(color)' 컬럼을 추가하셨다면 SELECT문에 추가하시면 됩니다!
    cursor.execute("SELECT clothes_id, category, style FROM clothes WHERE user_id = ?", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return "옷장이 비어 있습니다."
    
    # 이미지 예시와 똑같은 형식으로 텍스트 정렬
    # 예시: [ID:1 | 종류:상의 | 스타일:캐주얼]
    closet_items = []
    for row in rows:
        item_str = f"[ID:{row[0]} | 종류:{row[1]} | 스타일:{row[2]}]"
        closet_items.append(item_str)
        
    return ", ".join(closet_items)

def chat_with_closet(user_id, user_msg):
    """사용자의 질문과 DB의 옷장 정보를 Gemini AI에게 전달하여 코디를 추천받습니다."""
    
    # 1. 실제 DB에서 내 옷장 데이터 읽어오기
    closet_info = get_closet_data(user_id)
    
    # 터미널에 AI가 읽는 데이터 로그 출력 (이미지 시안 반영)
    print(f"\n🚨 [긴급 점검] AI가 읽고 있는 내 옷장:\n{closet_info}\n")
    
    # 2. Gemini AI에게 부여할 역할 및 규칙 (System Instruction)
    system_prompt = """
    당신은 사용자의 옷장 데이터를 기반으로 의류를 추천해주는 전문 패션 스타일리스트 챗봇입니다.
    사용자의 요청(예: 출근룩, 데이트룩 등)과 제공된 옷장 리스트를 보고 가장 잘 어울리는 옷들의 ID를 매칭해 안성맞춤 코디를 제안해야 합니다.
    
    반드시 아래의 순수한 JSON 구조로만 답변하세요. 다른 설명이나 텍스트(예: "추천해 드리겠습니다" 등)는 절대로 붙이지 마세요.
    추천할 아이템이 없는 카테고리는 "null"로 처리하세요.
    
    {
      "top": "선택한 상의 ID 또는 null",
      "bottom": "선택한 하의 ID 또는 null",
      "shoes": "선택한 신발 ID 또는 null",
      "bag": "선택한 가방 ID 또는 null",
      "accessory": "선택한 액세서리 ID 또는 null"
    }
    """
    
    # 3. 모델 설정 및 시스템 프롬프트 주입
    # 가장 빠르고 가성비가 좋은 gemini-1.5-flash 모델을 사용합니다.
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=system_prompt
    )
    
    user_prompt = f"""
    사용자 요청: {user_msg}
    내 옷장 데이터: {closet_info}
    """
    
    # 4. API 요청 및 결과 반환
    try:
        response = model.generate_content(
            user_prompt,
            # 💡 중요: 답변 포맷을 JSON으로 강제하여 껍데기만 깔끔하게 나오도록 설정합니다.
            generation_config={"response_mime_type": "application/json"}
        )
        return response.text
        
    except Exception as e:
        return f"⚠️ 통신 에러: {e}"

# --- 챗봇 구동부 ---
if __name__ == "__main__":
    print("🚀 Gemini 패션 비서가 가동되었습니다!")
    
    # 테스트용 사용자 ID
    TARGET_USER = "sungshin_user_01" 
    
    while True:
        text = input("\n나: ")
        if text in ["그만", "종료", "exit"]:
            print("👋 패션 비서 서비스를 종료합니다.")
            break
            
        # 챗봇 함수 호출
        ai_response = chat_with_closet(TARGET_USER, text)
        print(f"🤖 (Gemini):\n{ai_response}")