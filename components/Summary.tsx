import React, { useMemo } from 'react';
import { type WorkLog, Company, type VideoPost } from '../types';
import { getCompanyColor, VIDEO_POST_EARNING } from '../constants';

interface SummaryProps {
    logs: WorkLog[];
    videoPosts: VideoPost[];
    companyNames: string[];
}

const StatCard: React.FC<{ title: string; value: string; icon?: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-base-300 p-4 rounded-lg flex items-center">
        {icon && <div className="mr-4 text-brand-primary">{icon}</div>}
        <div>
            <div className="text-sm text-content-200">{title}</div>
            <div className="text-2xl font-bold text-content-100">{value}</div>
        </div>
    </div>
);

const Summary: React.FC<SummaryProps> = ({ logs, videoPosts, companyNames }) => {
    const { totalHours, totalEarnings, earningsByCompany } = useMemo(() => {
        let totalHours = 0;
        let totalEarnings = 0;
        const earningsByCompany: { [key: string]: number } = {};

        for (const log of logs) {
            const earnings = log.hours * log.rate;
            totalHours += log.hours;
            totalEarnings += earnings;
            earningsByCompany[log.company] = (earningsByCompany[log.company] || 0) + earnings;
        }

        for (const post of videoPosts) {
            totalEarnings += VIDEO_POST_EARNING;
            earningsByCompany[post.company] = (earningsByCompany[post.company] || 0) + VIDEO_POST_EARNING;
        }

        return { totalHours, totalEarnings, earningsByCompany };
    }, [logs, videoPosts]);

    return (
        <div className="bg-base-200 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-content-100 mb-4">Oversigt</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <StatCard 
                    title="Totale Timer" 
                    value={totalHours.toFixed(2)}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard 
                    title="Total Indtjening" 
                    value={`kr. ${totalEarnings.toFixed(2)}`}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                />
            </div>
            <div className="mt-8">
                 <h4 className="text-md font-semibold text-content-100 mb-2">Indtjening per Kilde</h4>
                 <div className="space-y-2">
                     {companyNames.map(company => (
                        <div key={company}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-content-200">{company}</span>
                                <span className="text-content-100 font-semibold">kr. {(earningsByCompany[company] || 0).toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-base-300 rounded-full h-2.5">
                                <div 
                                    className="h-2.5 rounded-full" 
                                    style={{ 
                                        width: `${totalEarnings > 0 ? ((earningsByCompany[company] || 0) / totalEarnings) * 100 : 0}%`,
                                        backgroundColor: getCompanyColor(company)
                                    }}
                                ></div>
                            </div>
                        </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};

export default Summary;