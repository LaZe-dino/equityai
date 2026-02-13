export const APP_NAME = 'EquityAI';
export const APP_DESCRIPTION = 'AI-powered private offerings platform connecting seed-stage companies with early-stage investors.';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const OFFERING_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  'under-review': 'bg-yellow-100 text-yellow-700',
  live: 'bg-green-100 text-green-700',
  funded: 'bg-blue-100 text-blue-700',
  closed: 'bg-red-100 text-red-700',
};

export const INTEREST_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-700',
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
