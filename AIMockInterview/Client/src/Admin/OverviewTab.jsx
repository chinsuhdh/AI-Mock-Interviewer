import React from 'react';
import { Users, Package, TrendingUp, Crown, Activity } from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';

// Data Mock: Lượt sử dụng / Phỏng vấn qua các tháng (Free vs Pro)
const performanceData = [
    { name: 'Tháng 1', free: 4000, pro: 1200 }, 
    { name: 'Tháng 2', free: 4500, pro: 1800 },
    { name: 'Tháng 3', free: 4200, pro: 2400 }, 
    { name: 'Tháng 4', free: 5800, pro: 3900 },
    { name: 'Tháng 5', free: 6500, pro: 4800 }, 
    { name: 'Tháng 6', free: 7200, pro: 6100 },
];

// Data Mock: Tỷ lệ phân bổ User theo gói
const packageDistribution = [
    { name: 'Basic Free', value: 6500 },
    { name: 'Pro Monthly', value: 2800 },
    { name: 'Premium 6T', value: 700 },
];

const PIE_COLORS = ['#9ca3af', '#f59e0b', '#8b5cf6'];

const StatCard = ({ icon: Icon, title, value, colorClass, iconClass, trend }) => (
    <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col gap-2 relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconClass}`}>
                <Icon size={24} />
            </div>
            {trend && (
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp size={12} /> {trend}
                </span>
            )}
        </div>
        <p className="text-neutral-500 font-bold text-sm uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-neutral-900 truncate">{value}</h3>
        <div className={`absolute -right-4 -bottom-4 opacity-[0.03] ${colorClass}`}>
            <Icon size={120} />
        </div>
    </div>
);

// Custom Tooltip cho Area Chart
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-neutral-900 text-white p-4 rounded-xl shadow-2xl border border-neutral-700">
                <p className="font-bold mb-2 text-amber-400">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm font-medium">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-neutral-300">{entry.name}:</span>
                        <span className="font-bold">{entry.value.toLocaleString()} lượt</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export const OverviewTab = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
        
        {/* 4 Cards Thống kê Performance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                icon={Users} title="Tổng User" value="10,000" 
                iconClass="bg-blue-50 text-blue-600" colorClass="text-blue-600" trend="+12%" 
            />
            <StatCard 
                icon={TrendingUp} title="Tỷ lệ chuyển đổi (CR)" value="18.5%" 
                iconClass="bg-green-50 text-green-600" colorClass="text-green-600" trend="+2.4%" 
            />
            <StatCard 
                icon={Crown} title="Gói phổ biến nhất" value="Pro Monthly" 
                iconClass="bg-amber-50 text-amber-600" colorClass="text-amber-600" 
            />
            <StatCard 
                icon={Activity} title="Lượt phỏng vấn (Tháng)" value="45,230" 
                iconClass="bg-purple-50 text-purple-600" colorClass="text-purple-600" trend="+34%" 
            />
        </div>
        
        {/* Phần Biểu đồ - Cấu trúc 2 cột (Chart Chính 70% - Chart Tròn 30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Chính (Area Chart) phóng to */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] lg:col-span-2 flex flex-col">
                <div className="mb-6">
                    <h3 className="font-black text-xl text-neutral-900">Mức độ tương tác / Lượt phỏng vấn</h3>
                    <p className="text-sm font-medium text-neutral-500">So sánh mức độ sử dụng giữa nhóm Free và Pro trong 6 tháng qua</p>
                </div>
                
                {/* Scale chiều cao theo thiết bị: xl 500px, màn nhỏ 400px */}
                <div className="w-full h-[400px] xl:h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPro" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorFree" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#9ca3af" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280', fontWeight: 600}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280', fontWeight: 600}} tickFormatter={v => `${v/1000}k`} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }} />
                            
                            <Area type="monotone" dataKey="free" name="Gói Free" stroke="#9ca3af" strokeWidth={3} fillOpacity={1} fill="url(#colorFree)" />
                            <Area type="monotone" dataKey="pro" name="Gói Pro & Premium" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorPro)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart Phụ (Donut Chart) */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col">
                <div className="mb-6">
                    <h3 className="font-black text-xl text-neutral-900">Phân bổ Gói (Active)</h3>
                    <p className="text-sm font-medium text-neutral-500">Tỷ lệ User sử dụng các gói dịch vụ</p>
                </div>
                
                <div className="w-full flex-1 min-h-[300px] flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={packageDistribution}
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {packageDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                formatter={(value) => [`${value.toLocaleString()} Users`, 'Số lượng']}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: 600, color: '#4b5563' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Chữ ở giữa Donut */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                        <span className="text-3xl font-black text-neutral-900">10k</span>
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Users</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
);