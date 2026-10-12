# -*- coding: utf-8 -*-
"""把皮肤头图压成网页尺寸，准备上传到博客园图片库（原图不动）。"""
import os

from PIL import Image

SRC = r"D:\leiyuanze\github\leiyuanze.github.io\skin\headers"
OUT = r"D:\leiyuanze\cnblogs-beautify\sakura\headers-web"
SIZE = (1600, 667)
QUALITY = 82

os.makedirs(OUT, exist_ok=True)

files = sorted(f for f in os.listdir(SRC) if f.lower().endswith(".jpg"))
total_before = 0
total_after = 0
for name in files:
    src = os.path.join(SRC, name)
    dst = os.path.join(OUT, name)
    before = os.path.getsize(src)
    with Image.open(src) as im:
        im = im.convert("RGB")
        im = im.resize(SIZE, Image.LANCZOS)
        im.save(dst, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    after = os.path.getsize(dst)
    total_before += before
    total_after += after
    print("%-10s %6d KB -> %5d KB" % (name, before // 1024, after // 1024))

print("TOTAL %d KB -> %d KB (%.0f%%)" % (total_before // 1024, total_after // 1024, 100.0 * total_after / total_before))
