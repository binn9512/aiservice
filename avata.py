import os
import replicate
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import tempfile

# 💡 대회 시연 전 환경변수에 반드시 Replicate API 토큰을 설정하세요.
os.environ["REPLICATE_API_TOKEN"] = "r8_d6egkBDfEi8YBaJBRHWlXCVQtjXgqzl35faIg"

app = FastAPI()

@app.post("/generate-fullbody-avatar/")
async def generate_fullbody_avatar(file: UploadFile = File(...)):
    try:
        # 1. 앱에서 업로드한 얼굴 사진 읽기
        image_content = await file.read()
        
        # 안전하게 임시 파일로 저장 (충돌 방지)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(image_content)
            temp_image_path = temp_file.name

        # 2. 전신 아바타 생성을 위한 프롬프트 엔지니어링 (매우 중요!)
        # 첨부하신 image_d10ad9.jpg 와 똑같은 형태를 만들기 위한 프롬프트입니다.
        prompt = (
            "full body shot, standing straight, a young korean woman, "
            "wearing a simple light pink sleeveless bodysuit, bare legs, bare feet, "
            "arms straight down at sides, solid black background, "
            "highly detailed, photorealistic, 8k resolution, masterpiece"
        )
        
        # 원하지 않는 결과물(잘림, 상반신만 나옴 등)을 방지하는 네거티브 프롬프트
        negative_prompt = (
            "cropped, close-up, portrait, half-body, bad anatomy, deformed, "
            "ugly, extra limbs, poorly drawn face, messy background, shoes"
        )

        # 3. Replicate API 호출 (InstantID 모델 사용)
        # zsxkib/instant-id 모델은 얼굴 아이덴티티를 유지하며 새로운 이미지를 생성하는 데 최적화되어 있습니다.
        output = replicate.run(
            "zsxkib/instant-id:6af8583c541261472e92155d87bba80d5ad98461665802f2ba196ac099aaedc9",
            input={
                "image": open(temp_image_path, "rb"),
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "width": 512,  # 전신이 나오도록 가로 비율
                "height": 1024, # 전신이 나오도록 세로를 길게 설정 (1:2 비율)
                "sdxl_weights": "protovisionXLHighFidelity3D_release0630Bakedvae", # 실사/3D에 강한 가중치
                "num_inference_steps": 30,
                "guidance_scale": 5.0,
                "ip_adapter_scale": 0.8 # 이 수치가 높을수록 원래 얼굴과 비슷해지지만, 너무 높으면 프롬프트(전신/옷)가 씹힐 수 있습니다.
            }
        )
        
        # 임시 파일 삭제 (서버 용량 관리)
        os.remove(temp_image_path)

        # 4. 생성된 전신 이미지 URL 반환
        # InstantID의 경우 리스트 형태로 결과가 나오므로 첫 번째[0] 요소를 반환합니다.
        return JSONResponse(content={"status": "success", "avatar_url": output[0]})

    except Exception as e:
        # 대회 중 에러가 나더라도 앱이 튕기지 않도록 에러 처리
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)