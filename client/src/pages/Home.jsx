import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import DonationSection from '../components/DonationSection';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import React from 'react';


const Home = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [timeframe, setTimeframe] = useState('next_day');
  const [displayPercent, setDisplayPercent] = useState(false);
  const [sortOption, setSortOption] = useState('alphabetical');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      setError('');
      try {
        // Use relative path for Docker/production, localhost for dev if needed
        const res = await axios.get('/api/predictions');
        console.log('RAW backend response:', res.data);

        let coins = [];
        if (Array.isArray(res.data)) {
          coins = res.data;
        } else if (Array.isArray(res.data.predictions)) {
          coins = res.data.predictions;
        }
        setPredictions(coins);
        console.log('Predictions parsed:', coins);
      } catch (err) {
        setError('Could not fetch predictions. Try again soon!');
        console.error('Prediction fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const filteredPredictions = useMemo(() => {
    return predictions.filter((coin) =>
      coin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, predictions]);

  const sortedPredictions = useMemo(() => {
    const coins = [...filteredPredictions];
    return coins.sort((a, b) => {
      const currA = a.current_price || 0;
      const currB = b.current_price || 0;
      const predA = a[timeframe] ?? currA;
      const predB = b[timeframe] ?? currB;
      const growthA = (predA - currA) / (currA || 1);
      const growthB = (predB - currB) / (currB || 1);

      switch (sortOption) {
        case 'growth_desc':
          return growthB - growthA;
        case 'growth_asc':
          return growthA - growthB;
        case 'most_popular':
          return (b.market_cap || 0) - (a.market_cap || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [filteredPredictions, timeframe, sortOption]);

  // If loading, show animated loading
  if (loading) {
    return (
      <p className="text-neon text-center text-xl animate-pulse mt-10">Loading predictions...</p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <NavBar />

      <div className="p-6">
        <div className="bg-card border border-yellow-500 text-yellow-300 p-4 rounded-lg text-center mb-6">
          ⚠️ <strong>Disclaimer:</strong> The information presented on this site is for informational
          and entertainment purposes only. It does not constitute financial advice. Always do your
          own research before making investment decisions.
        </div>

        <h1 className="text-4xl font-bold text-center text-neon mb-10">Crypto Price Predictor</h1>

        {/* Error Message */}
        {error && (
          <div className="bg-red-700 text-red-200 p-3 mb-6 text-center rounded shadow">
            {error}
          </div>
        )}

        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-center">
          <div>
            <label className="text-neon mr-2">Timeframe:</label>
            <select
              className="bg-card text-white border border-neon rounded p-2"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="next_day">Next Day</option>
              <option value="next_week">Next Week</option>
              <option value="next_month">Next Month</option>
            </select>
          </div>

          <div>
            <label className="text-neon mr-2">Display:</label>
            <select
              className="bg-card text-white border border-neon rounded p-2"
              value={displayPercent}
              onChange={(e) => setDisplayPercent(e.target.value === 'true')}
            >
              <option value="false">Price</option>
              <option value="true">% Change</option>
            </select>
          </div>

          <div>
            <label className="text-neon mr-2">Sort by:</label>
            <select
              className="bg-card text-white border border-neon rounded p-2"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="alphabetical">Alphabetical</option>
              <option value="growth_desc">Most Growth</option>
              <option value="growth_asc">Largest Decrease</option>
              <option value="most_popular">Most Popular</option>
            </select>
          </div>

          <div>
            <input
              type="text"
              placeholder="Search coin..."
              className="bg-card text-white border border-neon rounded p-2 w-48"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {(!sortedPredictions || sortedPredictions.length === 0) && !error ? (
          <p className="text-center text-gray-400">No coins match your search, or no data available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {sortedPredictions.map((coin) => {
              const predictedValue = coin[timeframe] ?? coin.current_price;
              const percentChange =
                ((predictedValue - coin.current_price) / (coin.current_price || 1)) * 100;

              return (
                <div
                  key={coin.id || coin.symbol}
                  className="bg-card border border-neon rounded-lg p-4 shadow-neon hover:scale-105 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {coin.image && (
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-8 h-8 rounded-full border border-neon"
                      />
                    )}
                    <h2 className="text-lg font-semibold text-white">
                      {coin.name}{' '}
                      <span className="text-xs text-neon uppercase">({coin.symbol})</span>
                    </h2>
                  </div>

                  <p className="text-sm text-gray-400">
                    Current: <span className="text-neon">${coin.current_price?.toFixed(2)}</span>
                  </p>

                  <div className="mt-2 text-sm">
                    {displayPercent ? (
                      <p className={percentChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {percentChange >= 0 ? '+' : ''}
                        {percentChange.toFixed(2)}%
                      </p>
                    ) : (
                      <p className="text-white">${predictedValue?.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DonationSection />
      </div>

      <Footer />
    </div>
  );
};

export default Home;
