// BUSINESS UNIT
import { string } from "zod";

export type BURequest = {
  id: string;
  bu_code: string;
  bu_name: string;
  is_active: boolean;
  created_by: string;
  created_date: Date;
};

// CRITERIA
export type CriteriaRequest = {
  criteria_name: string;
  minimum_score: number;
  maximum_score: number;
  description: string;
  color_id: number;
  is_active: boolean;
};

export type Criteria = CriteriaRequest & {
  id: string;
  category_fk: string;
  created_by: string;
  created_date: Date;
  updated_by: string;
  updated_date: Date;
};

export type CriteriaGroup = {
  id: string;
  value_code: string;
  value_name: string;
  created_by: string;
  created_date: Date;
  value_group: string;
};

export type StandardizedPayload = {
  id: string;
  value_id: string;
  raw_score: number;
  standardized_score: number;
};

export // FUNCTION MENU
type FunctionMenuRequest = {
  id: string;
  fm_code: string;
  fm_name: string;
  is_active: boolean;
  created_by: string;
  created_date: Date;
};

export type TermsPPRequest = {
  name: string;
  updated_by: string;
  updated_date: Date;
};

export type BriefRequest = {
  short_brief_name: string;
  updated_by: string;
  updated_date: Date;
};

// SERIES
export type SeriesRequest = {
  id: string;
  series_name: string;
  is_active: boolean;
  created_by: string;
  created_date: Date;
};

export type SeriesHeader = {
  series_id: string;
  series_name: string;
  series_code: string;
  category_id: string;
  category_name: string;
  category_code: string;
};

export type SeriesDataCreate = SeriesHeader & {
  questions_id: string[];
};

// QUESTION
export type Answer = {
  text?: string;
  image?: File;
  point: number;
};

export type AnswerResponse = {
  text?: string;
  image_url?: string;
  point: number;
};

export type QuestionRequest = {
  id: string;
  q_input_text: string;
  q_input_image_url: string;
  answer_type: string;
  answer_choice_a_text?: string;
  answer_choice_a_image_url?: string;
  answer_choice_b_text?: string;
  answer_choice_b_image_url?: string;
  answer_choice_c_text?: string;
  answer_choice_c_image_url?: string;
  answer_choice_d_text?: string;
  answer_choice_d_image_url?: string;
  answer_choice_e_text?: string;
  answer_choice_e_image_url?: string;
  answer_choice_f_text?: string;
  answer_choice_f_image_url?: string;
  answer_choice_g_text?: string;
  answer_choice_g_image_url?: string;
  created_by: string;
  created_date: Date;
  updated_by?: string;
  updated_date?: Date;
  key_answer_point_a: number;
  key_answer_point_b: number;
  key_answer_point_c?: number;
  key_answer_point_d?: number;
  key_answer_point_e?: number;
  key_answer_point_f?: number;
  key_answer_point_g?: number;
  question_category: string;
  question_code: string;
};

export type QuestionFields = {
  q_input_text?: string;
  q_input_image?: File;
  answer_type?: string;
  answer?: Answer[];
};

export type QuestionResult = {
  id: string;
  answer_type: string;
  created_by: string;
  created_date: Date;
  updated_by: string;
  updated_date: Date;
  total_points: number;
  category_id?: string;
  question: {
    seq?: string;
    layout_type?: string;
    input_text: string;
    input_image_url: string;
  };
  answers: Array<{ text?: string; image_url?: string; point: number }>;
};

// Category
export type CategoryRequest = {
  category_name: string;
  category_code: string;
  criteria_id: string;
  is_active: boolean;
};

export type CategoryUpdateRequest = {
  category_name: string;
  criteria_id: string;
  is_active: boolean;
};

// SubTest
export type SubTestRequest = {
  subtest_name: string;
  subtest_code: string;
  subtest_duration: string;
  category_id: string;
  criteria_id: string;
  is_active: boolean;
  series: {
    series_id: string;
  }[];
};

export type SubTestHeaderRequest = {
  id?: string;
  subtest_name?: string;
  subtest_code?: string;
  subtest_duration?: string;
  criteria_id?: string;
  is_active?: boolean;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;
};

export type SubTestDetailRequest = {
  series_id: string;
};

// Test
export type TestHeaderRequest = {
  id?: string;
  test_name?: string;
  test_code?: string;
  category_id?: number;
  summary_type?: string;
  summary_formula?: string;
  description?: string;
  intro_desc?: string;
  is_active?: boolean;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;
  subtests?: {
    subtest_id: string;
  }[];
};

export type TestHeaderUpdateRequest = {
  test_name: string;
  test_code: string;
  is_active: boolean;
  updated_by: string;
  updated_at: Date;
};

export type TestDetailRequest = {
  subtest_id: string;
};

// Group Test
export type GroupTestRequest = {
  grouptest_name: string;
  grouptest_code: string;
  is_active: boolean;
  subtests: {
    subtest_id: string;
  }[];
};

export type GroupTestHeaderRequest = {
  id: string;
  grouptest_name: string;
  grouptest_code: string;
  created_by: string;
  created_at: Date;
};

export type GroupTestDetailRequest = {
  subtest_id: string;
};

export type DataEmpDarwin = {
  employee_id: string;
  full_name: string;
  date_of_joining: string;
  group_company: string;
  contribution_level: string;
  work_area_code: string;
  office_area: string;
  designation_code: string;
  designation_name: string;
  job_level: string;
  company_email_id: string;
};

export type XLSAssessee = {
  NIK: string;
  Email: string;
  Name: string;
};
