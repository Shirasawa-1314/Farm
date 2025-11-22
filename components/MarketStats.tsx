import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Product, User } from '../types';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface MarketStatsProps {
  products: Product[];
  currentUser: User;
}

export const MarketStats: React.FC<MarketStatsProps> = ({ products, currentUser }) => {
  const chartData = useMemo(() => {
    if (currentUser.role === 'farmer') {
        return products.filter(p => p.farmerId === currentUser.id).map(myProd => {
            const competitors = products.filter(p => p.name === myProd.name && p.id !== myProd.id);
            const marketAvg = competitors.length ? Math.round(competitors.reduce((acc, c) => acc + c.currentPrice, 0) / competitors.length) : 0;
            return { name: myProd.name, "我的價格": myProd.currentPrice, "市場均價": marketAvg || null };
        });
    }
    return products.map(p => ({ name: p.name, "當前價格": p.currentPrice, "底價": p.basePrice }));
  }, [products, currentUser]);

  if (currentUser.role === 'customer') return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6"><TrendingUp className="text-emerald-600" />市場分析</h3>
      {chartData.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg"><AlertCircle className="w-4 h-4 mr-2" />暫無數據</div>
      ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip />
                <Legend />
                {currentUser.role === 'farmer' ? (
                    <>
                        <Bar dataKey="我的價格" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="市場均價" fill="#6b7280" radius={[4, 4, 0, 0]} />
                    </>
                ) : (
                    <>
                        <Bar dataKey="底價" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="當前價格" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
      )}
    </div>
  );
};