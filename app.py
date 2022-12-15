from mysql.connector import errors
from mysql.connector import pooling
from flask import *
from api.attraction import attraction
from api.booking import booking
from api.member import member
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
app.register_blueprint(booking)
app.register_blueprint(attraction)
app.register_blueprint(member)
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


app.run(port=3000, host="0.0.0.0", debug=True)
