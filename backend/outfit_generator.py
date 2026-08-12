import os
import uuid
import requests
import replicate
from pathlib import Path
from dotenv import load_dotenv
from PIL import Image, ImageDraw, ImageFilter

load_dotenv()

BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

client = replicate.Client(
    api_token=os.getenv("REPLICATE_API_TOKEN")
)

def generate_outfit_image(avatar_path, prompt, item_images=None):
    """
    기존 AI 아바타에 실제 추천 옷 이미지를 적용하여 최종 이미지를 생성
    """

    print("🔥 generate_outfit_image 시작")
    print("🔥 원본 avatar_path =", avatar_path)
    print("🔥 prompt =", prompt)

    avatar_path = str(avatar_path).strip()

    # 🌟 1. 비정상적인 HTTP 주소 슬래시 보정 (http:/ -> http://)
    if avatar_path.startswith("http:/") and not avatar_path.startswith("http://"):
        avatar_path = avatar_path.replace("http:/", "http://", 1)
    elif avatar_path.startswith("https:/") and not avatar_path.startswith("https://"):
        avatar_path = avatar_path.replace("https:/", "https://", 1)

    # =========================================================
    # 1. 마크다운 링크 형태로 들어온 경우 URL만 추출
    # =========================================================
    if avatar_path.startswith("[") and "](" in avatar_path:
        avatar_path = avatar_path.split("](")[1].rstrip(")")
        print("🔥 마크다운 제거 후 avatar URL =", avatar_path)

    # =========================================================
    # 2. 모바일 기기 URI 전처리
    # =========================================================
    if avatar_path.startswith("file://"):
        avatar_path = avatar_path.replace("file://", "")
        print("🔥 file:// 제거 후 avatar_path =", avatar_path)

    temp_avatar = None
    temp_items = []

    # 🌟 [수정 핵심] reference_images 변수 초기화 추가!
    reference_images = []

    try:
        # =====================================================
        # 3. 옷 이미지 다운로드
        # =====================================================
        if item_images:
            for item in item_images:
                image_url = item.get("image")
                if not image_url:
                    continue

                image_url = str(image_url).strip()
                if image_url.startswith("[") and "](" in image_url:
                    image_url = image_url.split("](")[1].rstrip(")")

                try:
                    item_response = requests.get(image_url, timeout=30)
                    item_response.raise_for_status()

                    item_path = OUTPUT_DIR / f"temp_item_{uuid.uuid4().hex}.png"
                    with open(item_path, "wb") as f:
                        f.write(item_response.content)

                    temp_items.append({
                        "name": item.get("name", ""),
                        "category": item.get("category", ""),
                        "path": item_path,
                    })

                    print("👕 옷 이미지 다운로드 완료:", item.get("name"), item_path)

                except Exception as e:
                    print("⚠️ 옷 이미지 다운로드 실패:", image_url, e)

        # =====================================================
        # 4. 아바타 이미지 준비 (스마트 경로 감지 및 백업 탐색)
        # =====================================================
        avatar_file = None

        # 🌟 A. 백엔드 자체 자원(SERVER_URL)인 경우 로컬 direct 매핑
        if "/output/" in avatar_path:
            filename = avatar_path.split("/output/")[-1]
            local_target = OUTPUT_DIR / filename
            if local_target.exists():
                avatar_file = local_target
                print(f"✅ 백엔드 로컬 output 경로 direct 매핑 성공: {avatar_file}")

        # 🌟 B. 외부 외부 웹 URL 인 경우 HTTP 다운로드
        if avatar_file is None and (avatar_path.startswith("http://") or avatar_path.startswith("https://")):
            print("🔥 외부 아바타 URL 다운로드 시작:", avatar_path)
            try:
                response = requests.get(avatar_path, timeout=30)
                response.raise_for_status()

                temp_avatar = OUTPUT_DIR / f"temp_avatar_{uuid.uuid4().hex}.png"
                with open(temp_avatar, "wb") as f:
                    f.write(response.content)

                avatar_file = temp_avatar
                print("✅ 아바타 외부 URL 다운로드 완료:", avatar_file)
            except Exception as e:
                print(f"⚠️ 아바타 URL 다운로드 실패 ({e}), 로컬 검색으로 전환합니다.")

        # 🌟 C. 일반 파일 경로이거나 위 로직에서 찾지 못한 경우
        if avatar_file is None:
            avatar_file = Path(avatar_path)
            if not avatar_file.is_absolute():
                avatar_file = BASE_DIR / avatar_file

        # 🌟 D. [최후의 보루] 지정된 파일이 존재하지 않거나 'var/mobile'인 경우 최신 avatar_*.png 탐색
        if not avatar_file.exists() or "var/mobile" in str(avatar_file):
            print(f"⚠️ 지정된 파일 없음/접근 불가 ({avatar_file}) -> 최근 생성된 아바타 자동 탐색")
            
            # 1순위: base_avatar.png 존재 여부 확인
            if (OUTPUT_DIR / "base_avatar.png").exists():
                avatar_file = OUTPUT_DIR / "base_avatar.png"
            # 2순위: 가장 최근에 생성된 avatar_*.png 자동 지정
            else:
                latest_avatars = sorted(OUTPUT_DIR.glob("avatar_*.png"), key=os.path.getmtime, reverse=True)
                if latest_avatars:
                    avatar_file = latest_avatars[0]
                    print(f"✅ 가장 최근 생성된 아바타 자동 매핑: {avatar_file}")
                else:
                    raise FileNotFoundError(f"아바타 파일을 찾을 수 없으며, output 폴더에 대체할 아바타도 없습니다: {avatar_file}")

        print("🔥 Replicate에 전달할 최종 아바타:", avatar_file)

        # ... 이하 Replicate 실행 로직 계속 ...
        # =====================================================
        # 4. Replicate reference images 구성
        #
        # image 1 = 아바타
        # image 2 = 첫 번째 옷
        # image 3 = 두 번째 옷
        # ...
        #
        # FLUX.2 Pro는 최대 8개의 reference image를 지원
        # =====================================================
        

        # 아바타
        reference_images.append(
            open(avatar_file, "rb")
        )

        # 옷 이미지
        for item in temp_items[:7]:
            reference_images.append(
                open(item["path"], "rb")
            )

        print(
            f"🔥 Replicate reference image 개수: "
            f"{len(reference_images)}"
        )

        # =====================================================
        # 5. 옷 설명 생성
        # =====================================================
        clothing_description = "\n".join(
            f"Image {index + 2}: "
            f"{item['category']} - {item['name']}"
            for index, item in enumerate(temp_items[:7])
        )

        final_prompt = f"""
Use image 1 as the exact person/avatar to edit.

The clothing reference images are:
{clothing_description}

Dress the person in image 1 using the actual clothing shown in the
reference images.

{prompt}

IMPORTANT:
- Image 1 is the person.
- Images 2 onward are the actual clothing items.
- Use the actual clothing designs, colors, materials and shapes from
  the reference images.
- Apply the referenced clothing naturally onto the person in image 1.
- The result must look like a real fashion e-commerce fitting photo.
- Keep the person's face and identity unchanged.
- Keep the person's body proportions unchanged.
- Keep the person's pose unchanged.
- Keep the person's hairstyle unchanged.
- Keep the person's skin tone unchanged.
- Keep the background unchanged.
- Keep the lighting consistent.
- Only change the clothing and accessories.
- Make every clothing item fit the correct body area naturally.
- Do not invent unrelated clothing items.
- Do not replace the referenced clothing with generic clothing.
- Preserve the original full-body composition.
- Show the complete person from head to feet.
- Photorealistic result.
"""

        print("🔥 최종 Replicate prompt:")
        print(final_prompt)

        # =====================================================
        # 6. FLUX.2 Pro 실행
        # =====================================================
        output = client.run(
            "black-forest-labs/flux-2-pro",
            input={
                "prompt": final_prompt,
                "input_images": reference_images,
                "resolution": "2 MP",
                "aspect_ratio": "match_input_image",
                "output_format": "png",
                "output_quality": 100,
                "safety_tolerance": 2,
                "prompt_upsampling": False,
            },
        )

        print("🔥 Replicate 결과:", output)

        # =====================================================
        # 7. 결과 URL 추출
        # =====================================================
        if hasattr(output, "url"):
            image_url = output.url

        elif isinstance(output, list) and len(output) > 0:

            result = output[0]

            if hasattr(result, "url"):
                image_url = result.url
            else:
                image_url = str(result)

        else:
            image_url = str(output)

        if not image_url or image_url == "None":
            raise ValueError(
                "Replicate에서 이미지 URL을 받지 못했습니다."
            )

        print(
            "🔥 생성된 이미지 URL:",
            image_url
        )

        # =====================================================
        # 8. 생성된 이미지 다운로드
        # =====================================================
        response = requests.get(
            image_url,
            timeout=60
        )

        response.raise_for_status()

        filename = f"outfit_{uuid.uuid4().hex}.png"
        save_path = OUTPUT_DIR / filename

        # =====================================================
        # 8. AI 생성 이미지 저장
        # =====================================================
        with open(save_path, "wb") as f:
            f.write(response.content)

                # =====================================================
        # 9. 원본 아바타 얼굴만 자연스럽게 복원
        # =====================================================
        print("🔥 원본 얼굴 자연스럽게 복원 시작")

        original_avatar = Image.open(avatar_file).convert("RGBA")
        generated_image = Image.open(save_path).convert("RGBA")

        # AI 결과 크기를 원본 아바타와 동일하게 맞춤
        if generated_image.size != original_avatar.size:
            generated_image = generated_image.resize(
                original_avatar.size,
                Image.Resampling.LANCZOS
            )

        width, height = original_avatar.size

        # -----------------------------------------------------
        # 얼굴 영역
        #
        # 기존보다 훨씬 작게 잡아서
        # 머리카락 / 목 / 옷까지 원본 이미지가 덮지 않도록 함
        # -----------------------------------------------------
        face_left = int(width * 0.435)
        face_right = int(width * 0.565)

        face_top = int(height * 0.075)
        face_bottom = int(height * 0.175)

        # 얼굴 마스크
        face_mask = Image.new(
            "L",
            original_avatar.size,
            0
        )

        draw = ImageDraw.Draw(face_mask)

        draw.ellipse(
            (
                face_left,
                face_top,
                face_right,
                face_bottom,
            ),
            fill=255
        )

        # -----------------------------------------------------
        # 얼굴 가장자리를 아주 부드럽게
        # -----------------------------------------------------
        face_mask = face_mask.filter(
            ImageFilter.GaussianBlur(12)
        )

        # -----------------------------------------------------
        # 원본 얼굴만 복원
        # -----------------------------------------------------
        generated_image.paste(
            original_avatar,
            (0, 0),
            face_mask
        )

        generated_image = generated_image.convert("RGB")

        generated_image.save(
            save_path,
            format="PNG"
        )

        print("✅ 원본 얼굴 자연스럽게 복원 완료")
        print("✅ 옷 입히기 최종 완료:", save_path)

        return f"output/{filename}"

    finally:

        # =====================================================
        # 9. 임시 아바타 삭제
        # =====================================================
        if temp_avatar and temp_avatar.exists():

            try:
                temp_avatar.unlink()
                print(
                    "🗑 임시 아바타 삭제 완료"
                )

            except Exception as e:
                print(
                    "⚠️ 임시 아바타 삭제 실패:",
                    e
                )

        # =====================================================
        # 10. 임시 옷 이미지 삭제
        # =====================================================
        for item in temp_items:

            try:
                if item["path"].exists():
                    item["path"].unlink()

                    print(
                        "🗑 임시 옷 이미지 삭제:",
                        item["path"]
                    )

            except Exception as e:
                print(
                    "⚠️ 임시 옷 이미지 삭제 실패:",
                    e
                )

        # =====================================================
        # 11. 열린 파일 닫기
        # =====================================================
        for file_obj in reference_images:
            try:
                file_obj.close()
            except Exception:
                pass