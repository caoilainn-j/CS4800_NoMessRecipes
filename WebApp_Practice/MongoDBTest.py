from pymongo import MongoClient

# remember to put in password before running / connecting to DB
MONGODB_URI = "mongodb+srv://caoilainnjohnsson_db_user:<password>@bakingapp-db.js1wajy.mongodb.net/?appName=BakingApp-db"
client = MongoClient(MONGODB_URI)

db = client["BakingApp"]
collection = db["item"]

# these three are already added to DB, change if wanting to add more
collection.insert_one({
        "item": "Chocolate Chip Cookies", 
        "time": 40, 
        "image_url": "https://sallysbakingaddiction.com/wp-content/uploads/2013/05/classic-chocolate-chip-cookies.jpg"})
collection.insert_one({
        "item" : "Strawberry Cheesecake Cookies",
        "time" : 140,
        "image_url" : "https://www.simplyrecipes.com/thmb/OmUqKbb6-iCCQTB4wb1ZgO1tZIo=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Strawberry-Cheesecake-Cookies-LEAD-62b7338475d64e91ae3d8ad044eaf4ba.jpg"})
collection.insert_one({
        "item" : "Peanut Butter Brownies",
        "time" : 70,
        "image_url" : "https://brokenovenbaking.com/wp-content/uploads/2023/02/chocolate-peanut-butter-brownies-9-1.jpg"})
