import sqlite3
import csv
import os

def init_db():
    conn = sqlite3.connect('codi_ai.db')
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 테이블 생성
    # cursor.execute("""
    # CREATE TABLE IF NOT EXISTS users (
    #     user_id TEXT PRIMARY KEY,
    #     favorite_colors TEXT,
    #     desired_style TEXT,
    #     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    # );
    # """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS clothes (
        clothes_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        category TEXT,
        style TEXT,
        color TEXT,
        processed_image TEXT,
        original_image TEXT,
        analyzed_at TEXT,
        shop_link TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    """)
    conn.commit()
    conn.close()
    print("✅ DB 초기화 완료")

def load_csv_to_db():
    conn = sqlite3.connect('codi_ai.db')
    cursor = conn.cursor()

    # # 1. users.csv 읽어서 저장
    # if os.path.exists('users.csv'):
    #     with open('users.csv', 'r', encoding='utf-8-sig') as f:
    #         reader = csv.DictReader(f)
    #         for row in reader:
    #             cursor.execute("""
    #                 INSERT OR IGNORE INTO users (user_id, favorite_colors, desired_style)
    #                 VALUES (?, ?, ?)
    #             """, (row['user_id'], row['favorite_colors'], row['desired_style']))
    #     print("👥 사용자 데이터 등록 완료 (users.csv)")
    # else:
    #     print("⚠️ users.csv 파일이 없습니다.")

    # 2. clothes.csv 읽어서 저장
    if os.path.exists('clothes.csv'):
        with open('clothes.csv', 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute("""
                    INSERT INTO clothes (user_id, category, style,color, processed_image, original_image, analyzed_at, shop_link)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (row['user_id'], row['category'], row['style'],row['color'],
                      row['processed_image'], row['original_image'], 
                      row['analyzed_at'], row.get('shop_link', '')))
        print("👕 의류 데이터 등록 완료 (clothes.csv)")
    else:
        print("⚠️ clothes.csv 파일이 없습니다.")

    conn.commit()
    conn.close()

def insert_clothing_data(user_id, category, style, color, processed_image, original_image):
    import sqlite3
    from datetime import datetime
    
    conn = sqlite3.connect('codi_ai.db')
    cursor = conn.cursor()
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    cursor.execute("""
        INSERT INTO clothes (user_id, category, style,color, processed_image, original_image, analyzed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, category, style, color, processed_image, original_image, now))
    
    conn.commit()
    conn.close()
    print("✅ DB에 새로운 옷 정보가 저장되었습니다!")

def check_data():
    conn = sqlite3.connect('codi_ai.db')
    cursor = conn.cursor()
    
    print("\n--- [현재 DB 데이터 확인] ---")
    cursor.execute("SELECT * FROM clothes")
    rows = cursor.fetchall()
    for row in rows:
        print(row)
    conn.close()

if __name__ == "__main__":
    init_db()          # 테이블 생성
    load_csv_to_db()   # CSV 파일 내용 DB에 넣기
    check_data()       # 결과 확인