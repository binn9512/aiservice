from vision_part import analyze_style
import db_test

def process_and_save(user_id, image_path):

    output_path, category, style, color = analyze_style(image_path)
    db_test.insert_clothing_data(user_id, category, style,color, output_path, image_path)
    return output_path, category, style, color
    
if __name__ == "__main__":
    db_test.init_db()
    db_test.load_csv_to_db()
    process_and_save("user1", "blouse2.png")
    process_and_save("user1", "pant.png")
    process_and_save("user1", "skirt.png")
    db_test.check_data()
    # # 이미지 경로를 여기에 입력하세요
    # image_path = "jacket.png" 
    
    # # 배경 제거, 분류 및 스타일 분석 실행
    # output_path, category, style, color = analyze_style(image_path)
    
    # print("-" * 30)
    # print(f"작업 완료!")
    # print(f"누끼 저장 경로: {output_path}")
    # print(f"분류 카테고리: {category}")
    # print(f"분류 스타일: {style}")
    # print(f"분류 색상: {color}")
    # print("-" * 30)
