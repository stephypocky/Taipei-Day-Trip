from mysql.connector import errors
from mysql.connector import pooling
from flask import *
import mysql.connector
import jwt
import requests
import time
from datetime import datetime, timedelta
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv
load_dotenv()

booking = Blueprint("booking", __name__)

bcrypt = Bcrypt()

# JWT header
headers = {
    "typ": "JWT",
    "alg": "HS256"
}

# JWT key
key = os.getenv("jwt_key")

app = Flask(__name__)
app.secret_key = os.getenv("app.secret_key")
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["JSON_SORT_KEYS"] = False

dbconfig = {
    "user":  os.getenv("user"),
    "password": os.getenv("password"),
    "host": os.getenv("host"),
    "database": os.getenv("database")
}
connection_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool",
                                                              pool_size=10,
                                                              pool_reset_session=True,
                                                              **dbconfig)

#  ------- 取得尚未下單的預訂行程 -------


@booking.route("/api/booking", methods=["GET"])
def get_booking():
    try:
        JWT_cookie = request.cookies.get("token")
        if JWT_cookie:
            token = jwt.decode(JWT_cookie, key, algorithms="HS256")
            email = token["email"]
            username = token["username"]
            connection_object = connection_pool.get_connection()
            mycursor = connection_object.cursor(dictionary=True)
            mycursor.execute(
                "SELECT * FROM booking WHERE email = %s", (email,))
            booking_result = mycursor.fetchone()
            # print(booking_result)
            if booking_result is None:
                return {"data": None,
                        "username": username,
                        "email": email
                        }, 200
            # print(booking_result)
            if booking_result:
                attraction_id = booking_result["attraction_id"]
                date = booking_result["date"]
                time = booking_result["time"]
                price = booking_result["price"]

                mycursor.execute(
                    "SELECT * FROM spots WHERE id = %s", (attraction_id,))
                attraction_result = mycursor.fetchone()

                # image = attraction_result["images"].split(
                #     ',')[0].replace("[", "").replace("'", "", 2)
                # print(image)
                final_result = {
                    "attraction": {
                        "id": attraction_id,
                        "name": attraction_result["name"],
                        "address": attraction_result["address"],
                        "image": attraction_result["images"].split(
                            ',')[0].replace("[", "").replace("'", "", 2)
                    },
                    "date": date,
                    "time": time,
                    "price": price
                }

                # data = {
                #     "data": final_result,
                #     "username": username
                # }
                # return jsonify(data), 200

                return {
                    "data": final_result,
                    "username": username,
                    "email": email
                }, 200

        else:
            return {
                "error": True,
                "message": "使用者未登入"
            }, 403

    except Exception as e:
        print(e)
        return {
            "error": True,
            "message": "伺服器內部錯誤"
        }, 500

    finally:
        mycursor.close()
        connection_object.close()

#  ------- 建立新的預定行程資訊  -------


@booking.route("/api/booking", methods=["POST"])
def make_booking():
    try:
        JWT_cookie = request.cookies.get("token")
        connection_object = connection_pool.get_connection()
        mycursor = connection_object.cursor()
        data = request.get_json()
        attraction_id = data["attraction_id"]
        date = data["date"]
        time = data["time"]
        price = data["price"]
        if JWT_cookie:
            token = jwt.decode(JWT_cookie, key, algorithms="HS256")
            email = token["email"]
            username = token["username"]
            mycursor.execute(
                "SELECT * FROM booking WHERE email = %s", (email,))
            myresult = mycursor.fetchone()
            if myresult is None:
                mycursor.execute(
                    "INSERT INTO booking (attraction_id, email, date, time, price) VALUES (%s, %s, %s, %s, %s)", (attraction_id, email, date, time, price))
                connection_object.commit()
                return {"ok": True}, 200
            if myresult:
                mycursor = connection_object.cursor()
                mycursor.execute(
                    "UPDATE booking SET attraction_id=%s, date=%s, time=%s, price=%s WHERE email= %s", (attraction_id, date, time, price, email))
                connection_object.commit()
                return {"ok": True}, 200

        elif JWT_cookie is None:
            return {
                "error": True,
                "message": "未登入系統，拒絕存取"
            }, 403
        else:
            return {
                "error": True,
                "message": "建立失敗，輸入不正確或其他原因"
            }, 400

    except Exception as e:
        print(e)
        return {
            "error": True,
            "message": "使用者未登入"
        }, 500

    finally:
        mycursor.close()
        connection_object.close()


#  ------- 刪除目前的預定行程  -------


@booking.route("/api/booking", methods=["DELETE"])
def delete_booking():
    try:
        JWT_cookie = request.cookies.get("token")
        connection_object = connection_pool.get_connection()
        mycursor = connection_object.cursor()
        if JWT_cookie:
            token = jwt.decode(JWT_cookie, key, algorithms="HS256")
            email = token["email"]
            mycursor.execute("DELETE FROM booking WHERE email=%s", (email,))
            connection_object.commit()
            return {"ok": True}, 200
        else:
            return {
                "error": True,
                "message": "未登入系統，拒絕存取"
            }, 403
    except Exception as e:
        print(e)
        return {
            "error": True,
            "message": "使用者未登入"
        }, 500

    finally:
        mycursor.close()
        connection_object.close()
