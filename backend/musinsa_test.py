import requests
import io
from PIL import Image
from rembg import remove

# 1. 방금 엑셀에 넣은 진짜 무신사 이미지 주소를 여기에 붙여넣으세요!
test_url = "https://image.msscdn.net/thumbnails/images/goods_img/20260515/6490565/6490565_17788251896643_big.jpg?w=1200"
# 2. 브라우저인 척 속이는 가면 쓰기
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

try:
    print("⏳ 무신사에서 이미지 다운로드 중...")
    response = requests.get(test_url, headers=headers)
    
    if response.status_code == 200:
        img = Image.open(io.BytesIO(response.content)).convert("RGB")
        print("✅ 다운로드 성공! 이제 AI 누끼(rembg)를 돌립니다...")
        
        # 3. 누끼 따기 테스트
        output = remove(img)
        
        # 4. 결과 저장해서 확인해보기
        output.save("./test_musinsa_output.png", "PNG")
        print("🎉 [성공] 프로젝트 폴더에 'test_musinsa_output.png' 파일이 생겼는지 확인해 보세요!")
        print("배경이 투명하게 잘 따졌다면 이 주소 형식은 100% 안전합니다!")
        
    else:
        print(f"❌ 다운로드 실패... 에러 코드: {response.status_code}")
        print("이 주소는 무신사가 막아둔 주소일 수 있습니다.")

except Exception as e:
    print(f"❌ 코드 실행 중 예상치 못한 에러 발생: {e}")