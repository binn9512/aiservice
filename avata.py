import os
import replicate
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse

# 발급받은 API 키를 환경변수에 설정
os.environ["REPLICATE_API_TOKEN"] = "r8_d6egkBDfEi8YBaJBRHWlXCVQtjXgqzl35faIg"

app = FastAPI()

@app.post("/generate-avatar/")
async def generate_avatar(file: UploadFile = File(...)):
    try:
        # 1. 앱에서 올라온 이미지 파일을 읽어서 준비
        image_content = await file.read()
        
        # 임시 파일로 저장 (Replicate에 업로드하기 위함)
        with open("temp_image.jpg", "wb") as f:
            f.write(image_content)

        # 2. Replicate API 호출 (Stable Diffusion + IP-Adapter FaceID 모델 사용 예시)
        # 참고: 사용하고자 하는 모델(예: 아바타 스타일, 애니메이션 스타일 등)에 따라 모델 ID는 변경 가능합니다.
        output = replicate.run(
            "fofr/face-to-many:a07f252abbbd832009640b27f063ea52d87d7a23a185616c66019d4d8e6cd464", # 얼굴 변환에 특화된 모델 예시
            input={
                "image": open("temp_image.jpg", "rb"),
                "prompt": "A highly detailed digital art of a person as a cyberpunk character, neon lights, 4k resolution, masterpiece", # 원하는 아바타 스타일 프롬프트
                "negative_prompt": "ugly, blurry, low quality, distorted face",
                "style": "3D" # 3D, Anime, Pixel Art 등 설정 가능 (모델에 따라 다름)
            }
        )
        
        # 3. 결과 반환 (생성된 이미지의 URL이 반환됨)
        return JSONResponse(content={"status": "success", "avatar_url": output[0]})

    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)