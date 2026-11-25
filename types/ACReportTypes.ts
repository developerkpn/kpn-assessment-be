export type ACCompetencyCode = "S" | "I" | "G" | "A" | "P" | "MP" | "DM" | "DO" | "RB";

export type ACCluster = "SIGAP" | "LEADERSHIP";

export type ACRecommendationType = "Suitable" | "Need Development" | "Not Recommended";

export type ACReportStatus = "Draft" | "Completed";

export type ACTmpSyncStatus = "Pending" | "Synced" | "Failed";

export interface ACCompetencyMasterItem {
  code: ACCompetencyCode;
  no: number;
  cluster: ACCluster;
  groupTitle: string;
  name: string;
  definition: string;
  pdfDefinition?: string;
  keyBehaviors: Record<1 | 2 | 3 | 4, string>;
  defaultTraining: string;
  coachingOptions: string[];
  ojtOptions: string[];
}

export interface ACCompetencyInput {
  competency_code: ACCompetencyCode;
  actual_level: number;
  uraian_kompetensi?: string;
  uraian_gap?: string;
  training_recommendation?: string;
  coaching_plan?: string;
  ojt_plan?: string;
}

export interface ACCompetencyEvaluated extends ACCompetencyInput {
  no: number;
  competency_name: string;
  cluster: ACCluster;
  group_title: string;
  definition: string;
  key_behavior: string;
  required_level: number;
  gap: number;
  is_pass: boolean;
  uraian_kompetensi: string;
  uraian_gap: string;
  training_recommendation: string;
  coaching_plan: string;
  ojt_plan: string;
}

export interface ACReportPayload {
  assessee_nik: string;
  assessee_name: string;
  gender?: string;
  age?: string;
  business_unit?: string;
  department?: string;
  work_location?: string;
  join_date?: string | null;
  review_date?: string | null;
  assessor_name?: string;
  current_position_grade?: string;
  proposed_position?: string;
  target_grade: string;
  strength?: string;
  area_of_development?: string;
  recommendation_type?: ACRecommendationType;
  development_duration?: string;
  evaluation_grade?: string;
  sign_place_date?: string;
  status?: ACReportStatus;
  competencies: ACCompetencyInput[];
}

export interface ACReportDetail extends Omit<ACReportPayload, "competencies"> {
  id: string;
  recommendation_type: ACRecommendationType;
  auto_recommendation_type: ACRecommendationType;
  recommendation_rule_info: string;
  pass_count: number;
  sigap_gap_count: number;
  leadership_gap_count: number;
  status: ACReportStatus;
  pdf_path?: string | null;
  tmp_sync_status: ACTmpSyncStatus;
  tmp_synced_at?: string | null;
  tmp_external_id?: string | null;
  tmp_error_message?: string | null;
  created_at?: string;
  updated_at?: string | null;
  competencies: ACCompetencyEvaluated[];
}
