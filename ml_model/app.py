
from flask import Flask, jsonify, request
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv
from pathlib import Path



app = Flask(__name__)
CORS(app)

# ── Load model files ─────────────────────────────────────────────
with open('jewelry_sales_model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('label_encoder.pkl', 'rb') as f:
    le = pickle.load(f)

with open('features.pkl', 'rb') as f:
    features = pickle.load(f)

# ── MongoDB connection ────────────────────────────────────────────


dotenv_path = Path(__file__).resolve().parent.parent / 'backend' / '.env'
load_dotenv(dotenv_path)

print("MONGO_URI:", os.getenv("MONGO_URI"));



MONGO_URI = os.getenv("MONGO_URI")
DB_NAME   = "test"

client = MongoClient(MONGO_URI)
db     = client[DB_NAME]

# ── Category mapping ──────────────────────────────────────────────
category_map = {
    "Rings"    : "jewelry.ring",
    "Necklace" : "jewelry.necklace",
    "Earring"  : "jewelry.earring",
    "Bracelet" : "jewelry.bracelet",
    "Brooch"   : "jewelry.brooch",
    "Pendant"  : "jewelry.pendant"
}

# ── Sri Lankan seasonal multipliers per month ─────────────────────
# Based on Sri Lankan jewelry buying patterns
sri_lankan_seasonal = {
    1 : 0.85,   # January   - Normal, post New Year dip
    2 : 1.10,   # February  - Valentine's Day boost
    3 : 0.90,   # March     - Normal
    4 : 1.35,   # April     - Avurudu season (biggest local event)
    5 : 1.20,   # May       - Mother's Day + Wedding season starts
    6 : 1.15,   # June      - Wedding season peak
    7 : 0.90,   # July      - Normal
    8 : 0.90,   # August    - Normal
    9 : 0.85,   # September - Normal, slight dip
    10: 0.95,   # October   - Normal, slight pickup
    11: 1.25,   # November  - Black Friday + Christmas buildup
    12: 1.40,   # December  - Christmas (highest)
}

# ── Category seasonal preferences per month (Sri Lankan context) ──
# Which categories sell more in which months
category_seasonal_boost = {
    "jewelry.ring": {
        1: 1.3,   # Post New Year engagements
        2: 1.1,   # Valentine's
        4: 1.4,   # Avurudu gold rings
        6: 1.3,   # Wedding season
        12: 1.2   # Christmas gifts
    },
    "jewelry.earring": {
        2: 1.4,   # Valentine's Day gift
        4: 1.2,   # Avurudu
        5: 1.1,   # Mother's Day
        11: 1.3,  # Black Friday
        12: 1.3   # Christmas
    },
    "jewelry.necklace": {
        2: 1.2,   # Valentine's
        5: 1.4,   # Mother's Day (necklaces most gifted)
        6: 1.2,   # Wedding season
        12: 1.2   # Christmas
    },
    "jewelry.pendant": {
        2: 1.5,   # Valentine's Day (pendants very popular)
        5: 1.3,   # Mother's Day
        12: 1.1   # Christmas
    },
    "jewelry.bracelet": {
        4: 1.2,   # Avurudu
        5: 1.1,   # Mother's Day
        6: 1.3,   # Wedding season
        11: 1.1   # Black Friday
    },
    "jewelry.brooch": {
        4: 1.1,   # Avurudu traditional wear
        12: 1.1   # Christmas
    }
}

# ── Fallback lag values from dataset ─────────────────────────────
fallback_lag = {
    "jewelry.earring"  : {"lag_1": 956, "lag_2": 878, "lag_3": 673, "avg_price": 500.06},
    "jewelry.ring"     : {"lag_1": 812, "lag_2": 700, "lag_3": 565, "avg_price": 432.16},
    "jewelry.pendant"  : {"lag_1": 380, "lag_2": 360, "lag_3": 283, "avg_price": 221.27},
    "jewelry.bracelet" : {"lag_1": 121, "lag_2": 130, "lag_3": 112, "avg_price": 546.92},
    "jewelry.necklace" : {"lag_1": 95,  "lag_2": 110, "lag_3": 82,  "avg_price": 300.32},
    "jewelry.brooch"   : {"lag_1": 29,  "lag_2": 31,  "lag_3": 26,  "avg_price": 474.99}
}

# ── Sri Lankan seasonal insight generator ─────────────────────────
def generate_sri_lankan_insight(predictions, target_month, target_year, month_name):
    top        = predictions[0]["category"]
    top_sales  = predictions[0]["predicted_sales"]
    total      = sum(p["predicted_sales"] for p in predictions)

    # Month specific context
    month_context = {
        1 : "January is typically a quieter month post-New Year. Focus on engagement rings as couples plan proposals for the new year.",
        2 : "February brings Valentine's Day — pendants, earrings and necklaces are top gifts. Stock up on romantic styles and gift packaging.",
        3 : "March is a normal trading month. Good time to refresh inventory before the busy Avurudu season in April.",
        4 : "April is the Sinhala & Tamil New Year (Avurudu) season — the biggest jewelry buying period in Sri Lanka. Gold rings and traditional jewelry see massive demand. Ensure maximum stock levels.",
        5 : "May brings Mother's Day and the start of wedding season. Necklaces and pendants are most gifted for mothers. Bridal jewelry demand begins.",
        6 : "June is peak wedding season in Sri Lanka. Rings, bracelets and earrings for bridal parties see high demand. Focus on bridal collections.",
        7 : "July is a normal trading month. Wedding season slows slightly. Good time to plan for the upcoming holiday season inventory.",
        8 : "August is a normal trading month with steady sales. Consider promotions to maintain momentum before the year-end rush.",
        9 : "September sees a slight dip. Good opportunity to run promotions and clear slow-moving inventory before the holiday season buildup.",
        10: "October marks the beginning of holiday season buildup. Start stocking up for November and December peak demand.",
        11: "November is Black Friday and Christmas buildup month. All categories see increased demand. Offer promotions and ensure gift packaging is ready.",
        12: "December is the highest sales month — Christmas gifting drives demand across all categories. Maximize stock levels and offer gift wrapping services."
    }

    # Stock urgency
    high_demand = [p["category"] for p in predictions if p["predicted_sales"] >= 400]
    medium_demand = [p["category"] for p in predictions if 150 <= p["predicted_sales"] < 400]
    low_demand = [p["category"] for p in predictions if p["predicted_sales"] < 150]

    insight = f"{top} is predicted to be the top selling category in {month_name} {target_year} "
    insight += f"with {top_sales:,} units — {((top_sales/total)*100):.1f}% of total predicted sales. "
    insight += f"{month_context[target_month]}"

    return insight

# ── Generate admin recommendations ────────────────────────────────
def generate_recommendations(predictions, target_month):
    recommendations = []

    for item in predictions:
        sales    = item["predicted_sales"]
        category = item["category"]

        if sales >= 10:
            action   = "Increase stock immediately"
            priority = "high"
            detail   = f"Expected high demand of {sales:,} units. Check reorder levels and place orders with suppliers."
        elif sales >= 7:
            action   = "Monitor stock levels"
            priority = "medium"
            detail   = f"Moderate demand of {sales:,} units expected. Review current stock and reorder if below safety level."
        else:
            action   = "Normal stock levels"
            priority = "low"
            detail   = f"Low demand of {sales:,} units expected. Maintain current inventory levels."

        recommendations.append({
            "category"  : category,
            "action"    : action,
            "priority"  : priority,
            "detail"    : detail,
            "predicted" : sales
        })

    return recommendations

# ── Helper: get recent sales from MongoDB ─────────────────────────
def get_recent_sales(model_category, months=6):
    try:
        pipeline = [
            {"$match": {"orderStatus": "Delivered"}},
            {"$unwind": "$items"},
            {"$lookup": {
                "from"        : "products",
                "localField"  : "items.product",
                "foreignField": "_id",
                "as"          : "productInfo"
            }},
            {"$unwind": "$productInfo"},
            {"$addFields": {
                "modelCategory": {
                    "$switch": {
                        "branches": [
                            {"case": {"$eq": ["$productInfo.productCategory", "Rings"]},    "then": "jewelry.ring"},
                            {"case": {"$eq": ["$productInfo.productCategory", "Necklace"]}, "then": "jewelry.necklace"},
                            {"case": {"$eq": ["$productInfo.productCategory", "Earring"]},  "then": "jewelry.earring"},
                            {"case": {"$eq": ["$productInfo.productCategory", "Bracelet"]}, "then": "jewelry.bracelet"},
                            {"case": {"$eq": ["$productInfo.productCategory", "Brooch"]},   "then": "jewelry.brooch"},
                            {"case": {"$eq": ["$productInfo.productCategory", "Pendant"]},  "then": "jewelry.pendant"}
                        ],
                        "default": "unknown"
                    }
                }
            }},
            {"$match": {"modelCategory": model_category}},
            {"$group": {
                "_id"        : {"year": {"$year": "$createdAt"}, "month": {"$month": "$createdAt"}},
                "sales_count": {"$sum": "$items.quantity"},
                "avg_price"  : {"$avg": "$items.price"}
            }},
            {"$sort": {"_id.year": 1, "_id.month": 1}},
            {"$limit": months}
        ]
        return list(db.orders.aggregate(pipeline))
    except Exception as e:
        print(f"MongoDB error: {e}")
        return []

# ── Helper: build features ────────────────────────────────────────
def build_features(model_category, target_year, target_month):
    recent_sales = get_recent_sales(model_category)
    fallback     = fallback_lag[model_category]

    # Get category specific seasonal boost
    cat_boost = category_seasonal_boost.get(model_category, {})
    boost     = cat_boost.get(target_month, 1.0)

    # Overall Sri Lankan seasonal multiplier
    seasonal_mult = sri_lankan_seasonal[target_month]

    if len(recent_sales) >= 3:
        sales_list    = [r["sales_count"] for r in recent_sales]
        price_list    = [r["avg_price"]   for r in recent_sales]
        lag_1         = sales_list[-1]
        lag_2         = sales_list[-2]
        lag_3         = sales_list[-3]
        avg_price     = np.mean(price_list[-3:])
        rolling_avg_3 = np.mean(sales_list[-3:])
        rolling_avg_6 = np.mean(sales_list[-6:]) if len(sales_list) >= 6 else np.mean(sales_list)
        mom_growth    = (lag_1 - lag_2) / lag_2 if lag_2 != 0 else 0
        print(f"Using MongoDB data for {model_category}")
    else:
        prev_month  = target_month - 1 if target_month > 1 else 12
        prev2_month = target_month - 2 if target_month > 2 else target_month + 10
        prev3_month = target_month - 3 if target_month > 3 else target_month + 9
        base        = fallback["lag_1"]
        lag_1       = int(base * sri_lankan_seasonal[prev_month])
        lag_2       = int(base * sri_lankan_seasonal[prev2_month])
        lag_3       = int(base * sri_lankan_seasonal[prev3_month])
        avg_price   = fallback["avg_price"]
        rolling_avg_3 = np.mean([lag_1, lag_2, lag_3])
        rolling_avg_6 = np.mean([lag_1, lag_2, lag_3])
        mom_growth    = (lag_1 - lag_2) / lag_2 if lag_2 != 0 else 0
        print(f"Using fallback data for {model_category}")

    # Apply Sri Lankan seasonal boost to lag features
    lag_1         = int(lag_1 * seasonal_mult * boost)
    lag_2         = int(lag_2 * seasonal_mult)
    rolling_avg_3 = rolling_avg_3 * seasonal_mult * boost
    rolling_avg_6 = rolling_avg_6 * seasonal_mult

    category_encoded = int(le.transform([model_category])[0])

    feature_dict = {
        "category_encoded": category_encoded,
        "month"           : target_month,
        "year"            : target_year,
        "avg_price"       : avg_price,
        "lag_1"           : lag_1,
        "lag_2"           : lag_2,
        "lag_3"           : lag_3,
        "rolling_avg_3"   : rolling_avg_3,
        "rolling_avg_6"   : rolling_avg_6,
        "is_holiday_month": 1 if target_month in [11, 12] else 0,
        "time_index"      : 83 + (target_year - 2025) * 12 + target_month,
        "quarter"         : (target_month - 1) // 3 + 1,
        "mom_growth"      : mom_growth
    }

    return pd.DataFrame([feature_dict])[features]

# ── Route 1: Predict all categories ──────────────────────────────
@app.route('/predict-all', methods=['GET'])
def predict_all():
    try:
        now          = datetime.now()
        target_month = request.args.get('month', None)
        target_year  = request.args.get('year',  None)

        if target_month and target_year:
            target_month = int(target_month)
            target_year  = int(target_year)
        else:
            target_month = now.month + 1
            target_year  = now.year
            if target_month > 12:
                target_month = 1
                target_year += 1

        predictions = []

        for db_category, model_category in category_map.items():
            X          = build_features(model_category, target_year, target_month)
            prediction = int(model.predict(X)[0])
            prediction = max(1, prediction)
            predictions.append({
                "category"       : db_category,
                "model_category" : model_category,
                "predicted_sales": prediction
            })

        # Sort by predicted sales
        predictions.sort(key=lambda x: x["predicted_sales"], reverse=True)

        month_name      = datetime(target_year, target_month, 1).strftime("%B")
        top_category    = predictions[0]["category"]
        total_predicted = sum(p["predicted_sales"] for p in predictions)

        # Generate Sri Lankan insight
        insight = generate_sri_lankan_insight(
            predictions, target_month, target_year, month_name
        )

        # Generate recommendations
        recommendations = generate_recommendations(predictions, target_month)

        # Season label
        season_labels = {
            1 : "Post New Year",
            2 : "Valentine's Season",
            3 : "Normal Season",
            4 : "Avurudu Season",
            5 : "Mother's Day & Wedding Season",
            6 : "Wedding Season",
            7 : "Normal Season",
            8 : "Normal Season",
            9 : "Off Season",
            10: "Pre-Holiday Season",
            11: "Black Friday & Christmas Buildup",
            12: "Christmas Season"
        }

        return jsonify({
            "month"           : target_month,
            "year"            : target_year,
            "month_name"      : month_name,
            "season"          : season_labels[target_month],
            "predictions"     : predictions,
            "top_category"    : top_category,
            "total_predicted" : total_predicted,
            "insight"         : insight,
            "recommendations" : recommendations,
            "status"          : "success"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── Route 2: Predict single category ─────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data         = request.json
        db_category  = data.get('category')
        target_month = int(data.get('month', datetime.now().month + 1))
        target_year  = int(data.get('year',  datetime.now().year))

        if target_month > 12:
            target_month = 1
            target_year += 1

        model_category = category_map.get(db_category)
        if not model_category:
            return jsonify({"error": f"Unknown category: {db_category}"}), 400

        X          = build_features(model_category, target_year, target_month)
        prediction = int(model.predict(X)[0])
        prediction = max(1, prediction)

        return jsonify({
            "category"       : db_category,
            "month"          : target_month,
            "year"           : target_year,
            "predicted_sales": prediction,
            "status"         : "success"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── Route 3: Health check ─────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "Flask API is running"})

# ── Route 4: Debug sales data ─────────────────────────────────────
@app.route('/debug-sales', methods=['GET'])
def debug_sales():
    try:
        results = {}
        for db_category, model_category in category_map.items():
            recent = get_recent_sales(model_category)
            results[db_category] = [
                {"year": r["_id"]["year"], "month": r["_id"]["month"], "sales": r["sales_count"]}
                for r in recent
            ]
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5002)