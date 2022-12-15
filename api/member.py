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

member = Blueprint("member", __name__)

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
connection_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool",
                                                              pool_size=10,
                                                              pool_reset_session=True,
                                                              **dbconfig)


#  ------- 註冊新會員 -------


@member.route("/api/user",  methods=["POST"])
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
            "SELECT * FROM member WHERE email =%s", (email,))
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


@member.route("/api/user",  methods=["PUT"])
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
        # print(myresult)
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


@member.route("/api/user/auth",  methods=["GET"])
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


@member.route("/api/user/auth",  methods=["DELETE"])
def signout():
    response = make_response({"ok": True}, 200)
    response.set_cookie("token", "", 0)  # expires 日期 (第三個參數) 設定為 0，就會刪除cookie
    return response
