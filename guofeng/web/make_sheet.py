# -*- coding: utf-8 -*-
"""把 web/originals 里的候选图拼成一张预览大图，方便挑选。"""
import json
import os
from PIL import Image, ImageDraw, ImageFont

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "originals")
OUT = os.path.join(BASE, "candidates-sheet.jpg")
MAP = os.path.join(BASE, "mapping.json")

titles = {}
if os.path.exists(MAP):
    with open(MAP, "r", encoding="utf-8") as fh:
        for row in json.load(fh):
            titles[row["idx"]] = row.get("title", "")

files = sorted(
    f for f in os.listdir(SRC)
    if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")) and os.path.getsize(os.path.join(SRC, f)) > 10000
)

COLS, CW, CH = 4, 420, 260
rows = (len(files) + COLS - 1) // COLS
sheet = Image.new("RGB", (COLS * CW, max(rows, 1) * CH), (20, 20, 20))
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 16)
except Exception:
    font = ImageFont.load_default()

for i, name in enumerate(files):
    idx = int("".join(ch for ch in name if ch.isdigit()) or 0)
    try:
        im = Image.open(os.path.join(SRC, name)).convert("RGB")
    except Exception as exc:
        print("SKIP", name, exc)
        continue
    thumb = im.copy()
    thumb.thumbnail((CW, CH - 28), Image.LANCZOS)
    col, row = i % COLS, i // COLS
    x = col * CW + (CW - thumb.width) // 2
    y = row * CH + (CH - 28 - thumb.height) // 2
    sheet.paste(thumb, (x, y))
    label = f"{idx:02d} {titles.get(idx, '')[:16]} {im.width}x{im.height}"
    draw.rectangle([col * CW, row * CH + CH - 28, col * CW + CW, row * CH + CH], fill=(0, 0, 0))
    draw.text((col * CW + 6, row * CH + CH - 25), label, fill=(240, 240, 240), font=font)

sheet.save(OUT, quality=88)
print("SHEET", sheet.size, OUT)
