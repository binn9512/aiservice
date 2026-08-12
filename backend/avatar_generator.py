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


# =========================================================================
# 👤 AI 아바타 생성
# =========================================================================

def generate_avatar_image(photo):
    upload_dir = BASE_DIR / "uploads"
    upload_dir.mkdir(exist_ok=True)

    ext = Path(photo.filename).suffix
    face_path = upload_dir / f"{uuid.uuid4().hex}{ext}"

    photo.save(face_path)

    # 베이스 아바타
    mannequin = (
        BASE_DIR
        / "static"
        / "avatar"
        / "base_avatar.png"
    )

    avatar_name = f"avatar_{uuid.uuid4().hex}.png"
    avatar_path = OUTPUT_DIR / avatar_name

    try:
        print("🔥 Replicate에 얼굴 합성 요청")

        with open(mannequin, "rb") as target_file, \
             open(face_path, "rb") as swap_file:

            output = replicate.run(
                "lucataco/faceswap:9a4298548422074c3f57258c5d544497314ae4112df80d116f0d2109e843d20d",
                input={
                    "target_image": target_file,
                    "swap_image": swap_file,
                },
            )

        output_url = None

        if isinstance(output, list) and len(output) > 0:
            result = output[0]

            if hasattr(result, "url"):
                output_url = result.url
            else:
                output_url = str(result)

        elif hasattr(output, "url"):
            output_url = output.url

        else:
            output_url = str(output)

        if not output_url or output_url == "None":
            raise ValueError(
                "이미지 URL을 받아오지 못했습니다."
            )

        print("🔥 아바타 이미지 다운로드:", output_url)

        response = requests.get(
            output_url,
            timeout=60,
        )

        response.raise_for_status()

        with open(avatar_path, "wb") as f:
            f.write(response.content)

        print("✅ 아바타 생성 완료:", avatar_path)

        return f"output/{avatar_name}"

    except Exception as e:
        print("❌ 아바타 생성 오류:", e)
        raise

    finally:
        try:
            if face_path.exists():
                os.remove(face_path)
        except Exception:
            pass


# =========================================================================
# 👗 AI 아바타 옷 입히기
# =========================================================================

def generate_outfit_image(avatar_path, prompt):

    print("🔥 generate_outfit_image 시작")
    print("🔥 원본 avatar_path:", avatar_path)
    print("🔥 prompt:", prompt)

    temp_avatar = None

    try:
        # -------------------------------------------------------------
        # 1. avatar_path 정리
        # -------------------------------------------------------------

        avatar_path = str(avatar_path).strip()

        # 혹시 [URL](URL) 형태로 넘어오는 경우 처리
        if avatar_path.startswith("[") and "](" in avatar_path:

            start = avatar_path.find("](") + 2
            end = avatar_path.find(")", start)

            if end != -1:
                avatar_path = avatar_path[start:end]

        print(
            "🔥 정리된 avatar_path:",
            avatar_path,
        )

        # -------------------------------------------------------------
        # 2. 아바타 이미지 준비
        # -------------------------------------------------------------

        if avatar_path.startswith(
            ("http://", "https://")
        ):

            print(
                "🔥 아바타 URL 다운로드:",
                avatar_path,
            )

            response = requests.get(
                avatar_path,
                timeout=60,
            )

            response.raise_for_status()

            temp_avatar = (
                OUTPUT_DIR
                / f"temp_avatar_{uuid.uuid4().hex}.png"
            )

            with open(temp_avatar, "wb") as f:
                f.write(response.content)

            avatar_file = temp_avatar

        else:

            avatar_file = Path(avatar_path)

            if not avatar_file.is_absolute():
                avatar_file = BASE_DIR / avatar_file

            if not avatar_file.exists():
                raise FileNotFoundError(
                    f"아바타 파일을 찾을 수 없습니다: {avatar_file}"
                )

        print(
            "🔥 Replicate에 전달할 아바타:",
            avatar_file,
        )

        # -------------------------------------------------------------
        # 3. Replicate 옷 입히기
        # -------------------------------------------------------------

        with open(avatar_file, "rb") as avatar:

            output = replicate.run(
                "black-forest-labs/flux-kontext-pro",
                input={
                    "input_image": avatar,

                    "prompt": f"""
Only replace the clothes.

{prompt}

Rules:

- Keep the same person.
- Keep the same face.
- Keep the same body.
- Keep the same body proportions.
- Keep the same pose.
- Keep the same hairstyle.
- Keep the same skin tone.
- Keep the same identity.
- Keep the same background.
- Keep the same lighting.
- Keep the same camera angle.
- Do not change the person's identity.
- Do not change the body.
- Do not change the pose.
- Do not add or remove body parts.
- Only change the clothing.
- Make the clothes fit naturally on the body.
- Make the clothing realistic.
- Keep the image photorealistic.
""",

                    "aspect_ratio": "match_input_image",
                    "output_format": "png",
                    "prompt_upsampling": False,
                },
            )

        print(
            "🔥 Replicate 결과:",
            output,
        )

        # -------------------------------------------------------------
        # 4. 결과 URL 추출
        # -------------------------------------------------------------

        image_url = None

        if isinstance(output, list) and len(output) > 0:

            result = output[0]

            if hasattr(result, "url"):
                image_url = result.url
            else:
                image_url = str(result)

        elif hasattr(output, "url"):

            image_url = output.url

        else:

            image_url = str(output)

        if not image_url or image_url == "None":
            raise ValueError(
                "Replicate에서 이미지 URL을 받지 못했습니다."
            )

        print(
            "🔥 생성 이미지 URL:",
            image_url,
        )

        # -------------------------------------------------------------
        # 5. 결과 이미지 다운로드
        # -------------------------------------------------------------

        response = requests.get(
            image_url,
            timeout=60,
        )

        response.raise_for_status()

        filename = (
            f"outfit_{uuid.uuid4().hex}.png"
        )

        save_path = (
            OUTPUT_DIR / filename
        )

        with open(save_path, "wb") as f:
            f.write(response.content)

        print(
            "✅ 옷 입히기 완료:",
            save_path,
        )

        return f"output/{filename}"

    except Exception as e:

        print(
            "❌ 옷 입히기 오류:",
            e,
        )

        raise

    finally:

        # -------------------------------------------------------------
        # 6. 임시 아바타 삭제
        # -------------------------------------------------------------

        if temp_avatar is not None:

            try:

                if temp_avatar.exists():
                    temp_avatar.unlink()

                    print(
                        "🗑️ 임시 아바타 삭제:",
                        temp_avatar,
                    )

            except Exception as e:

                print(
                    "⚠️ 임시 파일 삭제 실패:",
                    e,
                )