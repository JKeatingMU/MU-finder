export type StrengthCategory = 'Analytical' | 'Creative' | 'Social' | 'Practical' | 'Leadership';

export interface Question {
  id: number;
  text: string;
  category: StrengthCategory;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  primaryCategory: StrengthCategory;
  secondaryCategory?: StrengthCategory;
  points?: number; // Approximate CAO points for context
  url?: string; // Link to MU course page
  careers?: string[];
  skills?: string[];
  relatedSubjects?: string[];
}

export interface UserResult {
  scores: Record<StrengthCategory, number>;
}
