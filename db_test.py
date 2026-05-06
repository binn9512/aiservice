import sqlite3
import csv
import os
import shutil
from datetime import datetime

def init_db():
    conn = sqlite3.connect('codi_ai.db')
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. 사용자 테이블 생성
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        favorite_colors TEXT,
        desired_style TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. 의류 테이블 생성
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS clothes (
        clothes_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        category TEXT,
        style TEXT,
        processed_image TEXT, -- 복사된 사진의 새 경로 저장
        original_image TEXT,  -- 원본 사진의 경로 저장
        analyzed_at TEXT,
        shop_link TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    """)
    conn.commit()
    conn.close()
    print("✅ DB 초기화 완료")

def load_users_from_csv():
    """사용자 정보만 CSV에서 불러와 DB에 등록"""
    if not os.path.exists('users.csv'):
        print("⚠️ users.csv 파일이 없어 사용자 로딩을 건너뜁니다.")
        return

    conn = sqlite3.connect('codi_ai.db')
    cursor = conn.cursor()
    with open('users.csv', 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cursor.execute("""
                INSERT OR IGNORE INTO users (user_id, favorite_colors, desired_style)
                VALUES (?, ?, ?)
            """, (row['user_id'], row['favorite_colors'], row['desired_style']))
    conn.commit()
    conn.close()
    print("👥 사용자 데이터 동기화 완료")

def add_clothes_direct(user_id, category, style, source_img_path, shop_link=""):
    """사진 경로를 입력받아 폴더 복사 및 DB 등록을 동시에 처리"""
    
    # 1. 사진 저장 폴더 생성
    target_folder = 'images'
    if not os.path.exists(target_folder):
        os.makedirs(target_folder)

    # 2. 파일 복사 실행 (파일명 중복 방지 타임스탬프 추가)
    filename = os.path.basename(source_img_path)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    new_filename = f"{timestamp}_{filename}"
    target_path = os.path.join(target_folder, new_filename) # DB에 저장될 최종 경로
    
    shutil.copy2(source_img_path, target_path)

    # 3. DB에 직접 INSERT
    conn = sqlite3.connect('codi_ai.db')
    cursor = conn.cursor()
    
    # 해당 유저가 DB에 없을 경우를 대비해 임시 등록
    cursor.execute("INSERT OR IGNORE INTO users (user_id) VALUES (?)", (user_id,))
    
    cursor.execute("""
        INSERT INTO clothes (user_id, category, style, processed_image, original_image, analyzed_at, shop_link)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, category, style, target_path, source_img_path, timestamp, shop_link))
    
    conn.commit()
    conn.close()
    print(f"👕 의류 등록 완료: {target_path}")

def check_data():
    conn = sqlite3.connect('codi_ai.db')
    cursor = conn.cursor()
    print("\n--- [현재 DB 저장 내역 확인] ---")
    cursor.execute("SELECT * FROM clothes")
    for row in cursor.fetchall():
        print(row)
    conn.close()

# --- 메인 실행부 ---
if __name__ == "__main__":
    init_db()               # 1. DB/테이블 생성
    load_users_from_csv()    # 2. 유저 정보 로딩 (users.csv 필요)

    # 3. 사진 경로 입력하여 옷 등록 (여기에 파일 경로를 쓰세요)
    # 예: "my_top.png" 또는 r"C:\Desktop\image.jpg"
    my_photo = "test_photo.png" 
    
    if os.path.exists(my_photo):
        add_clothes_direct(
            user_id="sungshin_user_01", 
            category="상의", 
            style="캐주얼", 
            source_img_path=my_photo
        )
    else:
        print(f"❌ 파일을 찾을 수 없습니다: {my_photo}")

    check_data()            # 4. 결과 확인