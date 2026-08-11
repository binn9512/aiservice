import os
import uuid
import requests
from pathlib import Path
from dotenv import load_dotenv
import replicate

load_dotenv()

BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

def generate_avatar_image(photo):
    upload_dir = BASE_DIR / "uploads"
    upload_dir.mkdir(exist_ok=True)

    ext = Path(photo.filename).suffix
    face_path = upload_dir / f"{uuid.uuid4().hex}{ext}"
    photo.save(face_path)

    # 이목구비가 희미하게 있는 베이스 마네킹 이미지 (마스크 필요 없음!)
    mannequin = BASE_DIR / "static" / "avatar" / "base_avatar.png"
    
    avatar_name = f"avatar_{uuid.uuid4().hex}.png"
    avatar_path = OUTPUT_DIR / avatar_name

    try:
        print("Replicate에 얼굴 합성(Face Swap) 요청 중...")
        
        with open(mannequin, "rb") as target_file, open(face_path, "rb") as swap_file:
             
            # 처음 스크린샷에서 성공했던 바로 그 검증된 모델과 해시값입니다.
            output = replicate.run(
                "lucataco/faceswap:9a4298548422074c3f57258c5d544497314ae4112df80d116f0d2109e843d20d",
                input={
                    "target_image": target_file,
                    "swap_image": swap_file
                }
            )
        
        output_url = None
        if isinstance(output, list) and len(output) > 0:
            output_url = output[0].url if hasattr(output[0], 'url') else output[0]
        elif hasattr(output, "url"):
            output_url = output.url
        else:
            output_url = output

        if not output_url or str(output_url) == "None":
            raise ValueError("이미지 URL을 받아오지 못했습니다.")

        print(f"합성 완료! 이미지 다운로드 중...")
        response = requests.get(str(output_url))
        response.raise_for_status()
        
        with open(avatar_path, "wb") as f:
            f.write(response.content)

    except Exception as e:
        print(f"이미지 생성 중 오류 발생: {e}")
        raise e

    finally:
        try:
            if face_path.exists():
                os.remove(face_path)
        except Exception:
            pass

    return f"output/{avatar_name}"