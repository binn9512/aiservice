import sqlite3

conn = sqlite3.connect('codi_v2.db')
cursor = conn.cursor()

print("==== 📂 내 collections 테이블 데이터 ====")
cursor.execute("SELECT * FROM collections")
for row in cursor.fetchall():
    print(f"폴더 ID: {row[0]} | 폴더 이름: {row[2]}")

conn.close()