import sqlite3

def create_bookmark_tables():
    # 우리가 쓰고 있는 DB 파일에 연결합니다.
    conn = sqlite3.connect('codi_v2.db')
    cursor = conn.cursor()
    
    print("⏳ 북마크 관련 테이블 생성 시작...")
    
    # 1. 컬렉션(폴더) 테이블 만들기
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS collections (
        collection_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        collection_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # 2. 코디 저장 테이블 만들기
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS saved_outfits (
        saved_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        collection_id INTEGER,
        title TEXT,
        memo TEXT,
        outfit_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(collection_id) REFERENCES collections(collection_id)
    );
    """)

    # 3. 즐겨찾기 테이블
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS favorite_outfits (
        favorite_id INTEGER PRIMARY KEY AUTOINCREMENT,
        saved_id INTEGER NOT NULL UNIQUE,
        title TEXT,
        memo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(saved_id) REFERENCES saved_outfits(saved_id)
    );
    """)
    
    # 4. 테스트용 기본 폴더 몇 개 미리 넣어두기 (프론트가 가져가서 쓸 수 있게!)
    cursor.execute("SELECT COUNT(*) FROM collections")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO collections (user_id, collection_name) VALUES ('su_ryong', '즐겨찾기')")
        cursor.execute("INSERT INTO collections (user_id, collection_name) VALUES ('su_ryong', '봄 데이트룩')")
        cursor.execute("INSERT INTO collections (user_id, collection_name) VALUES ('su_ryong', '여행룩')")
    
    conn.commit()
    conn.close()
    print("✅ 테이블 생성 및 테스트 데이터 입력 완료!")

if __name__ == "__main__":
    create_bookmark_tables()