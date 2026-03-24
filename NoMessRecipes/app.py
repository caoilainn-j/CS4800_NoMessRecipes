import os
from bson import ObjectId
from flask import Flask, jsonify, render_template, request, session
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev-change-me")

@app.get("/")
def index():
    return render_template("index.html")

MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://caoilainnjohnsson_db_user:CS_3800Baking@bakingapp-db.js1wajy.mongodb.net/?appName=BakingApp-db",
)

client = MongoClient(MONGODB_URI)
db = client["BakingApp"]
collection = db["item"]
users = db["users"]
users.create_index("email", unique=True)


def recipe_from_mongo(doc):
    return {
        "id": str(doc["_id"]),
        "title": doc.get("title") or doc.get("item", ""),
        "author": doc.get("author", "RecipeShare"),
        "minutes": int(doc.get("minutes", doc.get("time", 0)) or 0),
        "image": doc.get("image") or doc.get("image_url", ""),
        "tags": doc.get("tags", []),
        "ingredients": doc.get("ingredients", []),
        "steps": doc.get("steps", []),
        "user_id": doc.get("user_id", ""),
    }


def public_user(doc):
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "email": doc.get("email", ""),
        "saved_recipe_ids": doc.get("saved_recipe_ids", []),
    }


def current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None

    try:
        user = users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = None

    if not user:
        session.pop("user_id", None)
        return None

    if "saved_recipe_ids" not in user:
        users.update_one({"_id": user["_id"]}, {"$set": {"saved_recipe_ids": []}})
        user["saved_recipe_ids"] = []

    return user


@app.post("/api/register")
def register():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    doc = {
        "name": name,
        "email": email,
        "password_hash": generate_password_hash(password),
        "saved_recipe_ids": [],
    }

    try:
        result = users.insert_one(doc)
    except DuplicateKeyError:
        return jsonify({"error": "An account with that email already exists"}), 409

    user = users.find_one({"_id": result.inserted_id})
    session["user_id"] = str(user["_id"])
    return jsonify(public_user(user)), 201


@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = users.find_one({"email": email})
    if not user or not check_password_hash(user.get("password_hash", ""), password):
        return jsonify({"error": "Invalid email or password"}), 401

    if "saved_recipe_ids" not in user:
        users.update_one({"_id": user["_id"]}, {"$set": {"saved_recipe_ids": []}})
        user["saved_recipe_ids"] = []

    session["user_id"] = str(user["_id"])
    return jsonify(public_user(user))


@app.post("/api/logout")
def logout():
    session.pop("user_id", None)
    return jsonify({"ok": True})


@app.get("/api/me")
def me():
    user = current_user()
    return jsonify({"user": public_user(user) if user else None})


@app.get("/api/recipes")
def get_recipes():
    query = request.args.get("query", "").strip()

    mongo_filter = {}
    if query:
        mongo_filter = {
            "$or": [
                {"title": {"$regex": query, "$options": "i"}},
                {"item": {"$regex": query, "$options": "i"}},
                {"author": {"$regex": query, "$options": "i"}},
                {"tags": {"$regex": query, "$options": "i"}},
            ]
        }

    docs = collection.find(mongo_filter).sort("_id", -1)
    recipes = [recipe_from_mongo(doc) for doc in docs]
    return jsonify(recipes)


@app.get("/api/recipes/<recipe_id>")
def get_recipe(recipe_id):
    try:
        doc = collection.find_one({"_id": ObjectId(recipe_id)})
    except Exception:
        return jsonify({"error": "Invalid recipe id"}), 400

    if not doc:
        return jsonify({"error": "Recipe not found"}), 404

    return jsonify(recipe_from_mongo(doc))


@app.post("/api/recipes")
def create_recipe():
    user = current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    data = request.get_json(silent=True) or {}

    title = (data.get("title") or "").strip()
    image = (data.get("image") or "").strip()

    try:
        minutes = int(data.get("minutes", 0) or 0)
    except (TypeError, ValueError):
        minutes = 0

    tags = data.get("tags", [])
    ingredients = data.get("ingredients", [])
    steps = data.get("steps", [])

    if not title:
        return jsonify({"error": "Title is required"}), 400

    doc = {
        "title": title,
        "item": title,
        "author": user["name"],
        "user_id": str(user["_id"]),
        "minutes": minutes,
        "time": minutes,
        "image": image,
        "image_url": image,
        "tags": tags if isinstance(tags, list) else [],
        "ingredients": ingredients if isinstance(ingredients, list) else [],
        "steps": steps if isinstance(steps, list) else [],
    }

    result = collection.insert_one(doc)
    created = collection.find_one({"_id": result.inserted_id})
    return jsonify(recipe_from_mongo(created)), 201


@app.get("/api/saved")
def get_saved_recipes():
    user = current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    saved_ids = []
    for raw_id in user.get("saved_recipe_ids", []):
        try:
            saved_ids.append(ObjectId(raw_id))
        except Exception:
            continue

    if not saved_ids:
        return jsonify([])

    docs = collection.find({"_id": {"$in": saved_ids}})
    by_id = {str(doc["_id"]): recipe_from_mongo(doc) for doc in docs}
    ordered = [by_id[rid] for rid in user.get("saved_recipe_ids", []) if rid in by_id]
    return jsonify(ordered)


@app.post("/api/saved/<recipe_id>")
def save_recipe(recipe_id):
    user = current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    try:
        recipe_obj_id = ObjectId(recipe_id)
    except Exception:
        return jsonify({"error": "Invalid recipe id"}), 400

    recipe = collection.find_one({"_id": recipe_obj_id})
    if not recipe:
        return jsonify({"error": "Recipe not found"}), 404

    users.update_one(
        {"_id": user["_id"]},
        {"$addToSet": {"saved_recipe_ids": recipe_id}}
    )

    refreshed = users.find_one({"_id": user["_id"]})
    return jsonify(public_user(refreshed))


@app.delete("/api/saved/<recipe_id>")
def unsave_recipe(recipe_id):
    user = current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    users.update_one(
        {"_id": user["_id"]},
        {"$pull": {"saved_recipe_ids": recipe_id}}
    )

    refreshed = users.find_one({"_id": user["_id"]})
    return jsonify(public_user(refreshed))


@app.get("/create")
@app.get("/profile")
@app.get("/saved")
@app.get("/recipe/<recipe_id>")
def spa_fallback(recipe_id=None):
    return render_template("index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)