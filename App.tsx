import React, { useMemo, useState, useEffect, createContext, useContext } from 'react';
import { type WorkLog, type CompanyRates, type VideoPost, Company } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import LogList from './components/LogList';
import Summary from './components/Summary';
import ExportControls from './components/ExportControls';
import { exportToCSV } from './utils/csvExporter';
import Settings from './components/Settings';
import CalendarView from './components/CalendarView';

// THEME CONTEXT
type Theme = 'light' | 'dark';
interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};

// Placed outside the component to avoid re-declaration on each render
const getMonthDateRange = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    return {
        start: formatDate(firstDay),
        end: formatDate(lastDay),
    };
};

const AppContent: React.FC = () => {
    const [workLogs, setWorkLogs] = useLocalStorage<WorkLog[]>('workLogs', []);
    const [videoPosts, setVideoPosts] = useLocalStorage<VideoPost[]>('videoPosts', []);
    const [companyRates, setCompanyRates] = useLocalStorage<CompanyRates>('companyRates', {
        [Company.Kraftvrk]: 160,
        [Company.FormAndFitness]: 225,
        [Company.ArteSuave]: 300,
    });
    const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('calendar');

    // Calendar date state is lifted up to sync with export dates
    const [currentDate, setCurrentDate] = useState(new Date());

    const [startDate, setStartDate] = useState<string>(() => getMonthDateRange(currentDate).start);
    const [endDate, setEndDate] = useState<string>(() => getMonthDateRange(currentDate).end);

    // Effect to sync export dates when calendar month changes
    useEffect(() => {
        const { start, end } = getMonthDateRange(currentDate);
        setStartDate(start);
        setEndDate(end);
    }, [currentDate]);

    const sortedLogs = useMemo(() => {
        return [...workLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [workLogs]);

    const handleAddLog = (log: Omit<WorkLog, 'id'>) => {
        const newLog: WorkLog = {
            id: new Date().getTime().toString() + Math.random().toString(),
            ...log
        };
        setWorkLogs(prevLogs => [...prevLogs, newLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const handleDeleteLog = (id: string) => {
        // No confirmation needed if it's from the modal, as it's less final.
        setWorkLogs(prevLogs => prevLogs.filter(log => log.id !== id));
    };
    
    const handleDeleteLogWithConfirm = (id: string) => {
        if (window.confirm('Er du sikker på, at du vil slette denne post?')) {
            handleDeleteLog(id);
        }
    }

    const handleSaveVideoPost = (date: string, company: Company) => {
        setVideoPosts(prev => {
            const existingPost = prev.find(p => p.date === date);
            if (existingPost) {
                // Update existing post's company
                return prev.map(p => p.date === date ? { ...p, company } : p);
            } else {
                // Add new post
                const newPost: VideoPost = {
                    id: `video-${new Date().getTime()}`,
                    date,
                    company,
                };
                return [...prev, newPost];
            }
        });
    };
    
    const handleDeleteVideoPost = (date: string) => {
        setVideoPosts(prev => prev.filter(p => p.date !== date));
    };

    const handleSaveRates = (newRates: CompanyRates) => {
        setCompanyRates(newRates);
    };

    const handleExport = () => {
        const filteredLogs = sortedLogs.filter(log => {
            if (startDate && log.date < startDate) return false;
            if (endDate && log.date > endDate) return false;
            return true;
        });
        exportToCSV(filteredLogs, `work-logs-${new Date().toISOString().split('T')[0]}.csv`);
    };
    
    return (
        <div className="min-h-screen">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-8">
                        <Settings rates={companyRates} onSaveRates={handleSaveRates} />
                        <ExportControls
                            onExport={handleExport}
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={setStartDate}
                            onEndDateChange={setEndDate}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <Summary logs={sortedLogs} videoPosts={videoPosts} />

                        {/* Tabs for List/Calendar view */}
                        <div className="flex bg-base-300 rounded-lg p-1 space-x-1">
                            <button
                                className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-brand-primary text-tab-active-text shadow' : 'hover:bg-base-100/50'}`}
                                onClick={() => setActiveTab('list')}>
                                Liste Oversigt
                            </button>
                            <button
                                className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'calendar' ? 'bg-brand-primary text-tab-active-text shadow' : 'hover:bg-base-100/50'}`}
                                onClick={() => setActiveTab('calendar')}>
                                Kalender Oversigt
                            </button>
                        </div>
                        
                        {activeTab === 'list' ? (
                            <LogList logs={sortedLogs} onDeleteLog={handleDeleteLogWithConfirm} />
                        ) : (
                            <CalendarView 
                                logs={sortedLogs}
                                videoPosts={videoPosts}
                                companyRates={companyRates}
                                onAddLog={handleAddLog}
                                onDeleteLog={handleDeleteLog}
                                onSaveVideoPost={handleSaveVideoPost}
                                onDeleteVideoPost={handleDeleteVideoPost}
                                currentDate={currentDate}
                                onCurrentDateChange={setCurrentDate}
                             />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const App: React.FC = () => {
    const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <AppContent />
        </ThemeContext.Provider>
    );
};


export default App;