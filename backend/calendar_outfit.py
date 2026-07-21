import json
from datetime import datetime, timedelta, timezone

import requests

import google_calendar as gcal
from chatbot_part import GROQ_API_KEY, get_closet_data
from weather import get_today_weather_and_outfit

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"
KST = timezone(timedelta(hours=9))
OPEN_WEATHER_KEY = "e62c1806eb7b13df76cbdfb855dff027"  # 기존 weather.py/app.py와 동일한 값

# room_id별 캘린더 추천 대화 맥락 - chatbot_part.chat_history와 동일한 인메모리 관례(서버 재시작 시 소실)
schedule_context = {}

CALENDAR_KEYWORDS = ["일정", "캘린더", "calendar", "약속", "회의", "미팅"]
OUTFIT_KEYWORDS = ["뭐 입", "뭐입", "코디", "옷 추천", "입을까", "입지", "룩 추천", "옷 골라"]
CONNECT_KEYWORDS = ["캘린더 연결", "구글 캘린더", "google calendar", "캘린더 연동"]
DATE_WORDS = ["오늘", "내일", "모레", "이번 주", "이번주"]


# =========================================================================
# 의도 판별 (LLM 미사용 - 결정적 키워드 매칭)
# =========================================================================

def detect_calendar_intent(text, room_id="default"):
    """
    반환값: 'calendar_connect' | 'calendar_outfit_query' | 'calendar_query' | 'followup_context' | None
    None이면 캘린더와 무관 -> 기존 /chat(옷장 기반) 흐름으로 처리.
    """
    context = schedule_context.get(room_id)
    if context and context.get("recommendationStage") == "clarifying":
        return "followup_context"

    if any(k in text for k in CONNECT_KEYWORDS):
        return "calendar_connect"

    has_calendar_word = any(k in text for k in CALENDAR_KEYWORDS)
    has_date_word = any(k in text for k in DATE_WORDS)
    has_outfit_word = any(k in text for k in OUTFIT_KEYWORDS)

    if has_date_word and has_outfit_word:
        return "calendar_outfit_query"
    if has_calendar_word and has_outfit_word:
        return "calendar_outfit_query"
    if has_date_word and has_calendar_word:
        return "calendar_query"

    return None


def resolve_date_range(text):
    """사용자 메시지에서 날짜 범위를 판단해 (dateLabel, timeMin, timeMax) RFC3339로 반환한다."""
    now = datetime.now(KST)

    if "이번 주" in text or "이번주" in text:
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=(7 - now.weekday()))
        return "이번 주", start.isoformat(), end.isoformat()

    if "모레" in text:
        target = now + timedelta(days=2)
        label = "모레"
    elif "내일" in text:
        target = now + timedelta(days=1)
        label = "내일"
    else:
        target = now
        label = "오늘"

    start = target.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    return label, start.isoformat(), end.isoformat()


# =========================================================================
# Groq 호출 (일정 상황 분류 / 코디 추천 문구 생성)
# =========================================================================

def _call_groq(system_prompt, user_content):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}",
    }
    data = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        "temperature": 0.2,
    }
    response = requests.post(GROQ_URL, headers=headers, json=data, timeout=15)
    result = response.json()
    if "choices" not in result:
        raise RuntimeError(result.get("error", {}).get("message", "Groq 호출 실패"))
    return result["choices"][0]["message"]["content"].strip()


CLASSIFY_SYSTEM_PROMPT = """
너는 한국어 일정 텍스트를 보고 옷차림 목적(occasion)을 분류하는 전문가야.

[분류 카테고리]
date, office, business, formal, casual, outdoor, exercise, travel, school, dining, medical, home, unknown

[격식 수준] casual, smart-casual, business-casual, formal
[실내외] indoor, outdoor, mixed, unknown

일정 제목만으로 무리하게 단정하지 말고, 애매하면 confidence를 0.5 이하로 낮게 주고,
정말 알 수 없으면 category를 "unknown"으로 답해.

반드시 아래 JSON 형식만, 다른 텍스트 없이 반환해:
{"category": "...", "formality": "...", "indoorOutdoor": "...", "confidence": 0.0}
"""


def classify_event(event):
    user_content = json.dumps({
        "title": event.get("title"),
        "description": event.get("description"),
        "location": event.get("location"),
        "start": event.get("start"),
        "end": event.get("end"),
    }, ensure_ascii=False)

    try:
        raw = _call_groq(CLASSIFY_SYSTEM_PROMPT, user_content)
        parsed = json.loads(raw)
        return {
            "category": parsed.get("category", "unknown"),
            "formality": parsed.get("formality", "casual"),
            "indoorOutdoor": parsed.get("indoorOutdoor", "unknown"),
            "confidence": float(parsed.get("confidence", 0.5)),
        }
    except Exception:
        return {"category": "unknown", "formality": "casual", "indoorOutdoor": "unknown", "confidence": 0.0}


RECOMMEND_SYSTEM_PROMPT = """
너는 한국의 2030 세대를 위한 "일정 기반" 패션 스타일링 챗봇이야.
일정을 그대로 나열하지 말고, 목적/장소/시간/분위기를 해석해서 자연스러운 코디 대화로 이어가야 해.

[규칙]
1. 일정이 모호하면(예: "약속", "민수 만나기") 코디를 단정적으로 추천하기 전에 핵심 질문 1개만 먼저 해.
   질문 우선순위: 장소/실내·야외 > 격식 수준 > 많이 걷는지 > 원하는 분위기 > 날씨 > 보유한 옷.
   한 번에 최대 1~2개까지만 질문한다.
2. 일정이 여러 개면 가장 격식 높은 일정, 가장 오래 머무는 일정, 이동/전환 가능성을 고려해서
   하루 종일 이어갈 수 있는 "전환형 코디"(transitionPlan)를 제안해.
3. [내 옷장 데이터]에 있는 아이템을 최우선으로 추천하고, 옷장에 없는 아이템을 제안할 때는
   "추가로 고려할 수 있는 아이템"처럼 보유 여부를 명확히 구분해서 말해.
4. 옷장 데이터가 비어있으면 임의로 보유했다고 말하지 말고 일반적인 조합으로 추천한다고 안내해.
5. 날씨 정보가 없으면 사실인 것처럼 지어내지 않는다.
6. previousContext가 있으면(후속 답변 처리 중) 직전 질문에 대한 사용자의 답을 반영해 바로 코디를 확정해.
7. message는 2~4문장의 자연스러운 한국어 존댓말로 작성하고, 외국어 표현은 쓰지 않는다.
8. 절대 마크다운이나 설명 없이 아래 JSON 형식만 반환한다.

출력 JSON 형식:
{
  "assistantMessage": "...",
  "needsClarification": true,
  "clarifyingQuestion": "..." 또는 null,
  "suggestedActions": ["...", "..."],
  "transitionPlan": ["...", "..."] 또는 null
}
"""


def build_schedule_recommendation(date_label, events, weather_text, closet_items, user_message, context=None):
    payload = {
        "dateLabel": date_label,
        "events": events,
        "weather": weather_text,
        "closet": closet_items,
        "userMessage": user_message,
        "previousContext": context or {},
    }
    user_content = json.dumps(payload, ensure_ascii=False)

    try:
        raw = _call_groq(RECOMMEND_SYSTEM_PROMPT, user_content)
        parsed = json.loads(raw)
    except Exception:
        parsed = {
            "assistantMessage": "지금은 일정을 바탕으로 코디를 만들지 못했어요. 장소와 목적을 알려주시면 바로 추천해 드릴게요.",
            "needsClarification": True,
            "clarifyingQuestion": "오늘 어디에서, 어떤 목적으로 있을 일정인가요?",
            "suggestedActions": ["내 옷장에서 고르기"],
            "transitionPlan": None,
        }

    return {
        "assistantMessage": parsed.get("assistantMessage", ""),
        "needsClarification": bool(parsed.get("needsClarification", False)),
        "clarifyingQuestion": parsed.get("clarifyingQuestion"),
        "suggestedActions": parsed.get("suggestedActions") or [],
        "transitionPlan": parsed.get("transitionPlan"),
    }


# =========================================================================
# 오케스트레이션 - app.py가 호출하는 단일 진입점
# =========================================================================

def _events_with_classification(raw_events):
    events = []
    for ev in raw_events:
        merged = dict(ev)
        merged.update(classify_event(ev))
        events.append(merged)
    return events


def generate_schedule_outfit_response(user_message, room_id="default", user_id=None):
    user_id = user_id or gcal.DEFAULT_USER_ID
    intent = detect_calendar_intent(user_message, room_id)

    if intent == "calendar_connect":
        return {
            "intent": "calendar_connect",
            "calendarConnected": gcal.get_account(user_id) is not None,
            "dateLabel": None,
            "events": [],
            "assistantMessage": "설정 화면에서 구글 캘린더를 연결하면 일정에 맞춰 코디를 추천해 드릴 수 있어요.",
            "needsClarification": False,
            "clarifyingQuestion": None,
            "suggestedActions": ["캘린더 연결하기"],
            "transitionPlan": None,
        }

    try:
        access_token = gcal.get_valid_access_token(user_id)
    except gcal.GoogleCalendarError:
        access_token = None

    if not access_token:
        return {
            "intent": intent or "calendar_outfit_query",
            "calendarConnected": False,
            "dateLabel": None,
            "events": [],
            "assistantMessage": (
                "오늘 일정에 맞춰 추천하려면 Google 캘린더 연결이 필요해요.\n"
                "연결하지 않고도 장소와 목적을 알려주시면 추천할 수 있어요."
            ),
            "needsClarification": False,
            "clarifyingQuestion": None,
            "suggestedActions": ["캘린더 연결하기", "직접 장소/목적 입력하기"],
            "transitionPlan": None,
        }

    context = schedule_context.get(room_id)

    if intent == "followup_context" and context:
        date_label = context.get("dateLabel", "오늘")
        time_min = context.get("timeMin")
        time_max = context.get("timeMax")
    else:
        date_label, time_min, time_max = resolve_date_range(user_message)

    try:
        raw_events = gcal.list_events(access_token, time_min, time_max)
    except Exception:
        return {
            "intent": intent or "calendar_outfit_query",
            "calendarConnected": True,
            "dateLabel": date_label,
            "events": [],
            "assistantMessage": "지금은 캘린더 정보를 불러오지 못했어요.\n일정 장소와 목적을 직접 알려주시면 바로 추천해 드릴게요.",
            "needsClarification": False,
            "clarifyingQuestion": None,
            "suggestedActions": [],
            "transitionPlan": None,
        }

    if not raw_events:
        schedule_context.pop(room_id, None)
        return {
            "intent": intent or "calendar_outfit_query",
            "calendarConnected": True,
            "dateLabel": date_label,
            "events": [],
            "assistantMessage": (
                f"{date_label} 등록된 일정은 없어요.\n"
                "외출 계획이 있다면 어디에 가는지 알려주세요. "
                "집에서 쉬는 날이라면 편안한 원마일웨어도 추천할 수 있어요."
            ),
            "needsClarification": False,
            "clarifyingQuestion": None,
            "suggestedActions": ["편안한 홈웨어 추천받기"],
            "transitionPlan": None,
        }

    events = _events_with_classification(raw_events)

    weather_info = get_today_weather_and_outfit(OPEN_WEATHER_KEY)
    weather_text = f"{weather_info['title']} - {weather_info['message']}" if weather_info else None

    closet_items = get_closet_data()

    previous_context = context if intent == "followup_context" else None
    combined_message = user_message
    if intent == "followup_context" and context and context.get("clarifyingQuestion"):
        combined_message = f"[이전 질문: {context['clarifyingQuestion']}] 사용자 답변: {user_message}"

    recommendation = build_schedule_recommendation(
        date_label, events, weather_text, closet_items, combined_message, previous_context
    )

    if recommendation["needsClarification"]:
        schedule_context[room_id] = {
            "activeCalendarEvent": events[0] if events else None,
            "occasionCategory": events[0].get("category") if events else None,
            "dateLabel": date_label,
            "timeMin": time_min,
            "timeMax": time_max,
            "clarifyingQuestion": recommendation["clarifyingQuestion"],
            "recommendationStage": "clarifying",
        }
    else:
        schedule_context.pop(room_id, None)

    return {
        "intent": intent or "calendar_outfit_query",
        "calendarConnected": True,
        "dateLabel": date_label,
        "events": events,
        "assistantMessage": recommendation["assistantMessage"],
        "needsClarification": recommendation["needsClarification"],
        "clarifyingQuestion": recommendation["clarifyingQuestion"],
        "suggestedActions": recommendation["suggestedActions"],
        "transitionPlan": recommendation["transitionPlan"],
    }
