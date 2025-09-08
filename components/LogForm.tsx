import React, { useState, useEffect } from 'react';
import { type WorkLog, Company, CompanyRates } from '../types';
import { COMPANIES } from '../constants';

interface LogFormProps {
    onAddLog: (log: Omit<WorkLog, 'id'>) => void;
    companyRates: CompanyRates;
}

const LogForm: React.FC<LogFormProps> = ({ onAddLog, companyRates }) => {
    const [company, setCompany] = useState<Company>(COMPANIES[0]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [hours, setHours] = useState('');
    const [rate, setRate] = useState('');

    useEffect(() => {
        // Auto-fill rate when company changes
        const savedRate = companyRates[company];
        if (savedRate !== undefined) {
            setRate(savedRate.toString());
        } else {
            setRate('');
        }
    }, [company, companyRates]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const hoursNum = parseFloat(hours);
        const rateNum = parseFloat(rate);

        if (hoursNum > 0 && rateNum >= 0) {
            onAddLog({ company, date, hours: hoursNum, rate: rateNum });
            setHours('');
            // Keep rate pre-filled for next entry
        } else {
            alert('Indtast venligst gyldige timer og en gyldig timeløn.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="company" className="block text-sm font-medium text-content-200">Firma</label>
                <select
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value as Company)}
                    className="mt-1 block w-full bg-base-300 border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-content-100"
                >
                    {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-content-200">Dato</label>
                <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="mt-1 block w-full bg-base-300 border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-content-100"
                />
            </div>
            <div>
                <label htmlFor="hours" className="block text-sm font-medium text-content-200">Arbejdstimer</label>
                <input
                    type="number"
                    id="hours"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="f.eks. 8"
                    step="0.01"
                    min="0"
                    required
                    className="mt-1 block w-full bg-base-300 border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-content-100"
                />
            </div>
            <div>
                <label htmlFor="rate" className="block text-sm font-medium text-content-200">Timeløn (DKK)</label>
                <input
                    type="number"
                    id="rate"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="f.eks. 160.50"
                    step="0.01"
                    min="0"
                    required
                    className="mt-1 block w-full bg-base-300 border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-content-100"
                />
            </div>
            <button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105">
                Tilføj Post
            </button>
        </form>
    );
};

export default LogForm;