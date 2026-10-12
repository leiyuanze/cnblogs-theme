# -*- coding: utf-8 -*-
"""把选中的候选图裁成 1920x800 头图，并生成最终预览拼图。"""
import os
from PIL import Image, ImageDraw, ImageFont

BASE = r"D:\leiyuanze\cnblogs-beautify\guofeng\web"
SRC = os.path.join(BASE, "originals")
OUT = os.path.join(BASE, "headers-1920x800")
os.makedirs(OUT, exist_ok=True)

TW, TH = 1920, 800

# (文件名, 说明, 纵向位置, 横向位置, 预裁掉右侧像素, 预裁掉底部像素)
JOBS = [
    ("img01", "幻彩山水古楼（插画）", 0.50, 0.50, 0, 0),
    ("img02", "江南水乡（实拍）", 0.50, 0.50, 0, 0),
    ("img03", "江南水乡·傍晚（实拍）", 0.50, 0.50, 0, 0),
    ("img05", "山川古建（水墨）", 0.50, 0.50, 0, 0),
    ("img07", "水墨山水·双峰", 0.50, 0.50, 0, 0),
    ("img09", "水墨山水·孤松", 0.50, 0.50, 0, 0),
    ("img11", "水墨山水·主峰", 0.50, 0.50, 0, 0),
    ("img12", "水墨山水·小舟", 0.50, 0.50, 0, 0),
    ("img15", "水墨山水·楼阁", 0.50, 0.50, 0, 0),
    ("img19", "水乡乌篷船（实拍）", 0.50, 0.50, 0, 0),
    ("img25", "故宫·宫门框景（实拍）", 0.60, 0.00, 90, 40),
    ("img26", "雪后故宫·角楼（实拍）", 0.42, 0.00, 320, 140),
]


def crop_cover(im, vy, hx):
    w, h = im.size
    scale = max(TW / w, TH / h)
    im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    nw, nh = im.size
    x = round((nw - TW) * hx)
    y = round((nh - TH) * vy)
    return im.crop((x, y, x + TW, y + TH))


drawn = []
for name, title, vy, hx, cut_r, cut_b in JOBS:
    path = os.path.join(SRC, name + ".jpg")
    if not os.path.exists(path):
        print("MISS", name)
        continue
    im = Image.open(path).convert("RGB")
    if cut_r or cut_b:
        w, h = im.size
        im = im.crop((0, 0, max(1, w - cut_r), max(1, h - cut_b)))
    banner = crop_cover(im, vy, hx)
    out = os.path.join(OUT, name + ".jpg")
    banner.save(out, quality=88)
    drawn.append((name, title))
    print("OK", name, os.path.getsize(out) // 1024, "KB", title)

COLS, CW, CH = 3, 560, 250
rows = (len(drawn) + COLS - 1) // COLS
sheet = Image.new("RGB", (COLS * CW, rows * CH), (18, 18, 18))
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 17)
except Exception:
    font = ImageFont.load_default()

for i, (name, title) in enumerate(drawn):
    im = Image.open(os.path.join(OUT, name + ".jpg"))
    thumb = im.resize((CW, CH - 30), Image.LANCZOS)
    col, row = i % COLS, i // COLS
    sheet.paste(thumb, (col * CW, row * CH))
    draw.rectangle([col * CW, row * CH + CH - 30, col * CW + CW, row * CH + CH], fill=(0, 0, 0))
    draw.text((col * CW + 8, row * CH + CH - 26), f"{i + 1:02d} {title}", fill=(245, 245, 245), font=font)

sheet_path = os.path.join(BASE, "final-headers-sheet.jpg")
sheet.save(sheet_path, quality=90)
print("SHEET", sheet.size, sheet_path)
