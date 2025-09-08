
import React, { useState, useEffect } from 'react';
import { Company, CompanyRates } from '../types';
import { COMPANIES } from '../constants';

interface SettingsProps {
    rates: CompanyRates;
    onSaveRates: (newRates: CompanyRates) => void;
}

const Settings: React.FC<SettingsProps> = ({ rates, onSaveRates }) => {
    const [currentRates, setCurrentRates] = useState<CompanyRates>(rates);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setCurrentRates(rates);
    }, [rates]);

    const handleChange = (company: Company, value: string) => {
        const newRate = parseFloat(value) || 0;
        setCurrentRates(prev => ({ ...prev, [company]: newRate }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveRates(currentRates);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    return (
        <div className="bg-base-200 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-content-100 mb-4">Indstillinger</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <h4 className="text-md font-semibold text-content-100">Firma Timelønninger (kr.)</h4>
                {COMPANIES.map(company => (
                    <div key={company}>
                        <label htmlFor={`rate-${company}`} className="block text-sm font-medium text-content-200">{company}</label>
                        <input
                            type="number"
                            id={`rate-${company}`}
                            value={currentRates[company] || ''}
                            onChange={(e) => handleChange(company, e.target.value)}
                            placeholder="f.eks. 150"
                            step="0.01"
                            min="0"
                            className="mt-1 block w-full bg-base-300 border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-content-100"
                        />
                    </div>
                ))}
                <button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105">
                    Gem Timelønninger
                </button>
                 {showSuccess && <p className="text-sm text-green-400 text-center mt-2">Timelønninger gemt!</p>}
            </form>
        </div>
    );
};

export default Settings;
