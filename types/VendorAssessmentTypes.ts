export interface VendorAssessment {
  id: string;
  participant_name: string;
  participant_email: string;
  participant_nik?: string | null;
  vendor_name: string;
  assessment_date: string;
  
  // Checkboxes
  has_critical_thinking: boolean;
  critical_thinking_score?: string | null;
  critical_thinking_category?: string | null;
  
  has_work_endurance: boolean;
  work_endurance_score?: string | null;
  work_endurance_category?: string | null;
  
  has_growth_mindset: boolean;
  growth_mindset_score?: string | null;
  growth_mindset_category?: string | null;
  
  // File metadata
  file_name: string;
  file_original_name: string;
  file_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  
  notes?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateVendorAssessmentPayload {
  participant_name: string;
  participant_email: string;
  participant_nik?: string | null;
  vendor_name: string;
  assessment_date: string;
  has_critical_thinking: boolean;
  critical_thinking_score?: string | null;
  critical_thinking_category?: string | null;
  has_work_endurance: boolean;
  work_endurance_score?: string | null;
  work_endurance_category?: string | null;
  has_growth_mindset: boolean;
  growth_mindset_score?: string | null;
  growth_mindset_category?: string | null;
  notes?: string | null;
}
