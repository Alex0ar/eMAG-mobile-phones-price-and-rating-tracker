from flask import Flask, render_template, request, jsonify
import mysql.connector
import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()

app = Flask(__name__)

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_DATABASE"),
    )

@app.route('/')
def index():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("select distinct name from phones order by name asc")
    phones = [row[0] for row in cursor.fetchall()]
    conn.close()
    return render_template("index.html", phones=phones)

@app.route('/data')
def get_data():
    model_name = request.args.get('model')
    conn = get_connection()
    query = """
        select DATE(ph.date_collected) as day, AVG(ph.price) as price
        from phone_history ph
        join phones p on ph.phone_id = p.id
        where p.name = %s
        group by day
        order by day asc
        """
    df = pd.read_sql(query, conn, params=(model_name,))
    conn.close()
    if df.empty:
        return jsonify({})
    return jsonify({
        "dates": df["day"].astype(str).tolist(),
        "prices": df["price"].tolist(),
        "stats":{
            "min": float(df["price"].min()),
            "max": float(df["price"].max()),
            "mean": round(float(df["price"].mean()), 2)
        }
    })

if __name__ == "__main__":
    app.run(debug=True)