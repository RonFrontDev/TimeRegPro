// Define shared TypeScript types for the application.

export type Company = string;

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
    [companyName: string]: number;
};