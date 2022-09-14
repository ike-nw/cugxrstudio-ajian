# encoding:utf-8
import requests

# client_id 为官网获取的AK， client_secret 为官网获取的SK
host = 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=14YSKWAtBiNb6MasLUR6PR0e&client_secret=Gddb0KsYXuO3PayQdStnBApy5jAtcn8q'
response = requests.get(host)
if response:
    print(response.json())
else:
    print('No response')
