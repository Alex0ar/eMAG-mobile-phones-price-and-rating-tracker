import requests
from bs4 import BeautifulSoup
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

conn = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_DATABASE"),
)
cursor = conn.cursor()

url_template = "https://www.emag.ro/telefoane-mobile/p{page_number}/c"

aws_waf_value = os.getenv("AWS_WAF_VALUE")

s = requests.Session()
s.headers.update({
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/120.0.0.0 Safari/537.36"
})

s.cookies.set("aws-waf-token", aws_waf_value, domain=".emag.ro", path="/")

page_number = 1
while True:
    url = url_template.format(page_number = page_number)
    response = s.get(url, timeout=15)

    soup = BeautifulSoup(response.text, "html.parser")
    products = soup.find_all("div", class_="card-v2-wrapper js-section-wrapper")
    for product in products:
        name = product.find("a", class_="card-v2-title fw-semibold mb-1 js-product-url").text.strip()
        if len(name) > 255:
            continue
        if name.startswith("Telefon mobil "):
            name = name[14:]
        rating_str = product.find("span", class_="average-rating fw-semibold")
        rating = float(rating_str.text) if rating_str else None
        price_tag = product.find("p", class_="product-new-price")
        price_str = price_tag.get_text(strip=True)
        price_str2 = price_str.replace(".", "").replace(",", ".")[0:-3]
        if not price_str2[0].isdigit():
            price_str2 = price_str2[5:]
        price = float(price_str2)
        cursor.execute("""
        insert into phones (name)
        values (%s) 
                       """, (name, ))
        phone_id = cursor.lastrowid

        cursor.execute("""
        insert into phone_history (price, rating, date_collected, phone_id)
        values (%s, %s, CURDATE(), %s)
                       """, (price, rating, phone_id))

    next_button = soup.find("a", string="Pagina urmatoare")
    if next_button and next_button.get("href") and "javascript:void(0)" not in next_button["href"]:
        page_number += 1
    else:
        break

conn.commit()
cursor.close()
conn.cursor()