# -*- coding: utf-8 -*-
"""pick4 精选 -> 1920x800 头图 + 终选预览。"""
import os
from PIL import Image, ImageDraw, ImageFont

BASE = r"D:\leiyuanze\cnblogs-beautify\guofeng\pick4"
SRC = os.path.join(BASE, "originals")
OUT = os.path.join(BASE, "headers-1920x800")
os.makedirs(OUT, exist_ok=True)

TW, TH = 1920, 800
JOBS = [
    ("s02", "仙山拱桥·夜"),
    ("s03", "云海山峦·晨"),
    ("s04", "月照青峦"),
    ("s07", "暮色原野"),
    ("s08", "星河红霞"),
    ("s09", "花树仙鹤"),
    ("s10", "暮云小镇"),
    ("s13", "流星夜空"),
    ("s15", "星海旅人"),
    ("s16", "霞光星海"),
    ("s18", "灯火长街"),
    ("s19", "暮色城郭"),
    ("s20", "星河守望"),
]


def crop_cover(im):
    w, h = im.size
    scale = max(TW / w, TH / h)
    im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    nw, nh = im.size
    return im.crop(((nw - TW) // 2, (nh - TH) // 2, (nw - TW) // 2 + TW, (nh - TH) // 2 + TH))


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
