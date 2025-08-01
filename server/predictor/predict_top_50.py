import os
import time
import logging
from datetime import datetime
from supabase import create_client, Client
from prophet import Prophet
import pandas as pd
import requests
from urllib.parse import quote

# Setup logging
logging.basicConfig(level=logging.INFO)

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

HEADERS = {'accept': 'application/json'}

def fetch_top_50_coins():
    url = 'https://api.coingecko.com/api/v3/coins/markets'
    params = {
        'vs_currency': 'usd',
        'order': 'market_cap_desc',
        'per_page': '50',
        'page': '1',
        'sparkline': 'false'
    }
    res = requests.get(url, headers=HEADERS, params=params)
    res.raise_for_status()
    return res.json()

def fetch_coin_history(coin_id):
    safe_id = quote(coin_id)
    url = f'https://api.coingecko.com/api/v3/coins/{safe_id}/market_chart'
    params = {'vs_currency': 'usd', 'days': '30', 'interval': 'daily'}
    res = requests.get(url, headers=HEADERS, params=params)
    res.raise_for_status()
    prices = res.json().get('prices', [])
    df = pd.DataFrame(prices, columns=['ds', 'y'])
    df['ds'] = pd.to_datetime(df['ds'], unit='ms')
    return df

def predict_with_prophet(df):
    model = Prophet(daily_seasonality=True)
    model.fit(df)
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)
    return forecast

def extract_predictions(forecast):
    return {
        'next_day': round(float(forecast.iloc[-30]['yhat']), 2),
        'next_week': round(float(forecast.iloc[-23]['yhat']), 2),
        'next_month': round(float(forecast.iloc[-1]['yhat']), 2)
    }

def get_current_batch_index():
    now = datetime.utcnow()
    return (now.minute // 5) % 5  # Run 10 coins per 5-min batch

def main():
    timestamp = datetime.utcnow().isoformat()
    coins = fetch_top_50_coins()
    batch_index = get_current_batch_index()
    start = batch_index * 10
    end = start + 10
    selected = coins[start:end]

    logging.info(f"🔁 Running batch {batch_index + 1}/5 — coins {start + 1} to {end}")

    # Cache all 50 in Supabase
    for coin in coins:
        supabase.table("coins").upsert({
            'id': coin['id'],
            'name': coin['name'],
            'symbol': coin['symbol'],
            'image': coin['image'],
            'market_cap': coin['market_cap'],
            'current_price': coin['current_price'],
            'last_fetched': timestamp
        }).execute()

    for coin in selected:
        try:
            logging.info(f"⏳ Predicting {coin['name']}...")
            df = fetch_coin_history(coin['id'])
            forecast = predict_with_prophet(df)
            prediction = extract_predictions(forecast)

            payload = {
                'timestamp': timestamp,
                'coin_id': coin['id'],
                'name': coin['name'],
                'symbol': coin['symbol'],
                'image': coin['image'],
                'market_cap': coin['market_cap'],
                'current_price': coin['current_price'],
                'next_day': prediction['next_day'],
                'next_week': prediction['next_week'],
                'next_month': prediction['next_month']
            }

            supabase.table("predictions").insert(payload).execute()
            logging.info(f"✅ Saved prediction for {coin['name']}")
        except Exception as e:
            logging.warning(f"⚠️ Skipped {coin['id']}: {e}")
        logging.info("😴 Sleeping for 10 seconds...")
        time.sleep(10)

if __name__ == "__main__":
    main()
