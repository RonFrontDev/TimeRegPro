import React, { useState, useEffect } from 'react';
import { type WorkLog, type VideoPost, type CompanyRates, Company } from '../types';
import { COMPANIES, COMPANY_COLORS, VIDEO_POST_COLOR, VIDEO_POST_EARNING } from '../constants';

interface DayEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    logs: WorkLog[];
    date: Date;
    videoPost: VideoPost | null;
    companyRates: CompanyRates;
    onAddLog: (log: Omit<WorkLog, 'id'>) => void;
    onDeleteLog: (id: string) => void;
    onSaveVideoPost: (date: string, company: Company) => void;
    onDeleteVideoPost: (date: string) => void;
}

// Helper function to format date correctly, avoiding timezone issues.
// This creates a YYYY-MM-DD string based on the local date, not UTC.
const formatDateToYYYYMMDD = (d: Date): string => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};


const DayEntryModal: React.FC<DayEntryModalProps> = ({
    isOpen,
    onClose,
    logs,
    date,
    videoPost,
    companyRates,
    onAddLog,
    onDeleteLog,
    onSaveVideoPost,
    onDeleteVideoPost,
}) => {
    // State for new work log form
    const [company, setCompany] = useState<Company>(COMPANIES[0]);
    const [hours, setHours] = useState('');
    const [rate, setRate] = useState('');

    // State for video post form
    const [videoCompany, setVideoCompany] = useState<Company>(videoPost?.company || COMPANIES[0]);

    // Use the reliable helper function to prevent timezone errors
    const dateString = formatDateToYYYYMMDD(date);

    useEffect(() => {
        // Auto-fill rate when company changes
        const savedRate = companyRates[company];
        if (savedRate !== undefined) {
            setRate(savedRate.toString());
        } else {
            setRate('');
        }
    }, [company, companyRates]);

    useEffect(() => {
        if (videoPost) {
            setVideoCompany(videoPost.company);
        } else {
            setVideoCompany(COMPANIES[0]);
        }
        // Reset form when modal opens for a new day
        setCompany(COMPANIES[0]);
        setHours('');
    }, [videoPost, date]);


    if (!isOpen) return null;

    const handleAddLogSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const hoursNum = parseFloat(hours);
        const rateNum = parseFloat(rate);

        if (hoursNum > 0 && rateNum >= 0) {
            onAddLog({ company, date: dateString, hours: hoursNum, rate: rateNum });
            setHours('');
            // Keep company and rate for potentially adding more logs for the same company
        } else {
            alert('Indtast venligst gyldige timer og en gyldig timeløn.');
        }
    };

    const handleVideoPostToggle = (isChecked: boolean) => {
        if (isChecked) {
            onSaveVideoPost(dateString, videoCompany);
        } else {
            onDeleteVideoPost(dateString);
        }
    };

    const handleVideoCompanyChange = (newCompany: Company) => {
        setVideoCompany(newCompany);
        if (videoPost) {
            onSaveVideoPost(dateString, newCompany);
        }
    };

    const totalDayHours = logs.reduce((acc, log) => acc + log.hours, 0);
    const totalDayEarnings = logs.reduce((acc, log) => acc + log.hours * log.rate, 0) + (videoPost ? VIDEO_POST_EARNING : 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-base-200 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start p-4 border-b border-base-300 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-content-100">{date.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
                         <p className="text-sm text-content-200 mt-1">
                            Total for dagen:
                            <span className="font-bold text-content-100 ml-2">{totalDayHours.toFixed(2)} timer</span>
                            <span className="font-bold text-content-100 ml-4">kr. {totalDayEarnings.toFixed(2)}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-base-300 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
                    {/* Left Column: Entries */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-content-100">Registreringer</h3>
                        <div className="space-y-2">
                            {logs.length === 0 && !videoPost && (
                                <div className="text-center py-8 px-4 border-2 border-dashed border-base-300 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-content-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p className="text-sm text-content-200 italic mt-2">Ingen registreringer for denne dag.</p>
                                </div>
                            )}
                            {logs.map(log => (
                                <div key={log.id} className="bg-base-300 p-3 rounded-lg flex justify-between items-center gap-4">
                                    <div className="flex items-center flex-grow min-w-0">
                                        <span className="h-2 w-2 rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: COMPANY_COLORS[log.company] }}></span>
                                        <div className="min-w-0">
                                            <p className="font-medium text-content-100 truncate">{log.company}</p>
                                            <p className="text-xs text-content-200">{log.hours} timer @ kr. {log.rate.toFixed(2)}/time</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-bold text-content-100">kr. {(log.hours * log.rate).toFixed(2)}</p>
                                    </div>
                                     <button onClick={() => onDeleteLog(log.id)} className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 flex-shrink-0 transition-colors" aria-label={`Slet post for ${log.company}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                     </button>
                                </div>
                            ))}
                            {videoPost && (
                                <div className="bg-base-300 p-3 rounded-lg flex justify-between items-center gap-4">
                                    <div className="flex items-center flex-grow">
                                        <span className="h-2 w-2 rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: VIDEO_POST_COLOR }}></span>
                                        <div>
                                            <p className="font-medium text-content-100">Video Post</p>
                                            <p className="text-xs text-content-200">{videoPost.company}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-content-100">kr. {VIDEO_POST_EARNING.toFixed(2)}</p>
                                    </div>
                                    <div className="w-9 h-9 flex-shrink-0"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Right Column: Forms */}
                    <div className="space-y-6">
                        <div className="bg-base-100 p-4 rounded-lg">
                             <h3 className="text-lg font-semibold text-content-100 mb-3">Tilføj Arbejdspost</h3>
                             <form onSubmit={handleAddLogSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="modal-company" className="text-sm font-medium text-content-200 block mb-1">Firma</label>
                                    <select id="modal-company" value={company} onChange={e => setCompany(e.target.value as Company)} className="w-full bg-base-300 border-transparent rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                        {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="modal-hours" className="text-sm font-medium text-content-200 block mb-1">Timer</label>
                                        <input id="modal-hours" type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="f.eks. 8" step="0.01" min="0" required className="w-full bg-base-300 border-transparent rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                                    </div>
                                    <div>
                                        <label htmlFor="modal-rate" className="text-sm font-medium text-content-200 block mb-1">Timeløn</label>
                                        <input id="modal-rate" type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="f.eks. 160" step="0.01" min="0" required className="w-full bg-base-300 border-transparent rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                                    </div>
                                </div>
                                <div>
                                    <button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-md text-sm transition-colors">Tilføj</button>
                                </div>
                            </form>
                        </div>
                        <div className="bg-base-100 p-4 rounded-lg">
                             <h3 className="text-lg font-semibold text-content-100 mb-3 flex items-center">
                                <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: VIDEO_POST_COLOR }}></span>
                                Video Post
                            </h3>
                             <div className="space-y-3">
                                 <div className="flex items-center bg-base-200 p-2 rounded-md">
                                    <input
                                        type="checkbox"
                                        id="video-post-checkbox"
                                        checked={!!videoPost}
                                        onChange={(e) => handleVideoPostToggle(e.target.checked)}
                                        className="h-4 w-4 rounded border-base-300 text-brand-primary focus:ring-brand-primary"
                                    />
                                    <label htmlFor="video-post-checkbox" className="ml-2 text-sm font-medium text-content-100">
                                        Registrer Video Post (tilføjer kr. {VIDEO_POST_EARNING.toFixed(2)})
                                    </label>
                                </div>
                                {videoPost && (
                                    <div>
                                        <label htmlFor="modal-video-company" className="text-sm font-medium text-content-200 block mb-1">Tilknyt firma</label>
                                        <select
                                            id="modal-video-company"
                                            value={videoCompany}
                                            onChange={(e) => handleVideoCompanyChange(e.target.value as Company)}
                                            className="w-full bg-base-300 border-transparent rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                        >
                                            {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DayEntryModal;