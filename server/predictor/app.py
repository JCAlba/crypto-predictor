from flask import Flask, request, jsonify
from predictor import predict_single
import requests

app = Flask(__name__)

@app.route('/predict', methods=['GET'])
def predict():
    symbol = request.args.get('symbol')

    if symbol:
        # Single coin prediction
        try:
            result = predict_single(symbol)
            return jsonify(result)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    else:
        # Fetch top coins from CoinGecko
        try:
            cg_url = 'https://api.coingecko.com/api/v3/coins/markets'
            params = {
                'vs_currency': 'usd',
                'order': 'market_cap_desc',
                'per_page': 50,
                'page': 1,
                'sparkline': False
            }
            cg_response = requests.get(cg_url, params=params)
            cg_response.raise_for_status()

            coins = cg_response.json()
            results = []

            for coin in coins:
                symbol = f"{coin['symbol'].upper()}-USD"
                try:
                    result = predict_single(symbol)
                    result.update({
                        "name": coin["name"],
                        "symbol": coin["symbol"],
                        "image": coin["image"],
                        "market_cap": coin["market_cap"],
                        "current_price": coin["current_price"],
                        "id": coin["id"],
                    })
                    results.append(result)
                except Exception as e:
                    results.append({
                        "symbol": symbol,
                        "name": coin["name"],
                        "error": str(e),
                    })

            return jsonify({"predictions": results})

        except Exception as e:
            return jsonify({"error": "Failed to fetch all predictions", "detail": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
