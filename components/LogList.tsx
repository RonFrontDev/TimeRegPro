import React from 'react';
import { type WorkLog } from '../types';
import { COMPANY_COLORS } from '../constants';

interface LogListProps {
    logs: WorkLog[];
    onDeleteLog: (id: string) => void;
}

const LogList: React.FC<LogListProps> = ({ logs, onDeleteLog }) => {
    if (logs.length === 0) {
        return (
            <div className="bg-base-200 p-8 rounded-xl shadow-lg text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-content-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="mt-2 text-xl font-medium text-content-100">Ingen Poster Endnu</h3>
                <p className="mt-1 text-sm text-content-200">Tilføj en ny arbejdspost for at komme i gang.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-base-200 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-content-100">
                    <thead className="text-xs text-content-200 uppercase bg-base-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Firma</th>
                            <th scope="col" className="px-6 py-3">Dato</th>
                            <th scope="col" className="px-6 py-3 text-right">Timer</th>
                            <th scope="col" className="px-6 py-3 text-right">Timeløn</th>
                            <th scope="col" className="px-6 py-3 text-right">Indtjening</th>
                            <th scope="col" className="px-6 py-3 text-center">Handlinger</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} className="bg-base-200 border-b border-base-300 hover:bg-base-300/50">
                                <td className="px-6 py-4 font-medium text-content-100 whitespace-nowrap">
                                    <span className="flex items-center">
                                      <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: COMPANY_COLORS[log.company] }}></span>
                                      {log.company}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{new Date(log.date.replace(/-/g, '/')).toLocaleDateString('da-DK', { timeZone: 'Europe/Copenhagen' })}</td>
                                <td className="px-6 py-4 text-right">{log.hours.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">kr. {log.rate.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right font-bold text-content-100">kr. {(log.hours * log.rate).toFixed(2)}</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => onDeleteLog(log.id)} className="text-red-500 hover:text-red-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LogList;