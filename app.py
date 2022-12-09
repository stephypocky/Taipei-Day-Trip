from mysql.connector import errors
from mysql.connector import pooling
from flask import *
import mysql.connector
import jwt
import time
from datetime import datetime, timedelta
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv
load_dotenv()

bcrypt = Bcrypt()

# JWT header
headers = {
    "typ": "JWT",
    "alg": "HS256"
}

# JWT key
key = '_5#y2L"F4Q8z\nc]/'

app = Flask(__name__)
app.secret_key = '_5#y2L"F4Q8z\nc]/'
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["JSON_SORT_KEYS"] = False

dbconfig = {
    "user": "root",
    "password": os.getenv("password"),
    "host": "localhost",
    "database": "taipei_attractions"
}

# ------- Get connection object from a pool -------

connection_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool",
                                                              pool_size=10,
                                                              pool_reset_session=True,
                                                              **dbconfig)

# Pages


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/attraction/<id>")
def attraction(id):
    return render_template("attraction.html")


@app.route("/booking")
def booking():
    return render_template("booking.html")


@app.route("/thankyou")
def thankyou():
    return render_template("thankyou.html")

# ------- 取得景點資料列表 -------


@app.route("/api/attractions", methods=["GET"])
def api_attractions():

    try:
        page = request.args.get("page", None)
        page = int(page)  # 將字串page轉換成integer
        page_index = page * 12
        keyword = request.args.get("keyword", None)
        return_data = []
        connection_object = connection_pool.get_connection()
        mycursor = connection_object.cursor()

        if keyword != None:  # 有keyword，回傳 keyword 的資料
            mycursor.execute(
                f'SELECT * FROM spots WHERE category=%s or name like "%{keyword}%" ORDER BY id LIMIT {page_index},12', (keyword,))
            data = mycursor.fetchall()
            data = list(data)
            # print(data)

            if len(data) >= 12:
                next_page = page + 1
            else:
                next_page = None

            for x in range(len(data)):
                result = {
                    "id": data[x][0],
                    "name": data[x][1],
                    "category": data[x][2],
                    "description": data[x][3],
                    "address": data[x][4],
                    "transport": data[x][5],
                    "mrt": data[x][6],
                    "latitude": data[x][7],
                    "longitude": data[x][8],
                    "images": eval(data[x][9])
                }
                return_data.append(result)  # 把資料塞進去
                # print(result)

            final_result = {"nextPage": next_page, "data": return_data}
            # final_result.headers.add('Access-Control-Allow-Origin', '*')
            return jsonify(final_result)

        if keyword == None:  # 沒有keyword，回傳全部資料
            mycursor.execute(
                "SELECT * FROM spots ORDER BY id LIMIT %s,12", (page_index,))
            # limit[index,count] 代表從page_index開始算，回傳到第12筆
            data = mycursor.fetchall()
            data = list(data)

            if len(data) >= 12:
                next_page = page + 1
            else:
                next_page = None
            # print(data)
            # print(len(data))

            for x in range(len(data)):
                result = {
                    "id": data[x][0],
                    "name": data[x][1],
                    "category": data[x][2],
                    "description": data[x][3],
                    "address": data[x][4],
                    "transport": data[x][5],
                    "mrt": data[x][6],
                    "latitude": data[x][7],
                    "longitude": data[x][8],
                    "images": eval(data[x][9]),
                }
                return_data.append(result)  # 把資料塞進去
                # print(result)

            final_result = {"nextPage": next_page, "data": return_data}
            # final_result.headers.add('Access-Control-Allow-Origin', '*')
            return jsonify(final_result)
    except:
        return {
            "error": True,
            "message": "伺服器內部錯誤"
        }, 500

    finally:
        mycursor.close()
        connection_object.close()

#  ------- 根據景點編號（id) 取得 景點資料 -------


# 用.replace把{}換成<>
@app.route("/api/attraction/{attractionId}".replace("{", "<").replace("}", ">"))
def api_attraction_id(attractionId):
    try:
        connection_object = connection_pool.get_connection()
        mycursor = connection_object.cursor()
        id = request.args.get("id", None)
        attractionId = int(attractionId)
        mycursor.execute(
            "SELECT * FROM spots WHERE id=%s", (attractionId,))
        data = mycursor.fetchone()
        final_result = {
            "data": {
                "id": data[0],
                "name": data[1],
                "category": data[2],
                "description": data[3],
                "address": data[4],
                "transport": data[5],
                "mrt": data[6],
                "latitude": data[7],
                "longitude": data[8],
                "images": eval(data[9])  # string 轉 list, 若 list 裡有 []，可用eval
            }
        }
        # final_result.headers.add('Access-Control-Allow-Origin', '*')
        return jsonify(final_result)

    except TypeError:
        return {
            "error": True,
            "messgae": "景點編號不正確"
        }, 400

    except Exception as err:
        return {
            "error": True,
            "messgae": "伺服器內部錯誤"
        }, 500

    finally:
        mycursor.close()
        connection_object.close()

#  ------- 取得景點分類(category)列表 -------


@app.route("/api/categories",  methods=["GET"])
def api_categories():
    try:
        connection_object = connection_pool.get_connection()
        mycursor = connection_object.cursor()
        categories = request.args.get("categories", None)
        mycursor.execute(
            "SELECT category FROM spots GROUP BY category")
        data = mycursor.fetchall()
        # print(data)
        sorted_data = []
        for x in data:  # 要把list of tuples 用迴圈取出，再append到空的[]裡
            # print(x[0])
            sorted_data.append(x[0])
            result = {
                "data": sorted_data
            }
        # result.headers.add('Access-Control-Allow-Origin', '*')
        return jsonify(result)

    except:
        return {
            "error": True,
            "message": "伺服器內部錯誤"
        }, 500

    finally:
        mycursor.close()
        connection_object.close()

#  ------- 註冊新會員 -------


@app.route("/api/user",  methods=["POST"])
def signup():
    try:
        connection_object = connection_pool.get_connection()
        mycursor = connection_object.cursor()
        data = request.get_json()
        # print(data)
        username = data["username"]
        email = data["email"]
        password = data["password"]
        hashed_password = bcrypt.generate_password_hash(password=password)
        mycursor.execute(
            "SELECT id ,username, email, password FROM member WHERE email =%s", (email,))
        myresult = mycursor.fetchone()
        if myresult != None:
            return {
                "error": True,
                "message": "註冊失敗，重複的 Email  "
            }, 400

        else:
            mycursor.execute(
                "INSERT INTO member (username, email, password) VALUES (%s, %s, %s)", (username, email, hashed_password))
            connection_object.commit()
            return {
                "ok": True
            }, 200

    except:
        return {
            "error": True,
            "message": "伺服器內部錯誤"
        }, 500

    finally:
        mycursor.close()
        connection_object.close()

#  ------- 會員登入 -------


@app.route("/api/user",  methods=["PUT"])
def signin():
    try:
        connection_object = connection_pool.get_connection()
        mycursor = connection_object.cursor()
        data = request.get_json()
        # print(data)
        email = data["email"]
        # print(email)
        password = data["password"]
        # print(password)
        mycursor.execute(
            "SELECT * FROM member WHERE email =%s", (email,))
        myresult = mycursor.fetchone()
        if not myresult:
            return {
                "error": True,
                "message": "登入失敗，email 尚未註冊"
            }, 400
        hashed_password = myresult[3]
        check_password = bcrypt.check_password_hash(hashed_password, password)
        if check_password != True:
            return {
                "error": True,
                "message": "登入失敗，密碼錯誤"
            }, 400

        payload_myresult = {
            "id": myresult[0],
            "username": myresult[1],
            "email": myresult[2],
            "exp": int(time.time()+86400*7)
        }

        token = jwt.encode(
            payload_myresult,
            key,
            "HS256"
            # headers=headers,
            # json_encoder=None
        )
        print(token)
        resp = make_response({"ok": True}, 200)
        resp.set_cookie("token", token)
        return resp

    except Exception as e:
        print(e)
        return {
            "error": True,
            "message": "伺服器內部錯誤"
        }, 500

    finally:
        mycursor.close()
        connection_object.close()


#  ------- 取得當前登入者狀態 -------


@app.route("/api/user/auth",  methods=["GET"])
def userstatus():
    try:
        JWT_cookie = request.cookies.get("token")
        if JWT_cookie:
            token = jwt.decode(JWT_cookie, key, algorithms="HS256")
            return {"data": token}
        else:
            return {"data": None}
    except:
        return {"data": None}

#  ------- 會員登出 -------


@app.route("/api/user/auth",  methods=["DELETE"])
def signout():
    response = make_response({"ok": True}, 200)
    response.set_cookie("token", "", 0)
    return response


app.run(port=3000, host="0.0.0.0", debug=True)
