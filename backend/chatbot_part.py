from huggingface_hub.inference._generated.types import zero_shot_image_classification
import sqlite3
import requests
import json
import os
from dotenv import load_dotenv

<<<<<<< Updated upstream
=======
from datetime import datetime
from openai import OpenAI
import sqlite3

import sqlite3


def get_musinsa_clothes_text():
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()

        # 315개 전체 대신 random으로 180개만 추출 (약 4,500 토큰으로 대폭 감소!)
        cursor.execute("""
            SELECT musinsa_id, category, style, color 
            FROM musinsa_clothes 
            ORDER BY RANDOM() 
            LIMIT 150
        """)
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return "데이터 없음"

        # [극한 압축] SHOP_1,백팩,캐주얼,화이트 형식으로 짧게 연결
        items = []
        for r in rows:
            items.append(f"SHOP_{r[0]},{r[1]},{r[2]},{r[3]}")
        
        # 엔터 대신 | 기호로 한 줄로 쭉 이어붙이기
        return "|".join(items)
        
    except Exception as e:
        return "오류"
>>>>>>> Stashed changes
# .env 파일에 적힌 비밀키들을 컴퓨터 메모리로 읽어옵니다.
load_dotenv() 

# 1. 이제 안전하게 .env에서 키를 가져오므로 깃허브 보디가드가 통과시켜 줍니다!
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

# 🧠 핵심 추가: AI의 기억력을 담당할 대화 기록 저장소
# 1. 기존의 chat_history = [] 를 삭제하고, 방 여러 개를 담을 상자로 변경!
chat_history = {} 


def get_closet_data():
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()
        cursor.execute("SELECT clothes_id,category, style, color FROM clothes")
        rows = cursor.fetchall()
        conn.close()
        if not rows: return "옷장이 비어있음"
        items = [f"[ID:{r[0]} | 종류:{r[1]} | 스타일:{r[2]} | 색상:{r[3]}]" for r in rows]
        return ", ".join(items)
    except Exception as e:
        return f"DB 읽기 오류: {e}"

# 2. 함수가 '방 번호(room_id)'도 같이 받도록 수정합니다.
def chat_with_closet(user_msg, room_id="default"):
    global chat_history
    
    # 만약 이 방(room_id)이 처음 만들어진 방이라면, 새 비밀 공책을 만들어줍니다.
    if room_id not in chat_history:
        chat_history[room_id] = []
        
    # 이제 이 방 전용 기억장치를 불러옵니다.
    room_history = chat_history[room_id]
    my_items = get_closet_data()

    
    system_prompt = f"""
    너는 한국의 2030 세대 패션 스타일링 전문가야.
    
    [내 옷장 데이터]
    {my_items}

    [스타일링 공식 및 TPO 규칙]
    1. 사용자가 '하객룩'이나 '격식'을 원하면 페미닌, 미니멀, 셔츠, 슬랙스 위주로 매칭해.
    2. 사용자가 '캐주얼'이나 '편하게'를 원하면 티셔츠, 맨투맨, 데님 팬츠를 우선적으로 골라.
    3. 색상 밸런스(톤온톤)를 고려해서 어색하지 않게 추천해.

    [★ 작동 로직 및 상황 판단 규칙 - 매우 중요 ★]
    대화 기록을 처음부터 끝까지 읽고, 아래 2가지 상황 중 어디에 해당하는지 판단해서 답변해라.

    상황 1. 사용자가 원하는 [스타일 및 TPO](예: 데이트룩, 하객룩, 출근룩 등)를 말한 경우:
        - 다른 질문으로 단계를 끌지 말고, 사용자가 말한 스타일에 맞춰 **즉시 [내 옷장 데이터]에서 조건에 맞는 옷의 ID를 매칭하여 코디를 완성**해라.
        - "message"에는 "요청하신 스타일에 맞춰 코디를 준비했습니다!" 처럼 확정된 코디 설명과 스타일링 팁을 다정하게 적어라.

<<<<<<< Updated upstream
    상황 2. 사용자가 아직 아무런 [스타일이나 요구사항]도 말하지 않은 경우 (첫 대화 시작 시):
=======
    상황 1. 사용자가 [원하는 스타일/용도]만 말하고, 아직 쇼핑몰 포함 여부는 밝히지 않은 경우 (예: "하객룩 추천해줘", "데이트룩 짜줘"):
        - 절대로 바로 코디를 추천하지 마라!중요!!!
        - 사용자가 원하시는 스타일을 확인했음을 다정하게 알리면서, 필수로 **"내 옷장에 있는 옷으로만 추천해 드릴까요, 아니면 쇼핑몰 옷도 함께 추천해 드릴까요?"** 라고 출처 선택 질문만 물어봐라.무조건 물어봐야한다.
        - 이때는 아직 코디를 짜면 안 되므로, 모든 옷 ID는 무조건 "null"로 채워라.

    상황 2. 사용자가 [쇼핑몰 옷 포함 여부]를 대답했거나 요구사항이 명확한 경우 (예: "내 옷장만 써줘", "쇼핑몰 옷도 포함해줘", "하의만 쇼핑몰로"):
        - 사용자의 대답에 맞추어 **즉시 조건에 맞는 옷의 ID를 매칭하여 최종 코디를 완성**해라.
        - "내 옷장만" ➡️ MY_ ID로만 구성
        - "쇼핑몰 포함/쇼핑몰 옷 추천" ➡️ MY_ 와 SHOP_ ID를 적절히 조합하거나 SHOP_ 위주로 구성, 하지만 모든 옷 다 SHOP_ 인것은 피하기.모든 옷 다 SHOP_ 인것은 요청했을 때만.
        - "message"에는 선택된 코디에 대한 자연스러운 설명과 스타일링 팁을 다정하게 적어라.답변은 최대한 2-3문장으로 간결하게 해줘 

    상황 3. 사용자가 아직 아무런 [스타일이나 용도]도 말하지 않은 경우 (첫 대화 시작 시):
>>>>>>> Stashed changes
        - 다른 복잡한 질문이나 코디 제안 없이 즉시 아래 문장만 물어봐라.
        - 문구: "오늘 어떤 코디 추천해드릴까요? 원하시는 스타일이나 용도를 알려주세요!"
        - 이때는 아직 코디를 짜면 안 되므로, 모든 옷 ID는 무조건 "null"로 채워라.
    
    3. 수정 요청 처리 규칙:
        - 사용자가 '특정 아이템'을 바꿔달라고 하면(예: 상의만 바꿔줘), 기존 추천했던 하의나 아우터 ID는 이전 대화 기록에서 찾아 '그대로 유지'하고, 해당 상의 ID만 다른 것으로 변경해.
        - 사용자가 '전체 다 바꿔줘'라고 하면, 기존에 추천했던 ID들과 겹치지 않는 완전히 새로운 조합으로 다시 매칭해줘.
        - "message"에는 사용자의 불만 사항을 반영했다는 멘트를 다정하게 적어줘.

    [🌟출력 규칙🌟]
    - 반드시 아무런 텍스트나 마크다운 기호(```json) 없이 오직 아래 형식의 JSON 딱 하나만 반환해. 다른 주석은 절대 달지마.
    -답변("message")은 단 한 글자도 빠짐없이 무조건 100% 순수한 한국어로만 작성하세요.

    예시 1 (첫 대화 시작 시 - 상황 2):
    {{
      "message": "오늘 어떤 코디 추천해드릴까요? 원하시는 스타일이나 용도를 알려주세요!",
      "top": "null",
      "bottom": "null",
      "outer": "null",
      "shoes": "null",
      "bag": "null",
      "accessory": "null"
    }}

    예시 2 (스타일 확인 후 즉시 추천 또는 수정할 때 - 상황 1):
    {{
      "message": "요청하신 스타일에 맞춰 내 옷장 안의 아이템들로 단정하게 코디해 보았습니다!",
      "top": "1",
      "bottom": "3",
      "outer": "null",
      "shoes": "null",
      "bag": "null",
      "accessory": "null"
    }}
    """
    
    # 원래 있던 코드 위치 주변에 아래 print를 추가합니다.
    print(f"🔥 지금 서버가 발송하는 API 키: {OPENAI_API_KEY}")

    # ⭐ 주소가 Groq 전용으로 바뀌었습니다!
    url = "https://api.openai.com/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }

    # 🧠 3번 기능(기억력) 작동: 시스템 규칙 + 과거 대화 내용 + 이번 질문을 합쳐서 보냄
    messages_to_send = [{"role": "system", "content": system_prompt}]
    messages_to_send.extend(room_history) # 과거 대화 추가
    messages_to_send.append({"role": "user", "content": user_msg}) # 현재 질문 추가
    
    data = {
<<<<<<< Updated upstream
        "model": "llama-3.3-70b-versatile",
        "messages": messages_to_send,
        "temperature": 0.45 # 설명을 해야 하니 창의성을 살짝(0.3) 올려줍니다.
=======
        "model": "gpt-5-mini",
        "messages": messages_to_send,
        
>>>>>>> Stashed changes
    }
    
    
    try:
        response = requests.post(url, headers=headers, json=data)
        result = response.json()
<<<<<<< Updated upstream
        
        if 'choices' in result:
            ai_answer = result['choices'][0]['message']['content'].strip()
=======

        print("🔥 OPENAI 응답:", result)

        if 'choices' not in result:

            if (
                "error" in result
                and result["error"].get("code")
                == "rate_limit_exceeded"
            ):
                return json.dumps({
                    "message":
                        "현재 AI 서버 사용량이 많아 잠시 후 다시 시도해주세요 🙏",
                    "outer": "null",
                    "dress": "null",
                    "top": "null",
                    "bottom": "null",
                    "shoes": "null",
                    "bag": "null",
                    "accessory": "null"
                })

            return json.dumps({
                "message":
                    "코디 생성 중 오류가 발생했습니다.",
                "outer": "null",
                "dress": "null",
                "top": "null",
                "bottom": "null",
                "shoes": "null",
                "bag": "null",
                "accessory": "null"
            })

        ai_answer = result['choices'][0]['message']['content'].strip()
>>>>>>> Stashed changes
        
        # 🧠 [채빈님이 물어보신 핵심 구역 수정!] 
        # 공용이 아니라 '이 채팅방 공책'에만 질문과 답변을 저장합니다!
        room_history.append({"role": "user", "content": user_msg})
        room_history.append({"role": "assistant", "content": ai_answer})
        
        # 이 방의 대화가 20개가 넘어가면 앞부분 2개 삭제 (방별로 개별 적용)
        if len(room_history) > 20: 
            del room_history[0:2]
            
        return ai_answer
    except Exception as e:
        return f"⚠️ 통신 에러: {e}"

if __name__ == "__main__":
    print("마이베프: 안녕! 어떤 코디를 추천해드릴까요? ")
    while True:
        text = input("\n나: ")
        if text in ["그만", "종료"]: break
        print("마이베프:", chat_with_closet(text))

        
