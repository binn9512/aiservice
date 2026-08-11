import os
import tempfile
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
import replicate

# 💡 Replicate API 토큰 설정
os.environ["REPLICATE_API_TOKEN"] = "r8_d6egkBDfEi8YBaJBRHWlXCVQtjXgqzl35faIg"

app = FastAPI(title="AI Outfit Try-On Service")

@app.post("/try-on-outfit/")
async def try_on_outfit(
    file: UploadFile = File(...),                                   # 사용자의 기준 아바타/얼굴 이미지
    top: Optional[str] = Form("graphic short sleeve t-shirt"),      # 추천 상의
    bottom: Optional[str] = Form("black curved track pants"),       # 추천 하의
    shoes: Optional[str] = Form("light blue strap flat shoes"),     # 추천 신발
    bag: Optional[str] = Form("black belted shoulder bag"),         # 추천 가방
    accessory: Optional[str] = Form("black crystal choker necklace") # 추천 악세사리
):
    """
    추천받은 코디 아이템들을 기준 아바타 모델에 착장시켜 
    전신 아바타 이미지를 생성하는 엔드포인트입니다.
    """
    temp_image_path = None
    try:
        # 1. 전달받은 기본 아바타/얼굴 이미지 임시 파일 저장
        image_content = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(image_content)
            temp_image_path = temp_file.name

        # 2. 추천 코디 구성 요소 결합 (프롬프트 빌딩)
        outfit_items = []
        if top:
            outfit_items.append(f"wearing {top}")
        if bottom:
            outfit_items.append(f"wearing {bottom}")
        if shoes:
            outfit_items.append(f"wearing {shoes}")
        if bag:
            outfit_items.append(f"carrying a {bag}")
        if accessory:
            outfit_items.append(f"wearing a {accessory}")

        outfit_prompt_str = ", ".join(outfit_items)

        # 3. 전신 착장을 위한 InstantID 세부 프롬프트 설정
        prompt = (
            f"full body shot, standing straight front view, a young korean woman, "
            f"{outfit_prompt_str}, "
            f"studio lighting, solid clean background, highly detailed fashion lookbook, "
            f"photorealistic, 8k resolution, masterpiece"
        )

        negative_prompt = (
            "cropped, close-up, portrait, upper body only, bad anatomy, deformed, "
            "missing limbs, extra legs, distorted shoes, poorly drawn face, blurry, text, watermark"
        )

        # 4. Replicate AI 모델 호출 (얼굴 고정 + 의상 합성)
        output = replicate.run(
            "zsxkib/instant-id:6af8583c541261472e92155d87bba80d5ad98461665802f2ba196ac099aaedc9",
            input={
                "image": open(temp_image_path, "rb"),
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "width": 512,
                "height": 1024,                  # 머리부터 신발/가방까지 나오도록 1:2 세로 비율 고정
                "sdxl_weights": "protovisionXLHighFidelity3D_release0630Bakedvae",
                "num_inference_steps": 35,
                "guidance_scale": 6.5,
                "ip_adapter_scale": 0.75         # 얼굴 유사도와 코디 프롬프트 반영의 최적 밸런스
            }
        )

        # 5. 결과 반환
        return JSONResponse(content={
            "status": "success",
            "outfit_avatar_url": output[0]
        })

    except Exception as e:
        return JSONResponse(
            content={"status": "error", "message": str(e)}, 
            status_code=500
        )

    finally:
        # 임시 이미지 파일 안전하게 삭제
        if temp_image_path and os.path.exists(temp_image_path):
            os.remove(temp_image_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)