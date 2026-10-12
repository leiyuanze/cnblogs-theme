# -*- coding: utf-8 -*-
"""pick2 精选场景图 -> 1920x800 头图（含去边角水印的预裁），并输出终选预览。"""
import os
import shutil
from PIL import Image, ImageDraw, ImageFont

BASE = r"D:\leiyuanze\cnblogs-beautify\guofeng\pick2"
SRC = os.path.join(BASE, "originals")
OUT = os.path.join(BASE, "headers-1920x800")
OLD = r"D:\leiyuanze\cnblogs-beautify\guofeng\web\headers-1920x800"
os.makedirs(OUT, exist_ok=True)

TW, TH = 1920, 800

# (文件, 标题, 纵向位置, 预裁 左/右/上/下)
JOBS = [
    ("p06", "风月幻想·月下楼阁", 0.50, 0.50, 90, 90, 20, 50),
    ("p44", "璃月·夜枫山门", 0.50, 0.50, 0, 150, 0, 70),
    ("p45", "璃月·夜灯庭院", 0.50, 0.50, 0, 150, 0, 70),
    ("p46", "璃月·溶月楼阁", 0.50, 0.50, 0, 150, 0, 70),
    ("p47", "璃月·红枫飞檐", 0.50, 0.50, 0, 150, 0, 70),
    ("p49", "诛仙·中州仙城", 0.55, 0.50, 0, 170, 0, 90),
    ("p50", "古剑·碧水长桥", 0.50, 0.50, 0, 130, 0, 60),
    ("p53", "剑网3·雪岭楼台", 0.45, 0.50, 0, 110, 0, 60),
    ("p54", "寻仙·踏云山门", 0.50, 0.50, 0, 130, 0, 60),
    ("p58", "诛仙·水上仙都", 0.50, 0.50, 0, 170, 0, 90),
    ("p64", "诛仙·千灯夜楼", 0.50, 0.50, 130, 0, 0, 70),
    ("p02", "仙女湖·龙王阁日出", 0.50, 0.50, 0, 90, 0, 40),
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
for name, title, vy, hx, cl, cr, ct, cb in JOBS:
    path = os.path.join(SRC, name + ".jpg")
    if not os.path.exists(path):
        print("MISS", name)
        continue
    im = Image.open(path).convert("RGB")
    w, h = im.size
    im = im.crop((cl, ct, w - cr, h - cb))
    banner = crop_cover(im, vy, hx)
    out = os.path.join(OUT, name + ".jpg")
    banner.save(out, quality=90)
    drawn.append((name, title))
    print("OK", name, os.path.getsize(out) // 1024, "KB", title)

# 用户已认可的 01/04 一并放进终选目录
for old, new, title in (("img01", "kept-01", "幻彩山水古楼"), ("img05", "kept-04", "山川古建")):
    src = os.path.join(OLD, old + ".jpg")
    if os.path.exists(src):
        shutil.copyfile(src, os.path.join(OUT, new + ".jpg"))
        drawn.insert(0 if new == "kept-01" else 1, (new, title))
        print("KEEP", new, title)

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
