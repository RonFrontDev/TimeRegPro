
import { Company } from './types';

export const COMPANIES: Company[] = [
    Company.Kraftvrk,
    Company.FormAndFitness,
    Company.ArteSuave,
];

export const COMPANY_COLORS: { [key in Company]: string } = {
    [Company.Kraftvrk]: '#8b5cf6', // A vibrant purple
    [Company.FormAndFitness]: '#ec4899', // A strong pink
    [Company.ArteSuave]: '#3b82f6', // A solid blue
};

export const VIDEO_POST_COLOR = '#059669'; // Emerald green
export const VIDEO_POST_EARNING = 320;
