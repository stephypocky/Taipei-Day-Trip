import urllib.request as request
import json
import mysql.connector
import mysql.connector
import os
from dotenv import load_dotenv
load_dotenv()

mydb = mysql.connector.connect(
    host="localhost",
    database="taipei_attractions",
    user="root",
    password=os.getenv("password")
)

mycursor = mydb.cursor(buffered=True)

# 在 terminal 建立資料表 spots
# CREATE TABLE spots(
#     id bigint primary key auto_increment,
#     name varchar(255) not null,
#     category varchar(255) not null,
#     description text not null,
#     address varchar(255) not null,
#     transport text not null,
#     mrt varchar(255) not null,
#     latitude float(7, 5)  not null,
#     longitude float(9, 6) not null,
#     images text not null
# )
# (要注意大小寫)


with open("taipei-attractions.json", mode="r", encoding="utf-8") as file:
    data_file = json.load(file)
data = data_file["result"]["results"]
# print(data)

# api 內需要的資料有 id, name, category, description, address, transport, mrt, latitude, longitude, images
# json 內對應的資料： _id, name, CAT, description, address, direction, MRT, latitude, longitude, file

for data_list in data:
    id = data_list["_id"]
    name = data_list["name"]
    category = data_list["CAT"]
    description = data_list["description"]
    address = data_list["address"]
    transport = data_list["direction"]
    mrt = data_list["MRT"]
    if mrt is None:
        mrt = "無捷運可到"
    latitude = data_list["latitude"]
    longitude = data_list["longitude"]
    raw_image = data_list["file"].split("https")
    # print(rawImage)
    sorted_image = []
    for url in raw_image:
        if url.endswith(".jpg") or url.endswith(".JPG"):
            sorted_image.append("https"+url)
    sorted_image = str(sorted_image)
    # print(sorted_image)

    mycursor = mydb.cursor(buffered=True)
    mycursor.execute(
        "INSERT INTO spots (id, name, category, description, address, transport, mrt, latitude, longitude, images) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", (id, name, category, description, address, transport, mrt, latitude, longitude, sorted_image))
    mydb.commit()
mydb.close()
