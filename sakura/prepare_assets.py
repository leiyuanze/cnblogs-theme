# -*- coding: utf-8 -*-
"""把选定的头图/人物图整理进 leiyuanze.github.io 仓库的 skin/ 目录（当图床用）。"""
import json
import os
import shutil
from PIL import Image

REPO = r"D:\leiyuanze\github\leiyuanze.github.io"
SKIN = os.path.join(REPO, "skin")
HDR = os.path.join(SKIN, "headers")
CHR = os.path.join(SKIN, "chars")
os.makedirs(HDR, exist_ok=True)
os.makedirs(CHR, exist_ok=True)

P4 = r"D:\leiyuanze\cnblogs-beautify\guofeng\pick4\headers-1920x800"
P5 = r"D:\leiyuanze\cnblogs-beautify\guofeng\pick5\headers-1920x800"
P7 = r"D:\leiyuanze\cnblogs-beautify\guofeng\pick7\originals"

# 头图：星空/夜景/山水 13 张 + 古风夜灯 7 张
HEADERS = [
    (P4, "s02", "仙山拱桥·夜"),
    (P4, "s03", "云海山峦·晨"),
    (P4, "s04", "月照青峦"),
    (P4, "s07", "暮色原野"),
    (P4, "s08", "星河红霞"),
    (P4, "s09", "花树仙鹤"),
    (P4, "s10", "暮云小镇"),
    (P4, "s13", "流星夜空"),
    (P4, "s15", "星海旅人"),
    (P4, "s16", "霞光星海"),
    (P4, "s18", "灯火长街"),
    (P4, "s19", "暮色城郭"),
    (P4, "s20", "星河守望"),
    (P5, "g03", "古河灯夜"),
    (P5, "g08", "灯笼长街"),
    (P5, "g09", "长街深灯"),
    (P5, "g10", "水上灯城"),
    (P5, "g11", "雪夜灯街"),
    (P5, "g13", "古街黄昏"),
    (P5, "g07", "古宅庭院"),
]

# 人物图（侧边栏/配图）
CHARS = [
    ("a01", "白狐纸伞"),
    ("a02", "和风留声机"),
    ("a05", "白发侧颜"),
    ("a07", "灯笼少女"),
    ("a08", "红白和服"),
    ("a18", "红纸伞"),
]

manifest = {"headers": [], "chars": []}

for i, (src_dir, name, title) in enumerate(HEADERS, 1):
    src = os.path.join(src_dir, name + ".jpg")
    if not os.path.exists(src):
        print("MISS header", name)
        continue
    dst_name = f"h{i:02d}.jpg"
    shutil.copyfile(src, os.path.join(HDR, dst_name))
    manifest["headers"].append({"file": f"skin/headers/{dst_name}", "title": title})
    print("OK", dst_name, title)

for i, (name, title) in enumerate(CHARS, 1):
    src = os.path.join(P7, name + ".jpg")
    if not os.path.exists(src):
        print("MISS char", name)
        continue
    im = Image.open(src).convert("RGB")
    if im.width > 900:
        im = im.resize((900, round(im.height * 900 / im.width)), Image.LANCZOS)
    dst_name = f"c{i:02d}.jpg"
    im.save(os.path.join(CHR, dst_name), quality=88)
    manifest["chars"].append({"file": f"skin/chars/{dst_name}", "title": title})
    print("OK", dst_name, title, im.size)

with open(os.path.join(SKIN, "manifest.json"), "w", encoding="utf-8") as fh:
    json.dump(manifest, fh, ensure_ascii=False, indent=2)
print("DONE")
