from mysql.connector import errors
from mysql.connector import pooling
from flask import *
import mysql.connector
import jwt
import time
import requests
from datetime import datetime, timedelta
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import os
import base64
from dotenv import load_dotenv
load_dotenv()

order = Blueprint("order", __name__)

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

#  ------- 建立新的訂單，完成付款程序 -------


@order.route("/api/orders", methods=["POST"])
def make_payment():
    try:
        JWT_cookie = request.cookies.get("token")
        if JWT_cookie:
            token = jwt.decode(JWT_cookie, key, algorithms="HS256")
            data = request.get_json()
            # print(data)
            phone = data["order"]["contact"]["phone"]

            if not phone:  # phone未填寫
                return {"error": True, "message": "電話號碼未填寫"}, 400

            member_id = token["id"]
            username = data["order"]["contact"]["name"]
            email = data["order"]["contact"]["email"]

            price = int(data["order"]["price"])
            date = data["order"]["trip"]["date"]
            time = data["order"]["trip"]["time"]
            attraction_name = data["order"]["trip"]["attraction"]["name"]
            attraction_id = data["order"]["trip"]["attraction"]["id"]

            # create order number
            current_time = datetime.now().strftime("%Y%m%d%H%M")
            order_number = current_time+str(member_id)
            # print(order_number)

            # TapPay request
            url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
            headers = {"content-type": "application/json",
                       "x-api-key": os.getenv("partner_key"),
                       }
            body = {
                "prime": data["prime"],
                "partner_key": os.getenv("partner_key"),
                "merchant_id": os.getenv("merchant_id"),
                "details":  "TapPay Test",
                "amount": price,
                "currency": "TWD",
                "cardholder": {
                    "phone_number": phone,
                    "name": base64.b64encode(username.encode("utf-8")).decode("ascii"),
                    "email": email,
                },
                "remember": True
            }

            # 後端呼叫 TapPay 提供的付款 API
            tappay_result = requests.post(
                url, headers=headers, data=json.dumps(body)).json()
            # print(tappay_result)
            status = tappay_result["status"]
            msg = tappay_result["msg"]

            try:
                connection_object = connection_pool.get_connection()
                mycursor = connection_object.cursor(buffered=True)

                if tappay_result["status"] == 0:  # 付款成功
                    mycursor.execute(
                        "INSERT INTO orders (order_number, price, status, attraction_id, attraction_name, date, time, contact_name,  contact_email, contact_phone) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                        (order_number, price, status, attraction_id,
                         attraction_name,  date, time, username, email, phone)
                    )
                    connection_object.commit()

                    mycursor.execute(
                        "DELETE FROM booking WHERE email=%s", (email,))  # 付款成功後，把資料從 booking 資料表中刪除
                    connection_object.commit()
                    return {
                        "data": {
                            "number": order_number,
                            "payment": {
                                "status": tappay_result["status"],
                                "message": msg
                            }
                        }
                    }, 200
                else:
                    mycursor.execute(
                        "INSERT INTO orders (order_number, price, status, attraction_id, attraction_name, date, time, contact_name,  contact_email, contact_phone) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                        (order_number, price, status, attraction_id,
                         attraction_name,  date, time, username, email, phone)
                    )
                    connection_object.commit()
                    return {
                        "data": {
                            "number": order_number,
                            "payment": {
                                "status": tappay_result["status"],
                                "message": msg
                            }
                        }
                    }, 200
            except Exception as e:
                print(e)
                return {
                    "error": True,
                    "message": "伺服器內部錯誤"
                }, 500

            finally:
                mycursor.close()
                connection_object.close()

        else:
            return {"error": True, "message": "未登入系統，拒絕存取"}, 403

    except Exception as e:
        print(e)
        return {
            "error": True,
            "message": "伺服器內部錯誤"
        }, 500


#  ------- 根據訂單編號取得訂單資訊 -------

@order.route("/api/order/<orderNumber>", methods=["GET"])
def get_order(orderNumber):
    JWT_cookie = request.cookies.get("token")
    try:
        if JWT_cookie:
            token = jwt.decode(JWT_cookie, key, algorithms="HS256")
            connection_object = connection_pool.get_connection()
            mycursor = connection_object.cursor(buffered=True, dictionary=True)
            mycursor.execute(
                "SELECT * FROM orders INNER JOIN spots ON attraction_name = name where order_number=%s", (orderNumber,))
            order_result = mycursor.fetchone()
            # print(order_result)

            return {
                "data": {
                    "number": order_result["order_number"],
                    "price": order_result["price"],
                    "trip": {
                        "attraction": {
                            "id": order_result["attraction_id"],
                            "name": order_result["attraction_name"],
                            "address": order_result["address"],
                            "image": order_result["images"].split(',')[0].replace("[", "").replace("'", "", 2)
                        },
                        "date": order_result["date"],
                        "time": order_result["time"]
                    },
                    "contact": {
                        "name": order_result["contact_name"],
                        "email": order_result["contact_email"],
                        "phone": order_result["contact_phone"]
                    },
                    "status": order_result["status"]

                }
            }, 200
        else:
            return {
                "error": True,
                "messgae": "未登入系統，拒絕存取"
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
