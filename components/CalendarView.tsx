import React, { useState, useMemo, useEffect } from 'react';
import { type WorkLog, type VideoPost, type CompanyRates, Company } from '../types';
import { getCompanyColor, VIDEO_POST_EARNING } from '../constants';
import DayEntryModal from './DayEntryModal';

type CalendarViewMode = 'month' | 'week' | 'day';

interface CalendarViewProps {
    logs: WorkLog[];
    videoPosts: VideoPost[];
    companyRates: CompanyRates;
    onAddLog: (log: Omit<WorkLog, 'id'>) => void;
    onDeleteLog: (id: string) => void;
    onSaveVideoPost: (date: string, company: Company) => void;
    onDeleteVideoPost: (date: string) => void;
    currentDate: Date;
    onCurrentDateChange: (date: Date) => void;
    companyNames: string[];
}

// Helper function for ISO 8601 week number
const getWeekNumber = (d: Date): number => {
    // Create a copy to avoid modifying the original date
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Sunday is 0, Monday is 1, etc. We use || 7 to map Sunday to 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    // Return week number
    return weekNo;
};


const formatDateToYYYYMMDD = (d: Date): string => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const VideoIcon: React.FC<{ company: Company }> = ({ company }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute top-1 right-1" viewBox="0 0 20 20" fill={getCompanyColor(company)}>
      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14.553 1.106A1 1 0 0016 8v4a1 1 0 00.553.894l2 1A1 1 0 0020 13V7a1 1 0 00-1.447-.894l-2-1z" />
    </svg>
);

const CalendarView: React.FC<CalendarViewProps> = (props) => {
    const { logs, videoPosts, companyRates, onAddLog, onDeleteLog, onSaveVideoPost, onDeleteVideoPost, currentDate, onCurrentDateChange, companyNames } = props;
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [view, setView] = useState<CalendarViewMode>('month');

    // State for Quick Add feature
    const [isQuickAddActive, setIsQuickAddActive] = useState(false);
    const [quickAddCompany, setQuickAddCompany] = useState<Company>(companyNames[0] || '');
    const [quickAddHours, setQuickAddHours] = useState('1');

    useEffect(() => {
        // Ensure quick add company is valid if company list changes
        if (companyNames.length > 0 && !companyNames.includes(quickAddCompany)) {
            setQuickAddCompany(companyNames[0]);
        } else if (companyNames.length === 0) {
            setQuickAddCompany('');
        }
    }, [companyNames, quickAddCompany]);


    const toLocalDateString = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toDateString();
    }

    const { logsByDate, videoPostsByDate } = useMemo(() => {
        const logsMap = new Map<string, WorkLog[]>();
        logs.forEach(log => {
            const parts = log.date.split('-').map(Number);
            const logDate = new Date(parts[0], parts[1] - 1, parts[2]);
            const dateKey = toLocalDateString(logDate);
            if (!logsMap.has(dateKey)) logsMap.set(dateKey, []);
            logsMap.get(dateKey)!.push(log);
        });

        const videoMap = new Map<string, VideoPost>();
        videoPosts.forEach(post => {
            const parts = post.date.split('-').map(Number);
            const postDate = new Date(parts[0], parts[1] - 1, parts[2]);
            const dateKey = toLocalDateString(postDate);
            videoMap.set(dateKey, post);
        });
        return { logsByDate: logsMap, videoPostsByDate: videoMap };
    }, [logs, videoPosts]);

    const handleDayClick = (date: Date) => {
        if (isQuickAddActive) {
            const hoursNum = parseFloat(quickAddHours);
            if (!quickAddCompany || !hoursNum || hoursNum <= 0) {
                alert('Vælg venligst et firma og indtast et gyldigt antal timer.');
                return;
            }
            const rate = companyRates[quickAddCompany] || 0;
            const dateString = formatDateToYYYYMMDD(date);
            onAddLog({
                company: quickAddCompany,
                date: dateString,
                hours: hoursNum,
                rate: rate,
            });
            // Don't open the modal, just add the log.
        } else {
            setSelectedDate(date);
        }
    };
    const closeModal = () => setSelectedDate(null);

    const navigateDate = (offset: number) => {
        const newDate = new Date(currentDate);
        if (view === 'month') {
            newDate.setMonth(newDate.getMonth() + offset, 1);
        } else if (view === 'week') {
            newDate.setDate(newDate.getDate() + (offset * 7));
        } else { // day
            newDate.setDate(newDate.getDate() + offset);
        }
        onCurrentDateChange(newDate);
    };

    const renderHeader = () => {
        if (view === 'month') {
            return currentDate.toLocaleString('da-DK', { month: 'long', year: 'numeric' });
        }
        if (view === 'week') {
            const start = new Date(currentDate);
            const dayOfWeek = start.getDay();
            const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            start.setDate(diff);

            const end = new Date(start);
            end.setDate(start.getDate() + 6);

            if (start.getMonth() === end.getMonth()) {
                return `${start.getDate()}. - ${end.getDate()}. ${end.toLocaleString('da-DK', { month: 'long', year: 'numeric' })}`;
            }
            return `${start.getDate()}. ${start.toLocaleString('da-DK', { month: 'short' })} - ${end.getDate()}. ${end.toLocaleString('da-DK', { month: 'short', year: 'numeric' })}`;
        }
        return currentDate.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const QuickAddPanel = () => (
        <div className={`bg-base-100 p-3 rounded-lg mb-4 border ${isQuickAddActive ? 'border-brand-primary' : 'border-transparent'}`}>
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-grow w-full sm:w-auto">
                    <label htmlFor="qa-company" className="sr-only">Firma</label>
                    <select
                        id="qa-company"
                        value={quickAddCompany}
                        onChange={e => setQuickAddCompany(e.target.value)}
                        className="w-full bg-base-300 border-transparent rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        disabled={isQuickAddActive}
                    >
                        {companyNames.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="flex-grow w-full sm:w-auto">
                    <label htmlFor="qa-hours" className="sr-only">Timer</label>
                    <input
                        id="qa-hours"
                        type="number"
                        value={quickAddHours}
                        onChange={e => setQuickAddHours(e.target.value)}
                        placeholder="Timer"
                        step="0.1"
                        min="0"
                        className="w-full bg-base-300 border-transparent rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        disabled={isQuickAddActive}
                    />
                </div>
                <button
                    onClick={() => setIsQuickAddActive(!isQuickAddActive)}
                    className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center ${isQuickAddActive ? 'bg-brand-primary text-white' : 'bg-base-300 hover:bg-base-300/80'}`}
                >
                     {isQuickAddActive ? (
                         <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            Deaktiver
                         </>
                     ) : (
                         <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Aktiver Hurtig Tilføjning
                         </>
                     )}
                </button>
            </div>
            {isQuickAddActive && <p className="text-xs text-center mt-2 text-content-200">Klik på en dato i kalenderen for at tilføje en post med de valgte indstillinger.</p>}
        </div>
    );

    const ViewSwitcher: React.FC = () => (
        <div className="flex justify-center bg-base-300 rounded-lg p-1 space-x-1 mb-4">
            {(['month', 'week', 'day'] as CalendarViewMode[]).map(v => (
                <button
                    key={v}
                    className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${view === v ? 'bg-brand-primary text-tab-active-text shadow' : 'hover:bg-base-100/50'}`}
                    onClick={() => setView(v)}
                >
                    {v === 'month' ? 'Måned' : v === 'week' ? 'Uge' : 'Dag'}
                </button>
            ))}
        </div>
    );

    const renderMonthView = () => {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const firstDayOfMonth = startOfMonth.getDay();
        const dayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday is 1, Sunday is 0. We want Monday as 0.
        const startDate = new Date(startOfMonth);
        startDate.setDate(startDate.getDate() - dayOffset);

        const days = Array.from({ length: 42 }, (_, i) => {
            const day = new Date(startDate);
            day.setDate(day.getDate() + i);
            return day;
        });

        const weeks: Date[][] = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }

        const daysOfWeek = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

        return (
            <div className="grid grid-cols-[2rem_repeat(7,minmax(0,1fr))] gap-1">
                {/* Header row: Week number placeholder + days of week */}
                <div className="text-center text-xs p-2 font-semibold text-content-200">#</div>
                {daysOfWeek.map(d => <div key={d} className="text-center text-xs p-2 font-semibold text-content-200">{d}</div>)}

                {/* Calendar body cells */}
                {weeks.map((week, weekIndex) => (
                    <React.Fragment key={weekIndex}>
                        <div className="flex items-center justify-center text-xs font-medium text-content-200/80 pt-2">
                            {getWeekNumber(week[3])} {/* Use Thursday for ISO week number */}
                        </div>
                        {week.map((d) => {
                            const dateKey = toLocalDateString(d);
                            const dayLogs = logsByDate.get(dateKey) || [];
                            const dayVideoPost = videoPostsByDate.get(dateKey);
                            const isCurrentMonth = d.getMonth() === currentDate.getMonth();
                            const isToday = dateKey === toLocalDateString(new Date());

                            return (
                                <div
                                    key={d.toISOString()}
                                    className={`p-2 h-28 rounded-md flex flex-col justify-start items-start relative transition-all duration-150 ${isCurrentMonth ? 'bg-base-100' : 'bg-base-300/50 text-content-200/50'} ${isQuickAddActive ? 'cursor-copy hover:bg-brand-primary/20 hover:ring-2 hover:ring-brand-primary' : 'cursor-pointer hover:bg-base-300'}`}
                                    onClick={() => handleDayClick(d)}
                                >
                                    <span className={`font-bold ${isToday ? 'bg-brand-primary text-white rounded-full h-6 w-6 flex items-center justify-center' : ''}`}>{d.getDate()}</span>
                                    {dayVideoPost && <VideoIcon company={dayVideoPost.company} />}
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {dayLogs.slice(0, 9).map(log => (
                                            <div key={log.id} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: getCompanyColor(log.company) }} title={`${log.company}: ${log.hours} timer`}></div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const renderWeekView = () => {
        const start = new Date(currentDate);
        const dayOfWeek = start.getDay();
        const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        start.setDate(diff);

        const weekDays = Array.from({ length: 7 }, (_, i) => {
            const day = new Date(start);
            day.setDate(day.getDate() + i);
            return day;
        });
        const daysOfWeek = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];

        return (
             <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                {weekDays.map((d, i) => {
                    const dateKey = toLocalDateString(d);
                    const dayLogs = logsByDate.get(dateKey) || [];
                    const dayVideoPost = videoPostsByDate.get(dateKey);
                    const totalHours = dayLogs.reduce((sum, log) => sum + log.hours, 0);
                    const totalEarnings = dayLogs.reduce((sum, log) => sum + log.hours * log.rate, 0) + (dayVideoPost ? VIDEO_POST_EARNING : 0);

                    return (
                        <div key={i} className="bg-base-100 rounded-lg p-3 flex flex-col cursor-pointer hover:bg-base-300/50" onClick={() => handleDayClick(d)}>
                            <div className="font-bold text-content-100">{daysOfWeek[i]}, {d.getDate()}.</div>
                            <div className="flex-grow mt-2 space-y-1 overflow-y-auto min-h-[150px]">
                                {dayLogs.map(log => (
                                    <div key={log.id} className="text-xs bg-base-300 p-1.5 rounded flex items-center" title={`${log.company}: ${log.hours}t @ ${log.rate}kr`}>
                                        <span className="h-2 w-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: getCompanyColor(log.company) }}></span>
                                        <span className="truncate flex-grow">{log.company}</span>
                                        <span className="font-semibold ml-2">{(log.hours * log.rate).toFixed(0)}</span>
                                    </div>
                                ))}
                                {dayVideoPost && (
                                     <div className="text-xs bg-base-300 p-1.5 rounded flex items-center" title={`Video Post: ${VIDEO_POST_EARNING}kr`}>
                                        <span className="h-2 w-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: getCompanyColor(dayVideoPost.company) }}></span>
                                        <span className="truncate flex-grow">Video Post</span>
                                        <span className="font-semibold ml-2">{VIDEO_POST_EARNING}</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-2 pt-2 border-t border-base-300 text-xs font-semibold text-right">
                                <p>kr. {totalEarnings.toFixed(2)}</p>
                                <p className="text-content-200">{totalHours.toFixed(2)} timer</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderDayView = () => {
        const dateKey = toLocalDateString(currentDate);
        const dayLogs = logsByDate.get(dateKey) || [];
        const dayVideoPost = videoPostsByDate.get(dateKey);
        
        return (
            <div className="space-y-4">
                 <div className="space-y-2">
                    {dayLogs.length === 0 && !dayVideoPost ? (
                        <div className="text-center py-8 px-4 border-2 border-dashed border-base-300 rounded-lg">
                            <p className="text-sm text-content-200 italic">Ingen registreringer for denne dag.</p>
                        </div>
                    ) : (
                        <>
                            {dayLogs.map(log => (
                                <div key={log.id} className="bg-base-300 p-3 rounded-lg flex justify-between items-center gap-4">
                                    <div className="flex items-center min-w-0">
                                        <span className="h-2 w-2 rounded-full mr-3" style={{ backgroundColor: getCompanyColor(log.company) }}></span>
                                        <div>
                                            <p className="font-medium text-content-100 truncate">{log.company}</p>
                                            <p className="text-xs text-content-200">{log.hours} timer @ kr. {log.rate.toFixed(2)}/time</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-content-100">kr. {(log.hours * log.rate).toFixed(2)}</p>
                                </div>
                            ))}
                            {dayVideoPost && (
                                <div className="bg-base-300 p-3 rounded-lg flex justify-between items-center gap-4">
                                     <div className="flex items-center">
                                        <span className="h-2 w-2 rounded-full mr-3" style={{ backgroundColor: getCompanyColor(dayVideoPost.company) }}></span>
                                        <div>
                                            <p className="font-medium text-content-100">Video Post</p>
                                            <p className="text-xs text-content-200">{dayVideoPost.company}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-content-100">kr. {VIDEO_POST_EARNING.toFixed(2)}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
                 <button onClick={() => handleDayClick(currentDate)} className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-md transition-colors">
                    Tilføj / Rediger Poster
                </button>
            </div>
        )
    };
    
    const selectedDayLogs = selectedDate ? logsByDate.get(toLocalDateString(selectedDate)) || [] : [];
    const selectedDayVideoPost = selectedDate ? videoPostsByDate.get(toLocalDateString(selectedDate)) || null : null;

    return (
        <div className="bg-base-200 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => navigateDate(-1)} className="p-2 rounded-full hover:bg-base-300 transition-colors">‹</button>
                <h3 className="text-xl font-bold text-content-100 text-center">
                    {renderHeader()}
                </h3>
                <button onClick={() => navigateDate(1)} className="p-2 rounded-full hover:bg-base-300 transition-colors">›</button>
            </div>
            
            <ViewSwitcher />

            {view === 'month' && <QuickAddPanel />}

            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}

            {selectedDate && (
                <DayEntryModal 
                    isOpen={!!selectedDate}
                    onClose={closeModal}
                    logs={selectedDayLogs}
                    date={selectedDate}
                    videoPost={selectedDayVideoPost}
                    onSaveVideoPost={onSaveVideoPost}
                    onDeleteVideoPost={onDeleteVideoPost}
                    companyRates={companyRates}
                    onAddLog={onAddLog}
                    onDeleteLog={onDeleteLog}
                    companyNames={companyNames}
                />
            )}
        </div>
    );
};

export default CalendarView;