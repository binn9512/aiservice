from PIL import Image
import uuid

from PIL import Image
import uuid

POSITIONS = {
    "bottom": {
        "x": 300,
        "y": 650,
        "w": 400,
        "h": 450,
    }
}

def paste_item(base, item_path, category):
    if not item_path:
        return

    pos = POSITIONS[category]

    item = Image.open(item_path).convert("RGBA")

    item.thumbnail(
        (pos["w"], pos["h"]),
        Image.LANCZOS,
    )

    base.alpha_composite(
        item,
        (pos["x"], pos["y"])
    )

def generate_outfit_image(
    dress=None,
    top=None,
    bottom=None,
    outer=None,
    shoes=None,
    bag=None,
):
    try:
        base = Image.open(
            "static/avatar/base_avatar.png"
        ).convert("RGBA")

        paste_item(
            base,
            bottom,
            "bottom"
        )

        filename = (
            f"output/final_{uuid.uuid4()}.png"
        )

        base.save(filename)

        print("✅ 완료", filename)

        return filename

    except Exception as e:
        print("❌", e)
        return None