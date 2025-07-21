import sys
import json
import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import datetime


def fetch_data(symbol, days=60):
    end = datetime.datetime.today()
    start = end - datetime.timedelta(days=days)
    data = yf.download(symbol, start=start, end=end)
    return data[['Close']].reset_index()

def train_and_predict(df, lookback=7):
    df = df.copy()
    df['target'] = df['Close'].shift(-1)
    df.dropna(inplace=True)

    close_vals = df['Close'].values.flatten()  # <-- fix here

    if len(close_vals) <= lookback:
        raise ValueError("Not enough data for prediction.")

    # Create dataset
    X = []
    y = []

    for i in range(lookback, len(close_vals)):
        X.append(close_vals[i - lookback:i])
        y.append(close_vals[i])

    X = np.array(X)  # shape: (samples, lookback)
    y = np.array(y)  # shape: (samples,)

    model = LinearRegression()
    model.fit(X, y)

    next_input = np.array(close_vals[-lookback:]).reshape(1, -1)
    prediction = model.predict(next_input)[0]

    return round(prediction, 2)


def predict_single(symbol):
    """
    Predicts the price of a single cryptocurrency using Facebook Prophet.
    Symbol must be in the format 'BTC-USD', 'ETH-USD', etc.
    """
    try:
        # Download historical data
        df = yf.download(symbol, period="1y", interval="1d")
        if df.empty:
            raise ValueError("No data found for symbol: " + symbol)

        # Prepare data for Prophet
        df = df.reset_index()[['Date', 'Close']]
        df.columns = ['ds', 'y']

        # Initialize and fit Prophet model
        model = Prophet(daily_seasonality=True)
        model.fit(df)

        # Make future dataframe
        future = model.make_future_dataframe(periods=30)  # predict next 30 days
        forecast = model.predict(future)

        # Extract predictions
        last_price = df['y'].iloc[-1]
        next_day = forecast.iloc[-30]['yhat']
        next_week = forecast.iloc[-23]['yhat']
        next_month = forecast.iloc[-1]['yhat']

        return {
            "prediction": {
                "next_day": round(next_day, 2),
                "next_week": round(next_week, 2),
                "next_month": round(next_month, 2)
            }
        }
    except Exception as e:
        raise RuntimeError(f"Prediction failed for {symbol}: {e}")



def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No symbol provided"}))
        return

    symbol = sys.argv[1]  # e.g., BTC-USD
    df = fetch_data(symbol)
    prediction = train_and_predict(df)
    result = {
        "symbol": symbol,
        "predicted_price": prediction,
        "date": (datetime.datetime.today() + datetime.timedelta(days=1)).strftime('%Y-%m-%d')
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()
