import sqlite3

def create_calendar_table():
    conn = sqlite3.connect('codi_v2.db')
    cursor = conn.cursor()

    print("⏳ 캘린더 연동 테이블 생성 시작...")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS calendar_accounts (
        user_id TEXT PRIMARY KEY,
        email TEXT,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        token_expiry INTEGER,
        connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()
    print("✅ 캘린더 연동 테이블 생성 완료!")

if __name__ == "__main__":
    create_calendar_table()
