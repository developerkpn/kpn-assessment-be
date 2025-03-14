export type BatchHeader = {
  id: string;
  batch_name: string;
  batch_code: string;
  grouptest_id: string;
  bu_id: string;
  function_id: string;
  template_email_id: string;
  created_by: string;
  created_at: string;
  start_period: Date;
  end_period: Date;
  is_mic: boolean;
  is_screenshot: boolean;
  note: string;
};

export type BatchHeadUpdate = {
  id: string;
  batch_name?: string;
  batch_code?: string;
  grouptest_id?: string;
  bu_id?: string;
  function_id?: string;
  template_email_id?: string;
  updated_by: string;
  updated_at: Date;
  start_period?: Date;
  end_period?: Date;
  is_mic?: boolean;
  is_screenshot?: boolean;
  note?: string;
};

export type BatchAssessee = {
  id: string;
  batch_id: string;
  assessee_nik: string;
  assessee_name: string;
  assessee_email: string;
};
