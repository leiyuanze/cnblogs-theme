# -*- coding: utf-8 -*-
"""pick5 古风精选 -> 1920x800 头图 + 终选预览。"""
import os
from PIL import Image, ImageDraw, ImageFont

BASE = r"D:\leiyuanze\cnblogs-beautify\guofeng\pick5"
SRC = os.path.join(BASE, "originals")
OUT = os.path.join(BASE, "headers-1920x800")
os.makedirs(OUT, exist_ok=True)

TW, TH = 1920, 800
JOBS = [
    ("g03", "古河灯夜"),
    ("g08", "灯笼长街"),
    ("g09", "长街深灯"),
    ("g10", "水上灯城"),
    ("g11", "雪夜灯街"),
    ("g13", "古街黄昏"),
    ("g02", "汉服花神"),
    ("g07", "古宅庭院"),
    ("p3q01", "白龙少年"),
    ("p3q02", "樱下发影"),
]


def crop_cover(im):
    w, h = im.size
    scale = max(TW / w, TH / h)
    im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    nw, nh = im.size
    x = (nw - TW) // 2
    y = (nh - TH) // 2
    return im.crop((x, y, x + TW, y + TH))


drawn = []
for name, title in JOBS:
    path = os.path.join(SRC, name + ".jpg")
    if not os.path.exists(path):
        print("MISS", name)
        continue
    im = Image.open(path).convert("RGB")
    banner = crop_cover(im)
    out = os.path.join(OUT, name + ".jpg")
    banner.save(out, quality=90)
    drawn.append((name, title))
    print("OK", name, os.path.getsize(out) // 1024, "KB", title)

COLS, CW, CH = 3, 620, 300
rows = (len(drawn) + COLS - 1) // COLS
sheet = Image.new("RGB", (COLS * CW, rows * CH), (14, 14, 14))
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 18)
except Exception:
    font = ImageFont.load_default()

for i, (name, title) in enumerate(drawn):
    im = Image.open(os.path.join(OUT, name + ".jpg"))
    thumb = im.resize((CW, CH - 32), Image.LANCZOS)
    col, row = i % COLS, i // COLS
    sheet.paste(thumb, (col * CW, row * CH))
    draw.rectangle([col * CW, row * CH + CH - 32, col * CW + CW, row * CH + CH], fill=(0, 0, 0))
    draw.text((col * CW + 8, row * CH + CH - 27), f"{i + 1:02d} {title}", fill=(245, 245, 245), font=font)

sheet_path = os.path.join(BASE, "final-sheet.jpg")
sheet.save(sheet_path, quality=90)
print("SHEET", sheet.size, sheet_path)
