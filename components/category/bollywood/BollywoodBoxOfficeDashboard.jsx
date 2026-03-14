"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BarChart3, Trophy, TrendingUp, Zap } from 'lucide-react';

const data = [
  { name: 'Pathaan', collection: 1050 },
  { name: 'Jawan', collection: 1150 },
  { name: 'Animal', collection: 900 },
  { name: 'Gadar 2', collection: 525 },
  { name: 'Tiger 3', collection: 460 },
  { name: 'Dunki', collection: 420 },
];

const topPerformers = [
  { rank: '#1', name: 'Jawan', collection: '₹1150 Cr', growth: '+15%' },
  { rank: '#2', name: 'Pathaan', collection: '₹1050 Cr', growth: '+12%' },
  { rank: '#3', name: 'Animal', collection: '₹900 Cr', growth: '+8%' },
  { rank: '#4', name: 'Gadar 2', collection: '₹525 Cr', growth: '+5%' },
];

export default function BollywoodBoxOfficeDashboard() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="w-6 h-6 text-amber-500" />
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Bollywood Box Office Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Top Grossing Films 2023-2024</h3>
            <p className="text-xs text-zinc-500 mt-1">Box office collection in crores (₹)</p>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#d4d4d8', opacity: 0.3 }}
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    fontSize: '14px',
                    padding: '10px 14px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: '#fbbf24', fontWeight: '500', marginTop: '4px' }}
                  labelStyle={{ color: '#ffffff', fontWeight: '600' }}
                  formatter={(value) => [`${value}`, 'collection']}
                />
                <Bar 
                  dataKey="collection" 
                  radius={[4, 4, 0, 0]}
                  barSize={60}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#f59e0b" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-4">
          {/* Top Performers Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-white">Top Performers</h3>
            </div>
            
            <div className="space-y-4">
              {topPerformers.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-600 font-bold text-lg">{item.rank}</span>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-amber-500 transition-colors">{item.name}</p>
                      <p className="text-xs text-zinc-500">{item.collection}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                    <TrendingUp className="w-3 h-3" />
                    <span>{item.growth}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Biggest Opening</p>
                <p className="text-xl font-bold text-amber-500">₹75 Cr</p>
                <p className="text-[10px] text-zinc-600">Jawan (Day 1)</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Most Profitable</p>
                <p className="text-xl font-bold text-amber-500">680% ROI</p>
                <p className="text-[10px] text-zinc-600">Gadar 2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
