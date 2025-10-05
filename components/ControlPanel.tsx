import React, { useState } from 'react';
import Settings from './Settings';
import ExportControls from './ExportControls';
import SalaryCalculator from './SalaryCalculator';
import { Company, CompanyRates } from '../types';

interface ControlPanelProps {
    rates: CompanyRates;
    onSaveRates: (newRates: CompanyRates) => void;
    onExport: () => void;
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    grossEarningsByCompany: { [key: string]: number };
    companyNames: string[];
}

type ActiveControlTab = 'calculator' | 'export' | 'settings';

const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const [activeTab, setActiveTab] = useState<ActiveControlTab>('settings');

    // FIX: Use React.ReactElement instead of JSX.Element to resolve "Cannot find namespace 'JSX'" error.
    const tabs: { id: ActiveControlTab; label: string; icon: React.ReactElement }[] = [
        { 
            id: 'calculator', 
            label: 'Lønberegner',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M12 8a1 1 0 00-1 1v.01M12 7a1 1 0 00-1 1v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
        { 
            id: 'export', 
            label: 'Eksporter',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        },
        { 
            id: 'settings', 
            label: 'Indstillinger',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'settings':
                return <Settings rates={props.rates} onSaveRates={props.onSaveRates} />;
            case 'export':
                return <ExportControls {...props} />;
            case 'calculator':
                return <SalaryCalculator grossEarningsByCompany={props.grossEarningsByCompany} companyNames={props.companyNames} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-base-200 rounded-xl shadow-lg">
            <div className="flex border-b border-base-300 p-1 space-x-1">
                 {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-brand-primary text-tab-active-text shadow' : 'hover:bg-base-100/50 text-content-200'}`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
            <div className="p-6 md:p-8">
                {renderContent()}
            </div>
        </div>
    );
};

export default ControlPanel;