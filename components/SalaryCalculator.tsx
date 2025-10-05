import React, { useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Company, CompanyRates } from '../types';

interface SalaryCalculatorProps {
    grossEarningsByCompany: { [key: string]: number };
    companyNames: string[];
}

type CompanyTaxSettings = {
    amBidragPercent: string;
    aTaxPercent: string;
};

const SalaryCalculator: React.FC<SalaryCalculatorProps> = ({ grossEarningsByCompany, companyNames }) => {
    const [deduction, setDeduction] = useLocalStorage<string>('salaryCalcDeduction', '0');
    const [primaryCompany, setPrimaryCompany] = useLocalStorage<string>('salaryCalcPrimaryCompany', companyNames[0] || '');
    const [companySettings, setCompanySettings] = useLocalStorage<{ [key: string]: CompanyTaxSettings }>(
        'salaryCalcCompanySettings',
        {}
    );

    useEffect(() => {
        // Sync companySettings with the master list of companies from props
        setCompanySettings(prevSettings => {
            const newSettings: { [key: string]: CompanyTaxSettings } = {};
            let settingsChanged = false;

            // Ensure all current companies exist in settings
            companyNames.forEach(company => {
                if (prevSettings[company]) {
                    newSettings[company] = prevSettings[company];
                } else {
                    newSettings[company] = { amBidragPercent: '8', aTaxPercent: '37' };
                    settingsChanged = true;
                }
            });
            
            // Check if any settings were removed (company deleted)
            if (Object.keys(prevSettings).length !== Object.keys(newSettings).length) {
                settingsChanged = true;
            }

            // If the primary company was deleted, reset it to the first available company
            if (companyNames.length > 0 && !companyNames.includes(primaryCompany)) {
                setPrimaryCompany(companyNames[0]);
            } else if (companyNames.length === 0) {
                setPrimaryCompany('');
            }

            return settingsChanged ? newSettings : prevSettings;
        });
    }, [companyNames, setCompanySettings, primaryCompany, setPrimaryCompany]);


    const { totalGross, totalAmBidrag, totalATax, totalNet } = useMemo(() => {
        let totalGross = 0;
        let totalAmBidrag = 0;
        let totalATax = 0;

        const deductionNum = parseFloat(deduction) || 0;

        for (const company of Object.keys(grossEarningsByCompany)) {
            const companyKey = company as Company;
            const grossForCompany = grossEarningsByCompany[companyKey] || 0;
            
            if (grossForCompany === 0) continue;
            
            totalGross += grossForCompany;
            
            const settings = companySettings[companyKey] || { amBidragPercent: '8', aTaxPercent: '37' };
            const amBidragPercentNum = parseFloat(settings.amBidragPercent) || 0;
            const aTaxPercentNum = parseFloat(settings.aTaxPercent) || 0;

            const amBidragForCompany = grossForCompany * (amBidragPercentNum / 100);
            totalAmBidrag += amBidragForCompany;
            
            const deductionForCompany = (companyKey === primaryCompany) ? deductionNum : 0;
            
            const taxableIncomeBase = grossForCompany - amBidragForCompany - deductionForCompany;
            const taxableIncomeForCompany = Math.max(0, taxableIncomeBase);
            
            const aTaxForCompany = taxableIncomeForCompany * (aTaxPercentNum / 100);
            totalATax += aTaxForCompany;
        }

        const totalNet = totalGross - totalAmBidrag - totalATax;

        return { totalGross, totalAmBidrag, totalATax, totalNet };
    }, [grossEarningsByCompany, deduction, primaryCompany, companySettings]);

    const handleSettingChange = (company: Company, field: keyof CompanyTaxSettings, value: string) => {
        setCompanySettings(prev => ({
            ...prev,
            [company]: {
                ...(prev[company] || { amBidragPercent: '8', aTaxPercent: '37' }),
                [field]: value
            }
        }));
    };

    const inputClasses = "block w-full bg-base-300 border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-content-100";
    const labelClasses = "block text-sm font-medium text-content-200";

    return (
        <div className="space-y-6">
            <div>
                 <h3 className="text-xl font-bold text-content-100">Lønberegner</h3>
                <p className="text-xs text-content-200 mt-1">Beregner nettoindkomst for det valgte datointerval med individuelle firma-indstillinger.</p>
            </div>

            {/* General Settings */}
            <div className="space-y-4 p-4 bg-base-100 rounded-lg">
                <div>
                    <label htmlFor="deduction" className={labelClasses}>Månedligt Fradrag (kr.)</label>
                    <input type="number" id="deduction" value={deduction} onChange={(e) => setDeduction(e.target.value)} className={`mt-1 ${inputClasses}`} placeholder="f.eks. 0" />
                </div>
                <div>
                    <label className={labelClasses}>Hovedkort (anvend fradrag)</label>
                    <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-4">
                        {companyNames.map(company => (
                            <label key={company} className="flex items-center space-x-2 text-sm">
                                <input
                                    type="radio"
                                    name="primary-company"
                                    value={company}
                                    checked={primaryCompany === company}
                                    onChange={() => setPrimaryCompany(company)}
                                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-base-300"
                                />
                                <span>{company}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Per-Company Settings */}
            <div className="space-y-4">
                 {companyNames.map(company => (
                    <div key={company} className="p-4 border border-base-300 rounded-lg">
                        <h4 className="font-semibold text-content-100 mb-2">{company}</h4>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor={`am-bidrag-${company}`} className={labelClasses}>AM-bidrag (%)</label>
                                <input type="number" id={`am-bidrag-${company}`} value={companySettings[company]?.amBidragPercent || ''} onChange={(e) => handleSettingChange(company, 'amBidragPercent', e.target.value)} className={`mt-1 ${inputClasses}`} placeholder="8" />
                            </div>
                            <div>
                                <label htmlFor={`a-tax-${company}`} className={labelClasses}>A-skat (%)</label>
                                <input type="number" id={`a-tax-${company}`} value={companySettings[company]?.aTaxPercent || ''} onChange={(e) => handleSettingChange(company, 'aTaxPercent', e.target.value)} className={`mt-1 ${inputClasses}`} placeholder="37" />
                            </div>
                        </div>
                    </div>
                 ))}
            </div>

            {/* Calculation */}
            <div className="space-y-2 pt-4 border-t border-base-300">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-content-200">Bruttoindkomst (valgt periode)</span>
                    <span className="font-semibold text-content-100">kr. {totalGross.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-content-200">Samlet AM-bidrag</span>
                    <span className="font-semibold text-red-500">- kr. {totalAmBidrag.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-content-200">Samlet A-skat</span>
                    <span className="font-semibold text-red-500">- kr. {totalATax.toFixed(2)}</span>
                </div>
                <div className="!mt-4 pt-4 border-t border-base-300 flex justify-between items-center">
                    <span className="text-lg font-bold text-content-100">Netto udbetalt</span>
                    <span className="text-lg font-bold text-green-500">kr. {totalNet.toFixed(2)}</span>
                </div>
            </div>
             <div className="!mt-6 pt-4 border-t border-base-300">
                <h4 className="font-semibold text-content-100 flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Disclaimer
                </h4>
                <p className="text-xs text-content-200 mt-2">
                    Dette er en simplificeret beregning. Andre faktorer som f.eks. ATP, pension og specifikke skatteforhold kan påvirke det endelige beløb.
                </p>
            </div>
        </div>
    );
};

export default SalaryCalculator;