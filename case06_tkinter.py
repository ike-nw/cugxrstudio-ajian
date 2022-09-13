import pyaudio
import wave
from tkinter import *

# for python 3.10 or later
import collections.abc
collections.Iterable = collections.abc.Iterable
collections.Mapping = collections.abc.Mapping
collections.MutableSet = collections.abc.MutableSet
collections.MutableMapping = collections.abc.MutableMapping

from aip import AipSpeech

CHUNK = 1024  # 数据包、数据片段
FORMAT = pyaudio.paInt16  # pyaudio.paInt16 表示我们使用量化位数 16 位来进行录音
CHANNELS = 1  # 声道数
RATE = 16000  # 采样率
RECORD_SECONDS = 5  # 录音时间。这里是 5 秒

WAVE_OUTPUT_FILENAME = "output.wav"  # 要写入的文件名


def start_rec():
    p = pyaudio.PyAudio()  # 创建 PyAudio 对象
    stream = p.open(format=FORMAT,  # 打开数据流
                    channels=CHANNELS,
                    rate=RATE,
                    input=True,
                    frames_per_buffer=CHUNK)

    frames = []

    for i in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK)
        frames.append(data)  # 开始录音

    stream.stop_stream()  # 停止数据流
    stream.close()  # 关闭数据流
    p.terminate()  # 关闭 PyAudio

    wf = wave.open(WAVE_OUTPUT_FILENAME, 'wb')  # 写入录音文件、保存
    wf.setnchannels(CHANNELS)  # 设置声道
    wf.setsampwidth(p.get_sample_size(FORMAT))  # 设置采样位数
    wf.setframerate(RATE)  # 设置采样率
    wf.writeframes(b''.join(frames))  # 设置参数组，数组同上述读取的数组
    wf.close()

    Label(window, text="录音完成，文件已保存为 output.wav", font="none 12 bold").grid(row=2, column=0, sticky=W)
    Label(window, text="您的录音识别结果如下：", font="none 12 bold").grid(row=5, column=0, sticky=W)


# """ 你的 APPID AK SK """
APP_ID = '********'
API_KEY = '********'
SECRET_KEY = '********'

client = AipSpeech(APP_ID, API_KEY, SECRET_KEY)


# 读取文件
def get_file_content(filepath):
    with open(filepath, 'rb') as fp:  # rb只读
        return fp.read()


# 识别本地文件
result = client.asr(get_file_content(r'/Users/willni/Desktop/python-baiduai-sample/case/output.wav'), 'wav', 16000,
                    {
                        'dev_pid': 1537,
                    })
# print(result)

# GUI
window = Tk()
window.title("语音识别")
window.geometry('670x395+450+240')

Label(window, text="点击按钮开始录音", font="none 12 bold").grid(row=0, column=0, sticky=W)

btnStart = Button(window, text="开始录音", width=6, command=start_rec)
btnStart.grid(row=4, column=0, sticky=W)

text_box = Text(window, width=70, height=10, wrap=WORD)
text_box.insert(1.0, result)
text_box.grid(row=6, column=0, columnspan=2, sticky=W)

window.mainloop()
