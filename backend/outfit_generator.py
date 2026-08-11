import os
import uuid
import replicate
from dotenv import load_dotenv

load_dotenv()

client = replicate.Client(
    api_token=os.getenv("REPLICATE_API_TOKEN")
)

OUTPUT_DIR = "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def generate_outfit_image(
    avatar_path,
    prompt,
):
    """
    avatar_path : generate-avatar에서 생성한 아바타 png

    prompt 예시

    Wear:
    - white oversized shirt
    - black wide slacks
    - white sneakers
    """

    with open(avatar_path, "rb") as avatar:

        output = client.run(
            "black-forest-labs/flux-kontext-pro",
            input={
                "input_image": avatar,
                "prompt": f"""
Replace only the clothing.

{prompt}

Rules

Keep exactly the same face.

Keep hairstyle.

Keep body shape.

Keep pose.

Keep camera angle.

Keep background.

Keep lighting.

Do not change identity.

Generate a realistic fashion photo.
""",
                "aspect_ratio": "match_input_image",
                "output_format": "png",
                "prompt_upsampling": False,
            },
        )

    filename = f"outfit_{uuid.uuid4()}.png"

    save_path = os.path.join(
        OUTPUT_DIR,
        filename,
    )

    with open(save_path, "wb") as f:
        f.write(output.read())

    return save_path