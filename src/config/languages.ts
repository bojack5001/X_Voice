import { LanguageCode } from '../types';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  region: string;
  activeInProduction: boolean;
  statusNote: string;
}

// Initial supported languages per Task 002: Tamil, Telugu, English.
// Hindi is kept off active production selectors for now.
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'Tamil',
    label: 'Tamil',
    nativeLabel: 'தமிழ்',
    region: 'Tamil Nadu (Chennai, Madurai, Coimbatore)',
    activeInProduction: true,
    statusNote: 'Simulated Local Voice • Evaluation Pending'
  },
  {
    code: 'Telugu',
    label: 'Telugu',
    nativeLabel: 'తెలుగు',
    region: 'Telangana & Andhra Pradesh (Hyderabad, Vijayawada)',
    activeInProduction: true,
    statusNote: 'Simulated Local Voice • Evaluation Pending'
  },
  {
    code: 'English',
    label: 'English',
    nativeLabel: 'English',
    region: 'Indian English (Pan-India Commuters & Enterprise)',
    activeInProduction: true,
    statusNote: 'Simulated Local Voice • Evaluation Pending'
  }
];

export const ACTIVE_LANGUAGE_CODES: LanguageCode[] = SUPPORTED_LANGUAGES
  .filter(l => l.activeInProduction)
  .map(l => l.code);

