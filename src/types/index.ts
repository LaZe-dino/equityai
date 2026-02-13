// TypeScript types for EquityAI

export type UserRole = 'founder' | 'investor' | 'admin';

export type OfferingType = 'equity' | 'safe' | 'convertible-note';

export type OfferingStatus = 'draft' | 'under-review' | 'live' | 'funded' | 'closed';

export type CompanyStage = 'pre-seed' | 'seed' | 'series-a';

export type InterestStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  linkedin_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  founder_id: string;
  name: string;
  description: string | null;
  sector: string;
  stage: CompanyStage;
  website: string | null;
  logo_url: string | null;
  pitch_deck_url: string | null;
  founded_year: number | null;
  team_size: number | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  founder?: Profile;
}

export interface Offering {
  id: string;
  company_id: string;
  title: string;
  description: string;
  offering_type: OfferingType;
  target_raise: number; // in cents
  minimum_investment: number; // in cents
  valuation_cap: number | null;
  equity_percentage: number | null;
  status: OfferingStatus;
  deadline: string | null;
  terms_url: string | null;
  highlights: string[];
  risks: string[];
  use_of_funds: { category: string; percentage: number }[];
  created_at: string;
  updated_at: string;
  // Joined fields
  company?: Company;
  interest_count?: number;
  total_interest_amount?: number;
}

export interface InvestorProfile {
  id: string;
  user_id: string;
  accredited: boolean;
  investment_min: number | null;
  investment_max: number | null;
  sectors_of_interest: string[];
  stages_of_interest: string[];
  portfolio_size: number;
  created_at: string;
  updated_at: string;
}

export interface Interest {
  id: string;
  investor_id: string;
  offering_id: string;
  amount: number | null;
  message: string | null;
  status: InterestStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  investor?: Profile;
  offering?: Offering;
}

export interface Document {
  id: string;
  company_id: string | null;
  offering_id: string | null;
  uploaded_by: string;
  name: string;
  file_url: string;
  file_type: 'pitch-deck' | 'financials' | 'term-sheet' | 'other';
  file_size: number | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SavedOffering {
  investor_id: string;
  offering_id: string;
  created_at: string;
  offering?: Offering;
}

// Form types
export interface SignUpFormData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface CompanyFormData {
  name: string;
  description: string;
  sector: string;
  stage: CompanyStage;
  website?: string;
  founded_year?: number;
  team_size?: number;
  location?: string;
}

export interface OfferingFormData {
  title: string;
  description: string;
  offering_type: OfferingType;
  target_raise: number;
  minimum_investment: number;
  valuation_cap?: number;
  equity_percentage?: number;
  deadline?: string;
  highlights: string[];
  risks: string[];
  use_of_funds: { category: string; percentage: number }[];
}

export interface InterestFormData {
  offering_id: string;
  amount?: number;
  message?: string;
}

// Dashboard types
export interface DashboardStats {
  total_offerings?: number;
  live_offerings?: number;
  total_interests?: number;
  total_raised?: number;
  pending_interests?: number;
  accepted_interests?: number;
  saved_count?: number;
}

// Filter/search types
export interface OfferingFilters {
  sector?: string;
  stage?: CompanyStage;
  offering_type?: OfferingType;
  min_amount?: number;
  max_amount?: number;
  status?: OfferingStatus;
  search?: string;
}

// Constants
export const SECTORS = [
  'AI / Machine Learning',
  'Fintech',
  'HealthTech',
  'SaaS',
  'E-Commerce',
  'CleanTech',
  'EdTech',
  'Cybersecurity',
  'Biotech',
  'Real Estate Tech',
  'Consumer',
  'Enterprise',
  'Hardware',
  'Other',
] as const;

export const STAGES: { value: CompanyStage; label: string }[] = [
  { value: 'pre-seed', label: 'Pre-Seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series-a', label: 'Series A' },
];

export const OFFERING_TYPES: { value: OfferingType; label: string }[] = [
  { value: 'equity', label: 'Equity' },
  { value: 'safe', label: 'SAFE' },
  { value: 'convertible-note', label: 'Convertible Note' },
];
