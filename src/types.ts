export type StrengthCategory =
  | 'Creative'
  | 'Humanities'
  | 'Language'
  | 'Scientific'
  | 'Quantitative'
  | 'Computing'
  | 'Social'
  | 'Business';

export type Faculty = 'arts' | 'science' | 'social';

export interface Question {
  id: number;
  text: string;
  category: StrengthCategory;
}

export interface Course {
  id: string;
  code: string;
  subCode?: string;
  title: string;
  description: string;
  primaryCategory: StrengthCategory;
  secondaryCategory?: StrengthCategory;
  faculty: Faculty;
  points?: string;
  url?: string;
  fullSummary?: string;
  aiSummary?: boolean;
}

export interface UserResult {
  scores: Record<StrengthCategory, number>;
}
