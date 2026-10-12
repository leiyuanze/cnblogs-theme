# -*- coding: utf-8 -*-
"""pick4 候选图（二次元星空/夜景/山水）预览拼图。"""
import os
from PIL import Image, ImageDraw, ImageFont

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "originals")
OUT = os.path.join(BASE, "sheet.jpg")

files = []
for f in sorted(os.listdir(SRC)):
    if not f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        continue
    path = os.path.join(SRC, f)
    if os.path.getsize(path) < 60000:
        continue
    try:
        im = Image.open(path)
        if im.width < 1200 or im.height < 700:
            continue
    except Exception:
        continue
    files.append(f)

COLS, CW, CH = 4, 430, 280
rows = (len(files) + COLS - 1) // COLS
sheet = Image.new("RGB", (COLS * CW, max(rows, 1) * CH), (16, 16, 16))
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 15)
except Exception:
    font = ImageFont.load_default()

for i, name in enumerate(files):
    im = Image.open(os.path.join(SRC, name)).convert("RGB")
    thumb = im.copy()
    thumb.thumbnail((CW - 10, CH - 30), Image.LANCZOS)
    col, row = i % COLS, i // COLS
    sheet.paste(thumb, (col * CW + 5, row * CH + 4))
    label = f"{os.path.splitext(name)[0]} {im.width}x{im.height}"
    draw.rectangle([col * CW, row * CH + CH - 26, col * CW + CW, row * CH + CH], fill=(0, 0, 0))
    draw.text((col * CW + 6, row * CH + CH - 23), label, fill=(235, 235, 235), font=font)

sheet.save(OUT, quality=88)
print("FILES", len(files), "SHEET", sheet.size, OUT)
