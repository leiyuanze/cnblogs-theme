# -*- coding: utf-8 -*-
"""从素材池里挑古风女子图，裁成首页卡片封面尺寸（900x600）。"""
import os

from PIL import Image

POOL = r"D:\leiyuanze\cnblogs-beautify\guofeng"
OUT = r"D:\leiyuanze\cnblogs-beautify\sakura\covers-web"
SIZE = (900, 600)          # 卡片封面比例（桌面 440x300 的 2 倍）
TOP_BIAS = 0.28            # 竖图从偏上的位置裁，避免切掉人脸
QUALITY = 82

# pick7 = a 系列（古风二次元）；pick6 = c 系列（古风人物，含写实）
SELECTED = [
    ("pick7", "a01"), ("pick7", "a02"), ("pick7", "a03"), ("pick7", "a06"),
    ("pick7", "a07"), ("pick7", "a08"), ("pick7", "a14"), ("pick7", "a18"),
    ("pick7", "a20"), ("pick7", "a21"), ("pick7", "a26"),
    ("pick6", "c01"), ("pick6", "c02"), ("pick6", "c03"), ("pick6", "c06"),
    ("pick6", "c07"), ("pick6", "c09"), ("pick6", "c10"), ("pick6", "c14"),
    ("pick6", "c18"), ("pick6", "c19"), ("pick6", "c22"), ("pick6", "c27"),
    ("pick6", "c28"), ("pick6", "c30"),
]

os.makedirs(OUT, exist_ok=True)
total = 0
for folder, name in SELECTED:
    src = os.path.join(POOL, folder, "originals", name + ".jpg")
    if not os.path.exists(src):
        print("SKIP (missing)", src)
        continue
    dst = os.path.join(OUT, name + ".jpg")
    with Image.open(src) as im:
        im = im.convert("RGB")
        w, h = im.size
        target_ratio = SIZE[0] / SIZE[1]
        if w / h > target_ratio:                  # 太宽：从中间裁宽
            new_w = int(h * target_ratio)
            left = (w - new_w) // 2
            box = (left, 0, left + new_w, h)
        else:                                     # 太高：从偏上位置裁高
            new_h = int(w / target_ratio)
            top = int((h - new_h) * TOP_BIAS)
            box = (0, top, w, top + new_h)
        im = im.crop(box).resize(SIZE, Image.LANCZOS)
        im.save(dst, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    kb = os.path.getsize(dst) // 1024
    total += kb
    print("%-8s -> %4d KB" % (name, kb))

print("共 %d 张，合计 %d KB" % (len(SELECTED), total))

# 生成一张拼图，方便肉眼检查裁剪效果
files = sorted(f for f in os.listdir(OUT) if f.endswith(".jpg"))
cols, row_h = 5, 180
sheet = Image.new("RGB", (cols * 300, ((len(files) + cols - 1) // cols) * row_h), (20, 20, 20))
for idx, f in enumerate(files):
    with Image.open(os.path.join(OUT, f)) as im:
        thumb = im.resize((300, 200), Image.LANCZOS).crop((0, 10, 300, 190))
    sheet.paste(thumb, ((idx % cols) * 300, (idx // cols) * row_h))
sheet_path = os.path.join(OUT, "_sheet.jpg")
sheet.save(sheet_path, "JPEG", quality=80)
print("拼图 ->", sheet_path)
