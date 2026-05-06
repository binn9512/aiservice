| 화면 | 버튼 이름 | 함수명 | 동작 |
|---|---|---|---|
| 앱 첫 화면 | 프로필 | `show_profile_screen()` | 프로필 화면으로 이동 |
| 프로필 화면 | 첫 화면으로 돌아가기 | `show_home_screen()` | 앱 첫 화면으로 이동 |

#프로필에서 옷 카테고리 옮기기
  import tkinter as tk

# 현재 선택한 카테고리 저장 변수
selected_category = ""

# 카테고리 화면으로 이동
def show_category_screen(category_name):
    global selected_category
    selected_category = category_name

    closet_frame.pack_forget()

    category_title.config(text=category_name)
    category_desc.config(
        text=f"{category_name} 카테고리에 등록된 옷 목록을 확인하는 화면입니다."
    )

    category_frame.pack(fill="both", expand=True, padx=20, pady=20)

# 옷장 화면으로 돌아가기
def show_closet_screen():
    category_frame.pack_forget()
    closet_frame.pack(fill="both", expand=True, padx=20, pady=20)


# 앱 기본 창
root = tk.Tk()
root.title("옷장 카테고리 화면")
root.geometry("390x700")
root.configure(bg="#f7f3ff")


# =========================
# 1. 옷장 카테고리 화면
# =========================
closet_frame = tk.Frame(root, bg="white", padx=28, pady=28)
closet_frame.pack(fill="both", expand=True, padx=20, pady=20)

title_label = tk.Label(
    closet_frame,
    text="내 옷장",
    font=("Arial", 22, "bold"),
    bg="white",
    fg="#222222"
)
title_label.pack(pady=(40, 10))

desc_label = tk.Label(
    closet_frame,
    text="카테고리별로 옷을 확인해보세요.",
    font=("Arial", 13),
    bg="white",
    fg="#666666"
)
desc_label.pack(pady=(0, 30))

# 카테고리 버튼 영역
category_button_frame = tk.Frame(closet_frame, bg="white")
category_button_frame.pack()

categories = [
    "상의",
    "하의",
    "아우터",
    "신발",
    "가방",
    "원피스"
]

for i, category in enumerate(categories):
    button = tk.Button(
        category_button_frame,
        text=category,
        font=("Arial", 14, "bold"),
        bg="#f5f0ff",
        fg="#333333",
        relief="flat",
        width=12,
        height=3,
        command=lambda c=category: show_category_screen(c)
    )
    button.grid(row=i // 2, column=i % 2, padx=8, pady=10)

# 옷 추가 버튼
add_clothes_button = tk.Button(
    closet_frame,
    text="+ 옷 추가",
    font=("Arial", 13, "bold"),
    bg="#7b61ff",
    fg="white",
    relief="flat",
    width=24,
    height=2
)
add_clothes_button.pack(side="bottom", pady=20)


# =========================
# 2. 카테고리별 옷 목록 화면
# =========================
category_frame = tk.Frame(root, bg="white", padx=28, pady=28)

category_title = tk.Label(
    category_frame,
    text="",
    font=("Arial", 22, "bold"),
    bg="white",
    fg="#222222"
)
category_title.pack(pady=(40, 10))

category_desc = tk.Label(
    category_frame,
    text="",
    font=("Arial", 13),
    bg="white",
    fg="#666666",
    wraplength=300,
    justify="center"
)
category_desc.pack(pady=(0, 30))

# 예시 옷 카드
example_card = tk.Label(
    category_frame,
    text="등록된 옷이 없습니다.\n+ 옷 추가 버튼을 눌러 옷을 등록해보세요.",
    font=("Arial", 13),
    bg="#f5f0ff",
    fg="#555555",
    width=28,
    height=8,
    relief="flat"
)
example_card.pack(pady=20)

back_button = tk.Button(
    category_frame,
    text="옷장으로 돌아가기",
    font=("Arial", 12, "bold"),
    bg="#7b61ff",
    fg="white",
    relief="flat",
    width=22,
    height=2,
    command=show_closet_screen
)
back_button.pack(pady=30)


root.mainloop()
