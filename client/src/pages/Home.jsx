import { useEffect, useState } from 'react';
import axios from 'axios';
import DonationSection from '../components/DonationSection';

const Home = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/predictions');
        setPredictions(res.data.predictions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading) {
    return (
      <p className="text-neon text-center text-xl animate-pulse">Loading predictions...</p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {predictions.map((coin) => (
          <div
            key={coin.id}
            className="bg-card border border-neon rounded-lg p-4 shadow-neon hover:scale-105 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src={coin.image}
                alt={coin.name}
                className="w-8 h-8 rounded-full border border-neon"
              />
              <h2 className="text-lg font-semibold text-white">
                {coin.name} <span className="text-xs text-neon uppercase">({coin.symbol})</span>
              </h2>
            </div>
            <p className="text-sm text-gray-400">
              Current Price: <span className="text-neon">${coin.current_price.toFixed(2)}</span>
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Next Day: <span className="text-white">${coin.prediction.next_day.toFixed(2)}</span></li>
              <li>Next Week: <span className="text-white">${coin.prediction.next_week.toFixed(2)}</span></li>
              <li>Next Month: <span className="text-white">${coin.prediction.next_month.toFixed(2)}</span></li>
            </ul>
          </div>
        ))}
      </div>

      <DonationSection />
    </>
  );
};

export default Home;
