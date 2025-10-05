import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from 'recharts';
import { type WorkLog, type VideoPost } from '../types';
import { VIDEO_POST_EARNING } from '../constants';

interface EarningsChartProps {
    logs: WorkLog[];
    videoPosts: VideoPost[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-base-100 p-3 rounded-md shadow-lg border border-base-300">
                <p className="font-bold text-content-100">{label}</p>
                <p className="text-sm" style={{ color: 'var(--color-brand-primary)'}}>{`Indtjening: kr. ${payload[0].value.toFixed(2)}`}</p>
            </div>
        );
    }
    return null;
};


const EarningsChart: React.FC<EarningsChartProps> = ({ logs, videoPosts }) => {
    const chartData = useMemo(() => {
        const monthlyEarnings: { [key: string]: number } = {};

        logs.forEach(log => {
            const month = log.date.substring(0, 7); // "YYYY-MM"
            const earnings = log.hours * log.rate;
            monthlyEarnings[month] = (monthlyEarnings[month] || 0) + earnings;
        });

        videoPosts.forEach(post => {
            const month = post.date.substring(0, 7); // "YYYY-MM"
            monthlyEarnings[month] = (monthlyEarnings[month] || 0) + VIDEO_POST_EARNING;
        });
        
        const data = Object.keys(monthlyEarnings)
            .map(month => ({
                month,
                earnings: monthlyEarnings[month],
            }))
            .sort((a, b) => a.month.localeCompare(b.month));

        // Format month for display
        return data.map(d => {
            const [year, monthNum] = d.month.split('-');
            const date = new Date(parseInt(year), parseInt(monthNum) - 1);
            return {
                ...d,
                month: date.toLocaleString('da-DK', { month: 'short', year: 'numeric' }),
            };
        });
    }, [logs, videoPosts]);

    if (chartData.length < 2) {
        return (
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-content-100 mb-4">Indtjening Over Tid</h3>
                 <div className="text-center py-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-content-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <p className="mt-4 text-sm text-content-200">
                        Ikke nok data til at vise en graf. Tilføj logs for mindst to forskellige måneder.
                    </p>
                </div>
            </div>
        );
    }

    // Get colors from CSS variables for recharts
    const brandColor = 'var(--color-brand-primary)';
    const gridColor = 'var(--color-base-300)';
    const textColor = 'var(--color-content-200)';
    
    return (
        <div className="bg-base-200 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-content-100 mb-4">Indtjening Over Tid</h3>
            <div style={{ width: '100%', height: 300 }}>
                 <ResponsiveContainer>
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={brandColor} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={brandColor} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="month" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `kr ${value / 1000}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="earnings" stroke={brandColor} fillOpacity={1} fill="url(#colorEarnings)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EarningsChart;
