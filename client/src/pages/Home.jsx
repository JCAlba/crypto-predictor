import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const Home = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('alphabetical');
  const [showPercentage, setShowPercentage] = useState(false);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/predictions');
        const data = response.data;

        if (Array.isArray(data)) {
          const filtered = data.filter((coin) => {
            const timestamp = new Date(coin.updated_at).getTime();
            return Date.now() - timestamp <= 60 * 60 * 1000;
          });

          setPredictions(filtered);
        } else {
          console.error('Unexpected response format:', data);
        }
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const sortedPredictions = useMemo(() => {
    const sorted = [...predictions];
    switch (sortOption) {
      case 'growth':
        return sorted.sort((a, b) => b.next_day - a.next_day);
      case 'decline':
        return sorted.sort((a, b) => a.next_day - b.next_day);
      default:
        return sorted.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }
  }, [predictions, sortOption]);

  if (loading) return <div className="text-center text-white">Loading...</div>;

  return (
    <div className="p-6 text-white">
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <select
          className="bg-gray-800 text-white p-2 rounded border border-neon"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="alphabetical">Alphabetical</option>
          <option value="growth">Most Growth</option>
          <option value="decline">Most Decline</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showPercentage}
            onChange={() => setShowPercentage(!showPercentage)}
          />
          Show % change
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedPredictions.map((coin) => (
          <div
            key={coin.symbol}
            className="bg-card border border-neon p-4 rounded-lg shadow-neon transition-transform duration-200 hover:scale-105"
          >
            <h2 className="text-xl font-bold mb-2">{coin.symbol}</h2>
            <p>Next Day: {showPercentage ? `${coin.change_day.toFixed(2)}%` : `$${coin.next_day}`}</p>
            <p>Next Week: {showPercentage ? `${coin.change_week.toFixed(2)}%` : `$${coin.next_week}`}</p>
            <p>Next Month: {showPercentage ? `${coin.change_month.toFixed(2)}%` : `$${coin.next_month}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
