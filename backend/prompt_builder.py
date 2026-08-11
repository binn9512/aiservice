CATEGORY_MAP = {

    "반팔 티셔츠": "short sleeve t-shirt",
    "긴팔 티셔츠": "long sleeve t-shirt",
    "셔츠/블라우스": "shirt",
    "니트/스웨터": "knit sweater",
    "맨투맨/후드": "hoodie",
    "슬리브리스": "tank top",

    "데님 팬츠": "blue jeans",
    "슬랙스": "wide slacks",
    "반바지": "shorts",
    "트레이닝 팬츠": "jogger pants",
    "스커트": "skirt",

    "코트": "long coat",
    "패딩": "puffer jacket",
    "자켓": "jacket",
    "가디건": "cardigan",

    "운동화/스니커즈": "white sneakers",
    "구두/로퍼": "loafers",
    "힐": "heels",
    "부츠": "boots",

    "백팩": "backpack",
    "숄더백/토트백": "tote bag",
    "크로스백": "crossbody bag",

}

COLOR_MAP = {

    "화이트": "white",
    "블랙": "black",
    "그레이": "gray",
    "네이비": "navy",
    "블루": "blue",
    "데님": "denim",
    "베이지": "beige",
    "브라운": "brown",
    "카키": "khaki",
    "그린": "green",
    "핑크": "pink",
    "레드": "red",

}

STYLE_MAP = {

    "미니멀": "minimal",
    "캐주얼": "casual",
    "스트릿": "streetwear",
    "빈티지": "vintage",
    "페미닌": "feminine",
    "비즈니스룩": "business",

}


def item_to_prompt(item):

    if item is None:
        return None

    color = COLOR_MAP.get(
        item.get("color"),
        ""
    )

    style = STYLE_MAP.get(
        item.get("style"),
        ""
    )

    category = CATEGORY_MAP.get(
        item.get("category"),
        item.get("category", "")
    )

    return " ".join(
        [
            color,
            style,
            category,
        ]
    ).strip()


def build_prompt(

    dress=None,
    outer=None,
    top=None,
    bottom=None,
    shoes=None,
    bag=None,

):

    lines = [
        "Wear:"
    ]

    if dress:
        lines.append(
            f"- {item_to_prompt(dress)}"
        )

    else:

        if outer:
            lines.append(
                f"- {item_to_prompt(outer)}"
            )

        if top:
            lines.append(
                f"- {item_to_prompt(top)}"
            )

        if bottom:
            lines.append(
                f"- {item_to_prompt(bottom)}"
            )

    if shoes:
        lines.append(
            f"- {item_to_prompt(shoes)}"
        )

    if bag:
        lines.append(
            f"- {item_to_prompt(bag)}"
        )

    return "\n".join(lines)