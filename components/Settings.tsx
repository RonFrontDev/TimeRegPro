
import React, { useState, useEffect } from 'react';
import { Company, CompanyRates } from '../types';
import CollapsibleSubSection from './CollapsibleSubSection';

interface SettingsProps {
    rates: CompanyRates;
    onSaveRates: (newRates: CompanyRates) => void;
}

const Settings: React.FC<SettingsProps> = ({ rates, onSaveRates }) => {
    const [localRates, setLocalRates] = useState<CompanyRates>(rates);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newCompanyRate, setNewCompanyRate] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setLocalRates(rates);
    }, [rates]);

    const handleRateChange = (company: Company, value: string) => {
        const newRate = parseFloat(value) || 0;
        setLocalRates(prev => ({ ...prev, [company]: newRate }));
    };

    const handleDelete = (company: Company) => {
        setLocalRates(prev => {
            const newRates = { ...prev };
            delete newRates[company];
            return newRates;
        });
    };

    const handleAddCompany = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCompanyName.trim() === '') {
            alert('Firmanavn må ikke være tomt.');
            return;
        }
        if (localRates[newCompanyName] !== undefined) {
            alert('Et firma med dette navn findes allerede.');
            return;
        }
        const rateValue = parseFloat(newCompanyRate) || 0;
        setLocalRates(prev => ({ ...prev, [newCompanyName.trim()]: rateValue }));
        setNewCompanyName('');
        setNewCompanyRate('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveRates(localRates);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const inputClasses = "block w-full bg-base-300 border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-content-100";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <CollapsibleSubSection title="Firma Timelønninger (kr.)">
                <div className="space-y-3">
                    {Object.keys(localRates).sort().map(company => (
                        <div key={company} className="flex items-center gap-2">
                            <div className="flex-grow">
                                <label htmlFor={`rate-${company}`} className="sr-only">{company}</label>
                                <div className="relative rounded-md shadow-sm">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm text-content-200 pointer-events-none">{company}</span>
                                    <input
                                        type="number"
                                        id={`rate-${company}`}
                                        value={localRates[company] || ''}
                                        onChange={(e) => handleRateChange(company, e.target.value)}
                                        placeholder="f.eks. 150"
                                        step="0.01"
                                        min="0"
                                        className={`${inputClasses} pl-24 text-right`}
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleDelete(company)}
                                className="p-2 text-red-500 hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors"
                                aria-label={`Slet ${company}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            </CollapsibleSubSection>

            <CollapsibleSubSection title="Tilføj Nyt Firma" defaultOpen={false}>
                 <div className="space-y-3">
                    <div>
                        <label htmlFor="new-company-name" className="block text-sm font-medium text-content-200">Nyt Firmanavn</label>
                        <input
                            type="text"
                            id="new-company-name"
                            value={newCompanyName}
                            onChange={(e) => setNewCompanyName(e.target.value)}
                            placeholder="Navn på firma"
                            className={`mt-1 ${inputClasses}`}
                        />
                    </div>
                     <div>
                        <label htmlFor="new-company-rate" className="block text-sm font-medium text-content-200">Timeløn (kr.)</label>
                        <input
                            type="number"
                            id="new-company-rate"
                            value={newCompanyRate}
                            onChange={(e) => setNewCompanyRate(e.target.value)}
                            placeholder="f.eks. 150"
                            step="0.01"
                            min="0"
                            className={`mt-1 ${inputClasses}`}
                        />
                    </div>
                    <button type="button" onClick={handleAddCompany} className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                        Tilføj Firma til Liste
                    </button>
                 </div>
            </CollapsibleSubSection>

            <button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105">
                Gem Alle Timelønninger
            </button>
            {showSuccess && <p className="text-sm text-green-400 text-center mt-2">Timelønninger gemt!</p>}
        </form>
    );
};

export default Settings;
