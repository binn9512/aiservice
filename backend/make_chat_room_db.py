import sqlite3

def create_chat_room_table():
    # 질문자님의 진짜 DB 파일인 'codi_v2.db'에 연결합니다.
    conn = sqlite3.connect('codi_v2.db')
    cursor = conn.cursor()
    
    print("⏳ 채팅방 관리 관련 테이블 생성 시작...")
    
    # 1. 채팅방 목록 테이블 만들기
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_rooms (
        room_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        room_title TEXT NOT NULL,           -- 채팅방 이름 (기본값: '새 채팅')
        is_pinned INTEGER DEFAULT 0,        -- 고정 여부 (0: 일반, 1: 고정)
        is_archived INTEGER DEFAULT 0,      -- 아카이브 보관 여부 (0: 일반, 1: 보관)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # 2. 테스트용 샘플 채팅방 몇 개 미리 넣어두기 (확인용!)
    cursor.execute("SELECT COUNT(*) FROM chat_rooms")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO chat_rooms (user_id, room_title, is_pinned) VALUES ('su_ryong', '📌 고정된 옛날 코디 대화', 1)")
        cursor.execute("INSERT INTO chat_rooms (user_id, room_title) VALUES ('su_ryong', '한강 나들이 옷 추천')")
        cursor.execute("INSERT INTO chat_rooms (user_id, room_title) VALUES ('su_ryong', '전시회 데이트룩')")
        print("💡 테스트용 샘플 채팅방 데이터 입력 완료!")
    
    conn.commit()
    conn.close()
    print("✅ chat_rooms 테이블 생성 완료!")

if __name__ == "__main__":
    create_chat_room_table()