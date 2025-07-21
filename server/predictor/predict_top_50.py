import requests
import pandas as pd
import os
from prophet import Prophet
from datetime import datetime, timedelta
import time
import logging
from supabase import create_client, Client

logging.basicConfig(level=logging.INFO)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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

def fetch_from_cache(coin_id):
    response = supabase.table("history_cache").select("*").eq("coin_id", coin_id).execute()
    if not response.data:
        return None
    row = response.data[0]
    updated_at = datetime.fromisoformat(row['updated_at'].replace("Z", "+00:00"))
    if datetime.utcnow() - updated_at > timedelta(hours=12):
        return None
    prices = row['prices']
    df = pd.DataFrame(prices, columns=['ds', 'y'])
    df['ds'] = pd.to_datetime(df['ds'])
    return df

def save_to_cache(coin_id, prices):
    supabase.table("history_cache").upsert({
        "coin_id": coin_id,
        "updated_at": datetime.utcnow().isoformat(),
        "prices": prices
    }).execute()

def fetch_coin_history(coin_id):
    df = fetch_from_cache(coin_id)
    if df is not None:
        logging.info(f"💾 Loaded cached history for {coin_id}")
        return df

    logging.info(f"🌐 Fetching new history for {coin_id}")
    url = f'https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart'
    params = {'vs_currency': 'usd', 'days': '30', 'interval': 'daily'}
    res = requests.get(url, headers=HEADERS, params=params)
    res.raise_for_status()
    prices = res.json().get('prices', [])

    # Save for caching
    save_to_cache(coin_id, prices)

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
            time.sleep(0.5)

        except Exception as e:
            logging.warning(f"⚠️ Skipped {coin['id']}: {e}")

if __name__ == '__main__':
    main()
