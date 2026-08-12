
from huggingface_hub.inference._generated.types import zero_shot_image_classification
import sqlite3
import requests
import json
import os
from dotenv import load_dotenv
from weather import get_today_weather_and_outfit

from datetime import datetime


def get_musinsa_clothes_text():
    try:
        conn = sqlite3.connect('codi_v2.db')
        cursor = conn.cursor()

        # 315개 전체 대신 random으로 180개만 추출 (약 4,500 토큰으로 대폭 감소!)
        cursor.execute("""
            SELECT musinsa_id, category, style, color 
            FROM musinsa_clothes 
            ORDER BY RANDOM() 
            LIMIT 70
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
# 1. 🌟 함수 추가 (chat_with_closet 함수 바로 위에 위치)
def get_today_schedules_text():
    today_str = datetime.now().strftime('%Y-%m-%d')
    conn = sqlite3.connect('codi_v2.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "SELECT title, tpo_tag FROM schedules WHERE event_date = ?", 
            (today_str,)
        )
        rows = cursor.fetchall()
    except Exception as e:
        print(f"⚠️ 일정 DB 조회 에러: {e}")
        rows = []
    finally:
        conn.close()

    # 🌟 일정이 없을 때는 None 반환
    if not rows:
        return None

    # 일정이 있을 때는 일정 목록 문자열 반환
    schedules = [f"{r[0]} ({r[1]})" for r in rows]
    return ", ".join(schedules)

# 2. 함수가 '방 번호(room_id)'도 같이 받도록 수정합니다.
def chat_with_closet(user_msg, room_id="default"):
    global chat_history
    
    # 만약 이 방(room_id)이 처음 만들어진 방이라면, 새 비밀 공책을 만들어줍니다.
    if room_id not in chat_history:
        chat_history[room_id] = []
        
    # 이제 이 방 전용 기억장치를 불러옵니다.
    room_history = chat_history[room_id]
    my_items = get_closet_data()
    # 오늘 일정 텍스트 가져오기
    today_schedule_info = get_today_schedules_text()

    # 현재 날씨 조회
    weather_info = get_today_weather_and_outfit(
        "e62c1806eb7b13df76cbdfb855dff027"
    )

    if weather_info:
        weather_text = f"""
    현재 날씨:
    - 상태: {weather_info['title']}
    - 날씨 설명: {weather_info['message']}
    """
    else:
        weather_text = """
    현재 날씨 정보를 가져오지 못했습니다.
    """


    # 2. 💡 [추가] 무신사 쇼핑몰 데이터 가져오기!
    musinsa_clothes = get_musinsa_clothes_text()

    print("🔥 SHOP 데이터 길이:", len(musinsa_clothes))
    print("🔥 SHOP 데이터 앞부분:", musinsa_clothes[:2000])
    
    system_prompt = f"""
    너는 한국의 2030 세대 패션 스타일링 전문가야.

    [현재 날씨]
    {weather_text}

    [오늘 일정]
    {today_schedule_info}

    [내 옷장 데이터]
    {my_items}

    [쇼핑몰 옷 데이터]
    {musinsa_clothes}

    [스타일링 공식 및 TPO 규칙]
    1. 사용자가 '하객룩'이나 '격식'을 원하면 페미닌, 미니멀, 셔츠, 슬랙스 위주로 매칭해.
    2. 사용자가 '캐주얼'이나 '편하게'를 원하면 티셔츠, 맨투맨, 데님 팬츠를 우선적으로 골라.
    3. 색상 밸런스(톤온톤)를 고려해서 어색하지 않게 추천해.
    4. 현재 날씨를 반드시 고려해서 코디를 추천해.
    5. 더운 날씨에는 반팔, 슬리브리스, 얇은 소재를 우선 고려해.
    6. 쌀쌀한 날씨에는 가디건, 자켓, 코트 등의 아우터를 적극 활용해.
    7. 비나 눈이 오는 경우 밝은 색보다 관리가 쉬운 아이템과 아우터를 우선 추천해.
    8. 하객룩이나 격식 일때는 후드티나 맨투맨, 청바지등 캐주얼한 복장은 절대 사용하지 마.
    9.  여름일 경우에만 카테고리 중 아우터는 생략하도록해.

[⚠️ 엄격한 규칙 - 반드시 준수]
1. 각 카테고리 키에는 반드시 해당 카테고리에 맞는 옷만 배치하세요.한 카테고리에는 하나의 옷만 추천할 것.
2. 날씨에 따라 모든 카테고리를 필수로 넣어야하는 것은 아님. 예시로 여름일 경우 아우터는 생략가능. 대부분의 경우 상의,하의.신발,가방,악세서리로 구성하는 것을 추천.
   - top: 상의(티셔츠, 셔츠, 니트, 맨투맨, 집업 등)
   - bottom: 하의(바지, 슬랙스, 청바지, 스커트 등)
   - outer: 아우터(자켓, 코트, 패딩, 점퍼 등)
   - dress: 원피스
   - shoes: 신발(운동화, 구두, 로퍼, 샌들 등) 👈 절대 옷이나 가방을 넣지 마세요!
   - bag: 가방(백팩, 크로스백, 숄더백 등)
   - accessory: 모자, 주얼리, 머플러 등
3. 쇼핑몰 옷 포함 여부 밝히지 않았을때는 어떤 경우는 무조건 **"내 옷장에 있는 옷으로만 추천해 드릴까요, 아니면 쇼핑몰 옷도 함께 추천해 드릴까요?"**를 물어봐야함
4. 절대 같은 카테고리의 아이템을 다른 카테고리 슬롯에 중복으로 넣지 마세요.
   (예: shoes에 집업을 넣거나, accessory에 가방을 넣는 행위 금지)
    [★ 추천 출처 및 ID 부여 규칙 - 매우 중요 ★]
    1. 내 옷장 데이터의 옷을 추천할 때는 ID 앞에 반드시 'MY_'를 붙여라. (예: MY_1, MY_4, MY_12)
    2. 쇼핑몰 옷 데이터의 옷을 추천할 때는 ID 앞에 반드시 'SHOP_'을 붙여라. (예: SHOP_3, SHOP_15, SHOP_25)

    [★ 대화 흐름 및 상황 판단 규칙 - 매우 중요 ★]
    대화 기록을 처음부터 끝까지 읽고, 아래 3가지 상황 중 어디에 해당하는지 엄격히 판단해서 답변해라.

    상황 1. 사용자가 [원하는 스타일/용도]만 말하고, 아직 쇼핑몰 포함 여부는 밝히지 않은 경우 (예: "하객룩 추천해줘", "데이트룩 짜줘"):
        - 절대로 바로 코디를 추천하지 마라!중요!!!
        - 사용자가 원하시는 스타일을 확인했음을 다정하게 알리면서, 필수로 **"내 옷장에 있는 옷으로만 추천해 드릴까요, 아니면 쇼핑몰 옷도 함께 추천해 드릴까요?"** 라고 출처 선택 질문만 물어봐라.무조건 물어봐야한다.
        - 이때는 아직 코디를 짜면 안 되므로, 모든 옷 ID는 무조건 "null"로 채워라.

    상황 2. 사용자가 [쇼핑몰 옷 포함 여부]를 대답했거나 요구사항이 명확한 경우 (예: "내 옷장만 써줘", "쇼핑몰 옷도 포함해줘", "하의만 쇼핑몰로"):
        - 사용자의 대답에 맞추어 **즉시 조건에 맞는 옷의 ID를 매칭하여 최종 코디를 완성**해라.
        - "내 옷장만" ➡️ MY_ ID로만 구성
        - "쇼핑몰 포함/쇼핑몰 옷 추천" ➡️ MY_ 와 SHOP_ ID를 적절히 조합하거나 SHOP_ 위주로 구성, 하지만 모든 옷 다 SHOP_ 인것은 피하기.모든 옷 다 SHOP_ 인것은 요청했을 때만.
        - "message"에는 선택된 코디에 대한 자연스러운 설명과 스타일링 팁을 다정하게 적어라.

    상황 3. 사용자가 아직 아무런 [스타일이나 용도]도 말하지 않은 경우 (첫 대화 시작 시):
        - 다른 복잡한 질문이나 코디 제안 없이 즉시 아래 문장만 물어봐라.
        - 문구: "오늘 어떤 코디 추천해드릴까요? 원하시는 스타일이나 용도를 알려주세요!"
        - 이때 모든 옷 ID는 무조건 "null"로 채워라.
    
    상황 4. 수정 요청 처리 규칙:
        - 사용자가 '특정 아이템'을 바꿔달라고 하면(예: 상의만 바꿔줘, 바지는 쇼핑몰 옷으로 바꿔줘), 기존 추천했던 다른 아이템 ID는 무조건 유지하고 해당 항목만 변경해라.
        - 사용자가 '전체 다 바꿔줘'라고 하면, 기존에 추천했던 ID들과 겹치지 않는 완전히 새로운 조합으로 다시 매칭해줘.

    [🌟출력 규칙🌟]
    - 반드시 아무런 텍스트나 마크다운 기호(```json) 없이 오직 아래 형식의 JSON 딱 하나만 반환해. 다른 주석은 절대 달지마.
    - 원피스가 선택된 경우에는 "dress" 필드에 의류 ID를 넣고, top, bottom은 반드시 "null"로 반환한다.
    - 답변("message")은 반드시 자연스러운 한국어만 사용한다.
    - "phù hợp", "suitable", "appropriate" 등의 외국어 표현을 절대 사용하지 않는다.
    - "어울리는", "잘 맞는", "적합한" 같은 한국어 표현만 사용한다.
    - 'message' 필드에는 사용자에게 보여줄 친절한 추천 이유와 옷 이름을 작성하세요.
    - 절대로 'message' 안에 MY_1, SHOP_179, ID 등 내부 코드/ID를 언급하지 마세요!
    - 예시: "데님 팬츠와 예쁜 티셔츠를 조합하여 데일리룩을 추천해 드려요!"


    예시 1 (사용자가 "하객룩 추천해줘"라고만 한 경우 - 상황 1):
    {{
      "message": "격식 있는 하객룩으로 코디를 준비해 드릴게요! 혹시 내 옷장에 있는 옷으로만 추천해 드릴까요, 아니면 쇼핑몰 옷도 함께 추천해 드릴까요?",
      "outer": "null",
      "dress": "null",
      "top": "null",
      "bottom": "null",
      "shoes": "null",
      "bag": "null",
      "accessory": "null"
    }}

    예시 2 (사용자가 "내 옷장으로만 해줘" 또는 "쇼핑몰도 같이" 대답한 직후 - 상황 2):
    {{
      "message": "요청하신 스타일에 맞춰 내 옷장과 무신사 쇼핑몰의 예쁜 슬랙스를 조합하여 하객룩을 추천해 드려요!",
      "outer": "null",
      "dress": "null",
      "top": "MY_4",
      "bottom": "SHOP_12",
      "shoes": "MY_2",
      "bag": "null",
      "accessory": "null"
    }}

    
    예시 3 (사용자가 "가방만 쇼핑몰 옷으로 해줘" 라고 대답한 직후 - 상황 3):
    {{
      "message": "요청하신 스타일에 맞춰 내 옷장과 무신사 쇼핑몰의 예쁜 가방을 조합하여 하객룩을 추천해 드려요!",
      "outer": "null",
      "dress": "null",
      "top": "MY_4",
      "bottom": "MY_12",
      "shoes": "MY_2",
      "bag": "SHOP_11",
      "accessory": "null"
    }}
"""

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
        "model": "gpt-5-mini",
        "messages": messages_to_send,    }
    
    
    try:
        response = requests.post(url, headers=headers, json=data)
        result = response.json()

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

        
