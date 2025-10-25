import pandas as pd
import plotly.express as px
import mysql.connector
import os
from dotenv import load_dotenv
from pandas.core.arrays import period_array

load_dotenv()
conn = mysql.connector.connect(
    host = os.getenv("DB_HOST"),
    user = os.getenv("DB_USER"),
    password = os.getenv("DB_PASSWORD"),
    database = os.getenv("DB_DATABASE")
)

model_name = "Apple iPhone 17 Pro Max, 256GB, 5G, Cosmic Orange"

query = """
select ph.date_collected, ph.price
from phone_history ph
join phones p on ph.phone_id = p.id
where p.name = %s
"""

df = pd.read_sql(query, conn, params=(model_name, ))
conn.close()

fig = px.line(
    df,
    x="date_collected",
    y="price",
    title=f"price evolution over time for {model_name}",
    markers=True,
    labels={"date_collected": "Date", "price": "Price (RON)"}
)

fig.show()
#fig.write_html("iPhone17ProMax.html", auto_open=True)