import os
import sqlite3
import time

import requests

DB_PATH = 'codi_v2.db'
DEFAULT_USER_ID = 'su_ryong'  # 기존 chat-room/save-outfit 라우트와 동일한 하드코딩 사용자

TOKEN_URL = "https://oauth2.googleapis.com/token"
USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
REVOKE_URL = "https://oauth2.googleapis.com/revoke"

GOOGLE_WEB_CLIENT_ID = os.getenv("GOOGLE_WEB_CLIENT_ID", "").strip()
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()


class GoogleCalendarError(Exception):
    pass


# ---------------- OAuth ----------------

def exchange_code_for_tokens(code, redirect_uri, code_verifier=None):
    data = {
        "code": code,
        "client_id": GOOGLE_WEB_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }
    if code_verifier:
        data["code_verifier"] = code_verifier

    response = requests.post(TOKEN_URL, data=data, timeout=10)
    result = response.json()
    if "access_token" not in result:
        raise GoogleCalendarError(result.get("error_description", "구글 토큰 교환에 실패했습니다."))
    return result


def refresh_access_token(refresh_token):
    data = {
        "refresh_token": refresh_token,
        "client_id": GOOGLE_WEB_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "grant_type": "refresh_token",
    }
    response = requests.post(TOKEN_URL, data=data, timeout=10)
    result = response.json()
    if "access_token" not in result:
        raise GoogleCalendarError(result.get("error_description", "구글 토큰 갱신에 실패했습니다."))
    return result


def get_user_email(access_token):
    response = requests.get(
        USERINFO_URL,
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )
    if response.status_code != 200:
        return None
    return response.json().get("email")


def revoke_token(token):
    try:
        requests.post(REVOKE_URL, params={"token": token}, timeout=10)
    except Exception:
        pass


# ---------------- DB helpers ----------------

def save_account(access_token, refresh_token, expires_in, email, user_id=DEFAULT_USER_ID):
    token_expiry = int(time.time()) + int(expires_in or 0)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO calendar_accounts (user_id, email, access_token, refresh_token, token_expiry, connected_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
            email=excluded.email,
            access_token=excluded.access_token,
            refresh_token=COALESCE(excluded.refresh_token, calendar_accounts.refresh_token),
            token_expiry=excluded.token_expiry,
            connected_at=CURRENT_TIMESTAMP
    """, (user_id, email, access_token, refresh_token, token_expiry))
    conn.commit()
    conn.close()


def get_account(user_id=DEFAULT_USER_ID):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT user_id, email, access_token, refresh_token, token_expiry, connected_at "
        "FROM calendar_accounts WHERE user_id = ?",
        (user_id,),
    )
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "user_id": row[0],
        "email": row[1],
        "access_token": row[2],
        "refresh_token": row[3],
        "token_expiry": row[4],
        "connected_at": row[5],
    }


def delete_account(user_id=DEFAULT_USER_ID):
    account = get_account(user_id)
    if account and account.get("refresh_token"):
        revoke_token(account["refresh_token"])

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM calendar_accounts WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()


def get_valid_access_token(user_id=DEFAULT_USER_ID):
    """저장된 access token을 반환하되, 만료되었으면 자동 갱신 후 저장한다."""
    account = get_account(user_id)
    if not account:
        return None

    if account["token_expiry"] and int(time.time()) < account["token_expiry"] - 60:
        return account["access_token"]

    if not account["refresh_token"]:
        return None

    refreshed = refresh_access_token(account["refresh_token"])
    new_expiry = int(time.time()) + int(refreshed.get("expires_in", 0))

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE calendar_accounts SET access_token = ?, token_expiry = ? WHERE user_id = ?",
        (refreshed["access_token"], new_expiry, user_id),
    )
    conn.commit()
    conn.close()

    return refreshed["access_token"]


# ---------------- Calendar events ----------------

def _extract_start(event):
    start = event.get("start", {})
    if "dateTime" in start:
        return start["dateTime"], False
    return start.get("date"), True


def list_events(access_token, time_min, time_max):
    """
    time_min/time_max는 RFC3339 문자열(Asia/Seoul 기준으로 호출측에서 계산).
    취소된 일정은 제외하고, 코디 추천에 필요한 최소 필드만 반환한다.
    (참석자 이메일, 화상회의 링크, 반복 일정 식별자, 첨부파일 등은 절대 포함하지 않음)
    """
    params = {
        "timeMin": time_min,
        "timeMax": time_max,
        "singleEvents": "true",
        "orderBy": "startTime",
        "showDeleted": "false",
        "maxResults": 50,
    }
    response = requests.get(
        EVENTS_URL,
        headers={"Authorization": f"Bearer {access_token}"},
        params=params,
        timeout=10,
    )
    if response.status_code == 401:
        raise GoogleCalendarError("UNAUTHORIZED")
    response.raise_for_status()

    items = response.json().get("items", [])
    events = []
    for item in items:
        if item.get("status") == "cancelled":
            continue

        start_value, is_all_day = _extract_start(item)
        end = item.get("end", {})
        end_value = end.get("dateTime") or end.get("date")

        description = (item.get("description") or "").strip()
        if len(description) > 80:
            description = description[:80] + "..."

        events.append({
            "title": item.get("summary") or "(제목 없음)",
            "start": start_value,
            "end": end_value,
            "allDay": is_all_day,
            "location": item.get("location") or "",
            "description": description,
        })

    return events
