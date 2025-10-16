
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
import EarningsChart from './components/EarningsChart';
import SalaryCalculator from './components/SalaryCalculator';
import ControlPanel from './components/ControlPanel';
import { VIDEO_POST_EARNING } from './constants';
import {addData} from "./firebase";
import CollapsibleSection from './components/CollapsibleSection';

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
        'Kraftvrk': 160,
        'Form & Fitness': 225,
        'Arte Suave': 300,
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

    const companyNames = useMemo(() => Object.keys(companyRates).sort(), [companyRates]);
    
    const filteredEarningsByCompany = useMemo(() => {
        const earnings: { [key: string]: number } = {};

        const logsInPeriod = workLogs.filter(log => {
            if (startDate && log.date < startDate) return false;
            if (endDate && log.date > endDate) return false;
            return true;
        });

        const videoPostsInPeriod = videoPosts.filter(post => {
            if (startDate && post.date < startDate) return false;
            if (endDate && post.date > endDate) return false;
            return true;
        });

        for (const log of logsInPeriod) {
            const currentEarning = earnings[log.company] || 0;
            earnings[log.company] = currentEarning + (log.hours * log.rate);
        }

        for (const post of videoPostsInPeriod) {
            const currentEarning = earnings[post.company] || 0;
            earnings[post.company] = currentEarning + VIDEO_POST_EARNING;
        }

        return earnings;
    }, [workLogs, videoPosts, startDate, endDate]);


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
        const oldCompanies = Object.keys(companyRates);
        const newCompanies = Object.keys(newRates);
        const deletedCompanies = oldCompanies.filter(c => !newCompanies.includes(c));

        if (deletedCompanies.length > 0) {
            const confirmMessage = `Er du sikker på, du vil slette ${deletedCompanies.join(', ')}? Alle tilknyttede arbejds- og videoposter vil også blive slettet permanent. Denne handling kan ikke fortrydes.`;
            if (!window.confirm(confirmMessage)) {
                return; // Abort if user cancels
            }
            // Filter logs and posts to remove data for deleted companies
            setWorkLogs(prev => prev.filter(log => !deletedCompanies.includes(log.company)));
            setVideoPosts(prev => prev.filter(post => !deletedCompanies.includes(post.company)));
        }
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
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Column - Controls */}
                    <div className="lg:col-span-2">
                         <ControlPanel
                            rates={companyRates}
                            onSaveRates={handleSaveRates}
                            onExport={handleExport}
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={setStartDate}
                            onEndDateChange={setEndDate}
                            grossEarningsByCompany={filteredEarningsByCompany}
                            companyNames={companyNames}
                        />
                    </div>

                    {/* Right Column - Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        <CollapsibleSection title="Oversigt">
                            <Summary logs={sortedLogs} videoPosts={videoPosts} companyNames={companyNames} />
                        </CollapsibleSection>

                        <CollapsibleSection title="Indtjening Over Tid">
                             <EarningsChart logs={sortedLogs} videoPosts={videoPosts} />
                        </CollapsibleSection>
                        
                        <CollapsibleSection title="Detaljeret Oversigt">
                            <div className="flex bg-base-300 rounded-lg p-1 space-x-1 mb-6">
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
                                    companyNames={companyNames}
                                 />
                            )}
                        </CollapsibleSection>
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
{/* FIX: Corrected typo in closing tag from Theme-Context to ThemeContext */}
        </ThemeContext.Provider>
    );
};


export default App;
