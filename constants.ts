import { Company } from './types';

const PREDEFINED_COLORS: { [key: string]: string } = {
    'Kraftvrk': '#8b5cf6', // A vibrant purple
    'Form & Fitness': '#ec4899', // A strong pink
    'Arte Suave': '#3b82f6', // A solid blue
};

// A palette for dynamically added companies
const PALETTE = [ '#16a34a', '#ca8a04', '#dc2626', '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4f46e5' ];

// Simple hash function to get a consistent color from the palette
const stringToHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

export const getCompanyColor = (company: string): string => {
    if (PREDEFINED_COLORS[company]) {
        return PREDEFINED_COLORS[company];
    }
    const hash = stringToHash(company);
    return PALETTE[hash % PALETTE.length];
};


export const VIDEO_POST_COLOR = '#059669'; // Emerald green
export const VIDEO_POST_EARNING = 320;