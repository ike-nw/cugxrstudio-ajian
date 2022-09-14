# for python 3.10 or later
import collections.abc

collections.Iterable = collections.abc.Iterable
collections.Mapping = collections.abc.Mapping
collections.MutableSet = collections.abc.MutableSet
collections.MutableMapping = collections.abc.MutableMapping

import tkinter as tk
from tkinter import ttk
from tkinter import *
from PIL import Image, ImageTk, ImageOps
from tkinter.filedialog import askopenfile
from aip import AipOcr
import requests
import base64

# -- 配置百度AI --
# 你的 APPID AK SK
APP_ID = "****"
API_KEY = "****"
SECRET_KEY = "****"

client = AipOcr(APP_ID, API_KEY, SECRET_KEY)

# 创建GUI窗口
root = tk.Tk()
root.geometry('900x600')
root.title('OCR')

# 图片预览和识别结果使用全局变量，防止多个图片叠在一起
preview = Label(root, bg="Black")
result_box = Label(root, bg="Black", text='')


# -- 函数部分 --

# 选择文件并预览
def open_file():
    browse_text.set("loading...")
    filename = askopenfile(parent=root, mode="rb", title="选择要识别的图片",
                           filetypes=[("Image Files", "*.png *.jpg")])

    # 在窗口预览文件
    if filename:
        img = Image.open(filename)
        resized = ImageOps.contain(img, (500, 500))  # 限定图片尺寸
        img = ImageTk.PhotoImage(resized)
        preview.config(image=img)
        preview.image = img
        preview.grid(row=3, columnspan=2, sticky=W)

        # tk.Button[command]无法获得return，因此用全局变量传递出文件路径
        global image_path
        image_path = filename.name


def start_analysis(path):
    # 根据下拉框选择对应分类
    if image_type.Chosen.current() == 0:  # 当选择下拉框中的第一个选项时
        result = general(path)
        # 筛选结果字符串
        result_str = ''
        for i in result['words_result']:
            result_str += i['words'] + '\n'

        Label(root, text=result_str).grid(row=1, column=2, sticky=W)

    elif image_type.Chosen.current() == 1:  # 选择第二个选项时
        result = id_card(path)
        strover = '---身份证信息识别---\n'
        strover += '住址：{}\n公民身份号码：{}\n出生：{}\n姓名：{}\n性别：{}\n民族：{}'. \
            format(result['words_result']['住址']['words'], result['words_result']['公民身份号码']['words'],
                   result['words_result']['出生']['words'], result['words_result']['姓名']['words'],
                   result['words_result']['性别']['words'], result['words_result']['民族']['words'])

        result_box['text'] = strover
        result_box.grid(row=1, column=2, sticky=W)


# 通用识别
def general(path):
    with open(path, 'rb') as fp:  # 二进制读取图片
        img = fp.read()

    result = client.basicGeneral(img)  # 调用百度OCR
    return result


# 身份证识别
def id_card(path):
    '''
    身份证识别
    '''

    request_url = "https://aip.baidubce.com/rest/2.0/ocr/v1/idcard"
    # 二进制方式打开图片文件
    f = open(path, 'rb')
    img = base64.b64encode(f.read())

    params = {"id_card_side": "front", "image": img}
    access_token = '[****]'
    request_url = request_url + "?access_token=" + access_token
    headers = {'content-type': 'application/x-www-form-urlencoded'}
    response = requests.post(request_url, data=params, headers=headers)
    if response:
        return response.json()


# 区块标题
Label(root, text="识别类型").grid(row=0, column=0, sticky=W)
Label(root, text="选择图片").grid(row=1, column=0, sticky=W)
Label(root, text="识别结果").grid(row=0, column=2, sticky=W)

# 下拉选框
image_type = tk.StringVar()
image_type.Chosen = ttk.Combobox(root, width=10, textvariable=image_type)
image_type.Chosen['values'] = ('通用识别', '身份证识别')
image_type.Chosen.grid(row=0, column=1, sticky=W)
image_type.Chosen.current(0)

# 浏览选择文件
browse_text = tk.StringVar()
browse_text.set("浏览")
browse_btn = tk.Button(root, text='选择文件', command=open_file)
browse_btn.grid(row=1, column=1)

# 开始分析
start_btn = tk.Button(root, text='开始分析图片', command=lambda: [start_analysis(image_path)])
start_btn.grid(row=2, column=1)

root.mainloop()
