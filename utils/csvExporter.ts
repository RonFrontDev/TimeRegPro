import { type WorkLog } from '../types';

export const exportToCSV = (data: WorkLog[], filename: string) => {
    if (data.length === 0) {
        alert("Ingen data at eksportere.");
        return;
    }

    const headers = ['ID', 'Firma', 'Dato', 'Timer', 'Timeløn', 'Indtjening'];
    const rows = data.map(log => [
        log.id,
        log.company,
        log.date,
        log.hours,
        log.rate,
        (log.hours * log.rate).toFixed(2)
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    
    link.click();
    
    document.body.removeChild(link);
};
