import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const HistoricalMetrics = ({ website }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/historical-data?` + 
        `website=${encodeURIComponent(website)}` +
        `&year=${selectedYear}` +
        `&month=${selectedMonth}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setHistoricalData(data);
      }
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistoricalData();
  }, [website, selectedYear, selectedMonth]);

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border rounded p-2"
        >
          {Array.from({ length: 5 }, (_, i) => 
            new Date().getFullYear() - i
          ).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="border rounded p-2"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
            <option key={month} value={month}>
              {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          Loading...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={historicalData}>
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
            />
            <Line 
              type="monotone" 
              dataKey="latency" 
              stroke="#8884d8" 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default HistoricalMetrics;