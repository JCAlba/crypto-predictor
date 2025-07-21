import os
import time
import json
import requests
import pandas as pd
from datetime import datetime
from prophet import Prophet
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Logging setup
logging.basicConfig(level=logging.INFO)

HEADERS = {'accept': 'application/json'}

def fetch_top_50_coins():
    url = 'https://api.coingecko.com/api/v3/coins/markets'
    params = {
        'vs_currency': 'usd',
        'order': 'market_cap_desc',
        'per_page': 50,
        'page': 1,
        'sparkline': False
    }
    res = requests.get(url, headers=HEADERS, params=params)
    res.raise_for_status()
    return res.json()

def fetch_coin_history(coin_id):
    url = f'https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart'
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
    next_day = forecast.iloc[-30]['yhat']
    next_week = forecast.iloc[-23]['yhat']
    next_month = forecast.iloc[-1]['yhat']
    return {
        'next_day': round(float(next_day), 2),
        'next_week': round(float(next_week), 2),
        'next_month': round(float(next_month), 2)
    }

def save_to_supabase(record):
    try:
        response = supabase.table("predictions").insert(record).execute()
        logging.info(f"✅ Saved to Supabase: {record['name']}")
    except Exception as e:
        logging.error(f"❌ Failed to save {record['name']} to Supabase: {e}")

def main():
    timestamp = datetime.utcnow().isoformat()
    coins = fetch_top_50_coins()
    logging.info(f"🔍 Fetched {len(coins)} coins")

    for coin in coins:
        logging.info(f"⏳ Processing {coin['name']}...")
        try:
            df = fetch_coin_history(coin['id'])
            forecast = predict_with_prophet(df)
            prediction = extract_predictions(forecast)

            record = {
                'timestamp': timestamp,
                'id': coin['id'],
                'name': coin['name'],
                'symbol': coin['symbol'],
                'image': coin['image'],
                'market_cap': coin['market_cap'],
                'current_price': coin['current_price'],
                'prediction': prediction
            }

            save_to_supabase(record)
            time.sleep(1.2)  # Respect CoinGecko rate limits
        except Exception as e:
            logging.warning(f"⚠️ Skipped {coin['id']}: {e}")

if __name__ == '__main__':
    main()
