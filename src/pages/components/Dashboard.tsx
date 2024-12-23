import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import HistoricalMetrics from './HistoricalMetrics';

export default function Dashboard() {
  const [realtimeMetrics, setRealtimeMetrics] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const websocket = new WebSocket('wss://your-worker.workers.dev');
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setRealtimeMetrics(current => [...current.slice(-100), data]);
    };
    
    setWs(websocket);
    
    return () => websocket.close();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Website Monitoring Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h2 className="text-xl mb-4">Real-time Metrics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={realtimeMetrics}>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()} 
              />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="latency" 
                stroke="#8884d8" 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="border rounded p-4">
          <h2 className="text-xl mb-4">Historical Data</h2>
          {selectedWebsite && (
            <HistoricalMetrics website={selectedWebsite} />
          )}
        </div>
      </div>
    </div>
  );
}