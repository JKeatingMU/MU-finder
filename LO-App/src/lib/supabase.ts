import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

export type LoRating = {
  lo_id: string;
  institution: string;
  module_code: string;
  lo_text: string;
  nfq_level: number | null;
  rater: string;
  d1: number;
  d1_rationale: string;
  d2: number;
  d2_rationale: string;
  d3: number;
  d3_rationale: string;
  d4: number;
  d4_rationale: string;
  d5: number;
  d5_rationale: string;
  d6: number;
  d6_rationale: string;
  confidence: number;
};

export async function submitRating(rating: LoRating) {
  const { error } = await supabase.from('lo_ratings').insert(rating);
  if (error) throw error;
}
