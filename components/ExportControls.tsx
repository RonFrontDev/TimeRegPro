
import React from 'react';

interface ExportControlsProps {
    onExport: () => void;
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
}

const ExportControls: React.FC<ExportControlsProps> = ({ onExport, startDate, endDate, onStartDateChange, onEndDateChange }) => {
    return (
        <div className="bg-base-200 p-6 rounded-xl shadow-lg space-y-4">
            <h3 className="text-xl font-bold text-content-100">Eksporter Data</h3>
            <p className="text-sm text-content-200">
                Vælg et datointerval for at filtrere dine data, før du eksporterer. Hvis intet interval vælges, eksporteres alle data.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-content-200">Startdato</label>
                    <input
                        type="date"
                        id="start-date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="mt-1 block w-full bg-base-300 border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-content-100"
                    />
                </div>
                <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-content-200">Slutdato</label>
                    <input
                        type="date"
                        id="end-date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="mt-1 block w-full bg-base-300 border border-base-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-content-100"
                    />
                </div>
            </div>

            <button
                onClick={onExport}
                className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download som CSV
            </button>
            <div className="!mt-6 pt-4 border-t border-base-300">
                <h4 className="font-semibold text-content-100 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Note om Automatisering
                </h4>
                <p className="text-xs text-content-200 mt-2">
                    Automatisk månedlig upload til Google Sheets kræver en sikker backend-server til at håndtere godkendelse og planlægning. Denne funktion er ikke inkluderet i denne klient-side applikation for at beskytte din kontosikkerhed.
                </p>
            </div>
        </div>
    );
};

export default ExportControls;
