# -*- coding: utf-8 -*-
"""把下载的国画原图裁成 1920x800 的博客头图，并生成一张预览拼图。"""
import os
from PIL import Image, ImageDraw, ImageFont

BASE = r"D:\leiyuanze\cnblogs-beautify\guofeng"
SRC = os.path.join(BASE, "originals")
OUT = os.path.join(BASE, "header-1920x800")
os.makedirs(OUT, exist_ok=True)

TW, TH = 1920, 800

# (文件名, 标题, 纵向裁切位置 0=上 1=下, 横向裁切位置 0=左 1=右)
JOBS = [
    ("qianli_jiangshan_section", "千里江山图·王希孟（宋）", 0.50, 0.50),
    ("fuchun_shengshan", "富春山居图·剩山图·黄公望（元）", 0.50, 0.50),
    ("fuchun_ziming", "富春山居图·子明卷", 0.50, 0.35),
    ("zaochun_guoxi", "早春图·郭熙（宋）", 0.45, 0.50),
    ("xishan_fankuan", "谿山行旅图·范宽（宋）", 0.38, 0.50),
    ("cleveland_kuncan_spring", "春景山水·髡残（清）", 0.50, 0.50),
    ("cleveland_malin_geese", "落雁图·马麟（宋）", 0.45, 0.50),
    ("cleveland_wangyuanqi_nizan", "仿倪瓒山水·王原祁（清）", 0.50, 0.50),
    ("cleveland_badashanren", "仿郭忠恕山水·八大山人（清）", 0.45, 0.50),
    ("cleveland_zhashibiao_wuling", "武陵溪·查士标（清）", 0.50, 0.50),
    ("cleveland_guomin_herdboys", "牧牛图·郭敏（宋）", 0.50, 0.50),
]


def crop_cover(im, tw, th, vy, hx):
    w, h = im.size
    scale = max(tw / w, th / h)
    im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    nw, nh = im.size
    x = round((nw - tw) * hx)
    y = round((nh - th) * vy)
    return im.crop((x, y, x + tw, y + th))


drawn = []
for name, title, vy, hx in JOBS:
    path = None
    for ext in (".jpg", ".jpeg", ".png", ".webp"):
        candidate = os.path.join(SRC, name + ext)
        if os.path.exists(candidate):
            path = candidate
            break
    if not path:
        print("MISS", name)
        continue
    im = Image.open(path).convert("RGB")
    banner = crop_cover(im, TW, TH, vy, hx)
    out = os.path.join(OUT, name + ".jpg")
    banner.save(out, quality=88)
    drawn.append((name, title))
    print("OK", name, os.path.getsize(out) // 1024, "KB")

# 预览拼图
COLS, CW, CH = 3, 480, 220
rows = (len(drawn) + COLS - 1) // COLS
sheet = Image.new("RGB", (COLS * CW, rows * CH), (22, 22, 22))
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 17)
except Exception:
    font = ImageFont.load_default()

for i, (name, title) in enumerate(drawn):
    p = os.path.join(OUT, name + ".jpg")
    thumb = Image.open(p).resize((CW, CH - 30), Image.LANCZOS)
    col, row = i % COLS, i // COLS
    sheet.paste(thumb, (col * CW, row * CH))
    draw.rectangle([col * CW, row * CH + CH - 30, col * CW + CW, row * CH + CH], fill=(0, 0, 0))
    draw.text((col * CW + 8, row * CH + CH - 26), f"{i + 1:02d} {title}", fill=(255, 255, 255), font=font)

sheet_path = os.path.join(BASE, "contact-sheet.jpg")
sheet.save(sheet_path, quality=88)
print("SHEET", sheet.size, sheet_path)
