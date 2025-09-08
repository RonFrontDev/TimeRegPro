import React, { useState, useMemo } from 'react';
import { type WorkLog, type VideoPost, type CompanyRates, Company } from '../types';
import { COMPANY_COLORS, VIDEO_POST_COLOR, VIDEO_POST_EARNING } from '../constants';
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
}

const VideoIcon: React.FC<{ company: Company }> = ({ company }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute top-1 right-1" viewBox="0 0 20 20" fill={COMPANY_COLORS[company]}>
      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14.553 1.106A1 1 0 0016 8v4a1 1 0 00.553.894l2 1A1 1 0 0020 13V7a1 1 0 00-1.447-.894l-2-1z" />
    </svg>
);

const CalendarView: React.FC<CalendarViewProps> = (props) => {
    const { logs, videoPosts, companyRates, onAddLog, onDeleteLog, onSaveVideoPost, onDeleteVideoPost, currentDate, onCurrentDateChange } = props;
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [view, setView] = useState<CalendarViewMode>('month');

    // Helper to get a date string that is timezone-safe for keying
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

    const handleDayClick = (date: Date) => setSelectedDate(date);
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
            // Adjust to Monday
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
        const dayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
        const startDate = new Date(startOfMonth);
        startDate.setDate(startDate.getDate() - dayOffset);

        const days = Array.from({ length: 42 }, (_, i) => {
            const day = new Date(startDate);
            day.setDate(day.getDate() + i);
            return day;
        });

        const daysOfWeek = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

        return (
            <>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-content-200">
                    {daysOfWeek.map(d => <div key={d} className="p-2 font-semibold">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days.map((d, i) => {
                        const dateKey = toLocalDateString(d);
                        const dayLogs = logsByDate.get(dateKey) || [];
                        const dayVideoPost = videoPostsByDate.get(dateKey);
                        const isCurrentMonth = d.getMonth() === currentDate.getMonth();
                        const isToday = dateKey === toLocalDateString(new Date());

                        return (
                            <div
                                key={i}
                                className={`p-2 h-24 rounded-md flex flex-col justify-start items-start relative transition-colors duration-200 cursor-pointer hover:bg-base-300 ${isCurrentMonth ? 'bg-base-100' : 'bg-base-300/50 text-content-200/50'}`}
                                onClick={() => handleDayClick(d)}
                            >
                                <span className={`font-bold ${isToday ? 'bg-brand-primary text-white rounded-full h-6 w-6 flex items-center justify-center' : ''}`}>{d.getDate()}</span>
                                {dayVideoPost && <VideoIcon company={dayVideoPost.company} />}
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {dayLogs.slice(0, 9).map(log => (
                                        <div key={log.id} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COMPANY_COLORS[log.company] }} title={`${log.company}: ${log.hours} timer`}></div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
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
                        <div key={i} className="bg-base-100 rounded-lg p-3 flex flex-col" onClick={() => handleDayClick(d)}>
                            <div className="font-bold text-content-100">{daysOfWeek[i]}, {d.getDate()}.</div>
                            <div className="flex-grow mt-2 space-y-1 overflow-y-auto min-h-[150px]">
                                {dayLogs.map(log => (
                                    <div key={log.id} className="text-xs bg-base-300 p-1.5 rounded flex items-center" title={`${log.company}: ${log.hours}t @ ${log.rate}kr`}>
                                        <span className="h-2 w-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: COMPANY_COLORS[log.company] }}></span>
                                        <span className="truncate flex-grow">{log.company}</span>
                                        <span className="font-semibold ml-2">{(log.hours * log.rate).toFixed(0)}</span>
                                    </div>
                                ))}
                                {dayVideoPost && (
                                     <div className="text-xs bg-base-300 p-1.5 rounded flex items-center" title={`Video Post: ${VIDEO_POST_EARNING}kr`}>
                                        <span className="h-2 w-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: VIDEO_POST_COLOR }}></span>
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
                                        <span className="h-2 w-2 rounded-full mr-3" style={{ backgroundColor: COMPANY_COLORS[log.company] }}></span>
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
                                        <span className="h-2 w-2 rounded-full mr-3" style={{ backgroundColor: VIDEO_POST_COLOR }}></span>
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
                />
            )}
        </div>
    );
};

export default CalendarView;