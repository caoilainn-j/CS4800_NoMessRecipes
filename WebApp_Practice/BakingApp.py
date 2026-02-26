from flask import Flask, render_template
from pymongo import MongoClient

# remember to put in password before running / connecting to DB
MONGODB_URI = "mongodb+srv://caoilainnjohnsson_db_user:CS380026@bakingapp-db.js1wajy.mongodb.net/?appName=BakingApp-db"
client = MongoClient(MONGODB_URI)

db = client["BakingApp"]
collection = db["item"]

app = Flask(__name__)

@app.route("/")
def start_index():
    return render_template("index.html")

@app.route("/welcome")
def welcome():
    return "<html><body><h1>Welcome to Introduction Baking App!</html></body></h1>"

@app.route("/search/<time>") # mapping
# function to find items with bake time less than input time given
def search_recipes(time):
    time = float(time)
    result = []
    for item in collection.find():
        if item['time'] <= time:
            item["_id"] = str(item["_id"])
            result.append(item)

    if len(result) == 0 :
        result.append("No results found")
    
    return result
    
app.run(host = "0.0.0.0", port = 5005)