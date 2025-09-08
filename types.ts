// Define shared TypeScript types for the application.

export enum Company {
    Kraftvrk = 'Kraftvrk',
    FormAndFitness = 'Form & Fitness',
    ArteSuave = 'Arte Suave',
}

export interface WorkLog {
    id: string;
    company: Company;
    date: string; // YYYY-MM-DD format
    hours: number;
    rate: number;
}

export interface VideoPost {
    id: string;
    date: string; // YYYY-MM-DD format
    company: Company;
}

export type CompanyRates = {
    [key in Company]?: number;
};