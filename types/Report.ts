export interface AssessmentReportPDFProps {
  data: {
    intro: Array<{
      category_code: string;
      category_name: string;
      summary_type: string;
      summary_formula?: string;
      summary_view?: string;
      tests?: Array<{
        id: string;
        name: string;
        description: string;
        result?: {
          test_point?: number;
          norm: Array<{
            id: string;
            criteria_name: string;
            minimum_score: number;
            maximum_score: number;
          }>;
        };
      }>;

      subtests?: Array<{
        id: string;
        name: string;
        description: string;
        result: {
          type?: string;
        };
      }>;
    }>;
    detail: Array<{
      category_id: number;
      category_name: string;
      category_code: string;
      test_code?: string;
      test_name: string;
      taken_at: string;
      description?: string;
      summary_type: string;
      summary_view?: string;
      summary_formula: string;
      norm?: Array<{ criteria_name: string; minimum_score: number; maximum_score: number }>;
      result: {
        test_point: number;
        criteria: string;
        description: string;
      };
      subtests: Array<{
        subtest_id: string;
        subtest_name: string;
        subtest_code: string;
        description: string;
        result: {
          subtest_point: number;
          subtest_criteria: string;
          criteria_color: string;
          // category: [];
          categories: Array<{
            category_id: number;
            category_name: string;
            category_code: string;
            category_point: number;
            description: string;
          }>;
        };
      }>;
    }>;
    log: Array<{
      id: string;
      log: string;
      created_at: string;
    }>;
    proctoring: {
      web_cam: Array<{ key: string; lastModified: string }>;
      screen: Array<{ key: string; lastModified: string }>;
    };
    proctoringImages: {
      webcam: string[]; // data URL ("data:image/png;base64,…")
      screen: string[];
    };

    guide?: { content?: string };
    batch?: { name: string; code: string };
    profile: {
      assessee_name: string;
      assessee_age: string;
      assessee_gender: string;
      work_place: string;
    };
  };
  charts?: Record<string, string>;
  cover: string;
}

export type ReportItem = {
  taken_at: string;
  intro: ReportIntro[];
  detail: ReportDetailSection[];
  log: Array<{
    id: string;
    log: string;
    created_at: string;
  }>;
  proctoring: {
    web_cam: Array<{ key: string; lastModified: string }>;
    screen: Array<{ key: string; lastModified: string }>;
  };
  profile: {
    assessee_id: string;
    assessee_name: string;
    assessee_age: string | number;
    assessee_gender: string;
    work_place: string;
    type: string;
    education: string;
  };
};

export type BulkReportDataAssessment = {
  generals: {
    cover: string;
    guide: {
      content: string;
    };
    batch: {
      name: string;
      code: string;
      type: string;
    };
  };
  reports: ReportItem[];
};

export type ReportDetailResult = {
  test_point: number;
  criteria: string;
  criteria_color: string;
  description: string;
};

export type ReportDetailByCategory = {
  category_id: string;
  category_name: string;
  category_code: string;
  category_point: number;
  description: string;
};

export type ReportDetailSubtest = {
  subtest_id: string;
  subtest_name: string;
  subtest_code: string;
  description: string;
  result: {
    subtest_point: number;
    subtest_criteria: string;
    criteria_color: string;
    categories: [] | ReportDetailByCategory[];
    scale: {
      minimum_score: number;
      maximum_score: number;
    };
  };
};

export type CriteriasReport = {
  criteria_id: string;
  criteria_name: string | null;
  criteria_color?: string;
  minimum_score: number | null;
  maximum_score: number | null;
  description: string;
  color_id?: string | null;
  color_name?: string | null;
  hex_code?: string | null;
};

export type StandardizedReport = {
  standardized_id: string;
  raw_score: number;
  standardized_score: number;
};

export type ReportCriteria = {
  value_name: string;
  value_code: string;
  criterias: CriteriasReport[];
  standardized: StandardizedReport[];
};

export type ReportDetailSection = {
  category_id: string;
  category_name: string;
  category_code: string;
  test_id: string;
  test_name: string;
  test_code: string;
  description: string;
  summary_type: string;
  summary_formula: string;
  summary_view: string;
  result: ReportDetailResult;
  norm: CriteriasReport[];
  subtests: ReportDetailSubtest[];
};

type Test = {
  test_id: string;
  test_name: string;
  test_code: string;
  description: string;
  test_result: {
    test_point: number;
    criteria: string;
    criteria_color: string;
    description: string;
  };
};

type Subtest = {
  subtest_id: string;
  subtest_name: string;
  subtest_code: string;
  description: string;
  result: {
    subtest_point: number;
    subtest_criteria: string;
    criteria_color: string;
    categories: {
      category_id: string | number;
      category_name: string;
      category_code: string;
      category_point: number | string;
      description: string;
    };
  };
};

export type ReportIntro = {
  category_id: string;
  category_name: string;
  category_code: string;
  summary_type: string;
  summary_code: string;
  summary_view: string;
  summary_formula: string;
  norm: CriteriasReport;
  subtests: Subtest[];
  tests: Test[];
};
