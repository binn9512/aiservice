import tkinter as tk
from tkinter import messagebox

selected_style = ""

def select_style(style, button):
    global selected_style
    selected_style = style

    for btn in style_buttons:
        btn.config(bg="#f5f0ff", fg="black")

    button.config(bg="#7b61ff", fg="white")

def go_next():
    if selected_style == "":
        messagebox.showwarning("알림", "추구하는 스타일을 선택해주세요!")
        return

    style_korean = {
        "casual": "캐주얼",
        "business": "비즈니스룩",
        "street": "스트릿",
        "vintage": "빈티지",
        "minimal": "미니멀"
    }

    result = style_korean[selected_style]

    style_frame.pack_forget()
    result_label.config(
        text=f"선택한 스타일은 '{result}'입니다.\n이 정보를 바탕으로 스타일 추천을 진행합니다."
    )
    result_frame.pack(fill="both", expand=True)

def go_back():
    result_frame.pack_forget()
    style_frame.pack(fill="both", expand=True)

root = tk.Tk()
root.title("스타일 분석 앱")
root.geometry("390x700")
root.configure(bg="#f7f3ff")

style_frame = tk.Frame(root, bg="white", padx=28, pady=28)
style_frame.pack(fill="both", expand=True, padx=20, pady=20)

step_label = tk.Label(
    style_frame,
    text="1   2   3   4",
    font=("Arial", 14, "bold"),
    bg="white",
    fg="#7b61ff"
)
step_label.pack(anchor="w", pady=(0, 20))

skip_button = tk.Button(
    style_frame,
    text="Skip",
    bd=0,
    bg="white",
    fg="gray",
    font=("Arial", 11)
)
skip_button.pack(anchor="e")

title_label = tk.Label(
    style_frame,
    text="추구하는 스타일을 선택해주세요",
    font=("Arial", 20, "bold"),
    bg="white",
    fg="#222222"
)
title_label.pack(anchor="w", pady=(40, 10))

desc_label = tk.Label(
    style_frame,
    text="원하는 스타일을 선택하면\n더 잘 맞는 코디를 추천받을 수 있습니다.",
    font=("Arial", 12),
    bg="white",
    fg="#666666",
    justify="left"
)
desc_label.pack(anchor="w", pady=(0, 30))

button_frame = tk.Frame(style_frame, bg="white")
button_frame.pack(fill="x")

style_buttons = []

styles = [
    ("캐주얼", "casual"),
    ("비즈니스룩", "business"),
    ("스트릿", "street"),
    ("빈티지", "vintage"),
    ("미니멀", "minimal")
]

for i, (text, value) in enumerate(styles):
    btn = tk.Button(
        button_frame,
        text=text,
        font=("Arial", 13),
        bg="#f5f0ff",
        fg="black",
        relief="flat",
        width=14,
        height=2
    )
    btn.config(command=lambda v=value, b=btn: select_style(v, b))
    btn.grid(row=i // 2, column=i % 2, padx=6, pady=8)
    style_buttons.append(btn)

bottom_frame = tk.Frame(style_frame, bg="white")
bottom_frame.pack(side="bottom", fill="x", pady=20)

prev_button = tk.Button(
    bottom_frame,
    text="Previous",
    font=("Arial", 12),
    bg="#eeeeee",
    fg="#555555",
    relief="flat",
    width=12,
    height=2
)
prev_button.pack(side="left")

next_button = tk.Button(
    bottom_frame,
    text="Next",
    font=("Arial", 12, "bold"),
    bg="#7b61ff",
    fg="white",
    relief="flat",
    width=12,
    height=2,
    command=go_next
)
next_button.pack(side="right")

result_frame = tk.Frame(root, bg="white", padx=28, pady=28)

result_title = tk.Label(
    result_frame,
    text="선택 완료",
    font=("Arial", 22, "bold"),
    bg="white",
    fg="#222222"
)
result_title.pack(pady=(100, 20))

result_label = tk.Label(
    result_frame,
    text="",
    font=("Arial", 14),
    bg="white",
    fg="#555555",
    justify="center"
)
result_label.pack(pady=20)

back_button = tk.Button(
    result_frame,
    text="다시 선택하기",
    font=("Arial", 12, "bold"),
    bg="#7b61ff",
    fg="white",
    relief="flat",
    width=16,
    height=2,
    command=go_back
)
back_button.pack(pady=30)

root.mainloop()
