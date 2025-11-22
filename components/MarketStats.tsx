
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Product, User } from '../types';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface MarketStatsProps {
  products: Product[];
  currentUser: User;
}

export const MarketStats: React.FC<MarketStatsProps> = ({ products, currentUser }) => {
  
  // 計算農夫的分析數據
  const chartData = useMemo(() => {
    if (currentUser.role === 'farmer') {
        // 1. 找出該農夫的所有產品
        const myProducts = products.filter(p => p.farmerId === currentUser.id);

        // 2. 針對每個產品，找出市場上同名(或關鍵字相符)的競品
        return myProducts.map(myProd => {
            // 簡單的關鍵字匹配：完全同名
            const competitors = products.filter(p => p.name === myProd.name && p.id !== myProd.id);
            
            let marketAvgPrice = 0;
            if (competitors.length > 0) {
                const sum = competitors.reduce((acc, curr) => acc + curr.currentPrice, 0);
                marketAvgPrice = Math.round(sum / competitors.length);
            }

            return {
                name: myProd.name,
                "我的價格": myProd.currentPrice,
                "市場同品項均價": marketAvgPrice > 0 ? marketAvgPrice : null, // 如果沒有競品，顯示 null
                isMonopoly: competitors.length === 0 // 標記是否為獨家
            };
        });
    } 
    
    // 管理員或顧客看到所有產品的概況
    return products.map(p => ({
      name: p.name,
      "當前價格": p.currentPrice,
      "底價": p.basePrice,
    }));
  }, [products, currentUser]);

  if (currentUser.role === 'customer') {
      // 顧客不需要看到太複雜的分析，或者可以維持原樣
      return null; 
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-emerald-600" />
              {currentUser.role === 'farmer' ? '我的產品競品分析' : '全市場價格監控'}
          </h3>
          {currentUser.role === 'farmer' && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  僅顯示您上架的品項與同名產品比較
              </span>
          )}
      </div>
      
      {chartData.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
              <AlertCircle className="w-4 h-4 mr-2" />
              {currentUser.role === 'farmer' ? '您尚未上架任何產品，無法進行分析' : '暫無市場數據'}
          </div>
      ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                barSize={30}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{paddingTop: '10px'}} />
                
                {currentUser.role === 'farmer' ? (
                    <>
                        <Bar dataKey="我的價格" fill="#10b981" name="我的價格" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="市場同品項均價" fill="#6b7280" name="市場均價 (同品項)" radius={[4, 4, 0, 0]} />
                    </>
                ) : (
                    <>
                        <Bar dataKey="底價" fill="#9ca3af" name="底價" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="當前價格" fill="#10b981" name="當前價格" radius={[4, 4, 0, 0]} />
                    </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
      )}
      
      {currentUser.role === 'farmer' && (
          <p className="text-xs text-gray-400 mt-2">
              * 系統自動比對與您產品名稱完全相同的其他賣家產品價格平均值。
          </p>
      )}
    </div>
  );
};
