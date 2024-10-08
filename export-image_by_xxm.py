import os
import re
import requests
import datetime
from urllib.parse import urlparse, urlunparse

markdown_folder = os.environ.get("MARKDOWN_DIR", os.path.join(os.getcwd(), "output"))
image_folder = os.path.join(markdown_folder, "images")
if not os.path.exists(markdown_folder):
    print("MARKDOWN_DIR not set, and not exist %s" % markdown_folder)
    exit()
if not os.path.exists(image_folder):
    os.mkdir(image_folder)


download_image = True

update_image_url = True

replace_image_host = os.environ.get("REPLACE_IMAGE_HOST", "")

# 初始化正则表达式用于匹配图片标签
img_tag_pattern1 = r'!\[.*?\]\((.*?)\)'
img_tag_pattern2 = r'http://124.223.26.211:8080.*?\.png'

# 遍历文件夹中的所有 Markdown 文件
for root, dirs, files in os.walk(markdown_folder):
    for file in files:
        if file.endswith(".md"):
            md_file = os.path.join(root, file)
            # print(md_file)

            # 读取 Markdown 文件内容
            with open(md_file, "r", encoding="utf-8") as f:
                markdown_content = f.read()

            # 使用正则表达式查找所有图片链接
            img_links = re.findall(img_tag_pattern1, markdown_content)
            img_links1 = re.findall(img_tag_pattern2, markdown_content)
            img_links.extend(img_links1)

            replace_image_url = False
            for img_link in img_links:
                print(img_link)
                parsed_url = urlparse(img_link)
                if not parsed_url.scheme:
                    continue
                img_filename = re.search(r'/([^/]+\.(png|jpg|jpeg|gif|svg))$', parsed_url.path)
                print(img_filename)

                if img_filename:
                    img_filename = img_filename.group(1)
                else:
                    continue
                if download_image:
                    if not os.path.exists(image_folder):
                        os.mkdir(image_folder)
 
                    img_url = urlunparse(parsed_url._replace(fragment=""))
                    print(img_url)
                    response = requests.get(img_url)
                    if response.status_code == 200:
                        with open(os.path.join(image_folder, img_filename), "wb") as img_file:
                            img_file.write(response.content)
                            print(f"Downloaded: {img_filename}")
                
                if update_image_url: 
                    if not replace_image_host.strip():
                        relative_path = os.path.relpath(image_folder, root).replace("\\", "/")
                        new_img_link = f'{relative_path}/{img_filename}'
                    else:
                        replace_image_host = replace_image_host.rstrip("/")
                        new_img_link = f'{replace_image_host}{img_filename}'
                    markdown_content = markdown_content.replace(img_link, new_img_link)
                    replace_image_url = True

            # 保存修改后的Markdown文件
            if replace_image_url:
                print(md_file)
                with open(md_file, "w", encoding="utf-8") as f:
                    f.write(markdown_content)

print("Image link replacement complete.")

