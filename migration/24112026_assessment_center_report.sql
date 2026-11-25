-- CR 7: Report Assessment Center (AC) & Integrasi ke TMP
-- Idempotent migration: aman dijalankan ulang tanpa merusak data yang sudah ada.

-- 1. Header Report Assessment Center
CREATE TABLE IF NOT EXISTS public.t_ac_report (
  id varchar(200) DEFAULT gen_random_uuid() NOT NULL,
  assessee_nik varchar(100) NOT NULL,
  assessee_name varchar(255) NOT NULL,
  gender varchar(50) NULL,
  age varchar(50) NULL,
  business_unit varchar(255) NULL,
  department varchar(255) NULL,
  work_location varchar(255) NULL,
  join_date date NULL,
  review_date date NULL,
  assessor_name varchar(255) NULL,
  current_position_grade varchar(255) NULL,
  proposed_position varchar(255) NULL,
  target_grade varchar(20) NOT NULL,
  strength text NULL,
  area_of_development text NULL,
  recommendation_type varchar(50) NOT NULL DEFAULT 'Not Recommended',
  development_duration varchar(100) NULL DEFAULT '6 - 12 bulan',
  evaluation_grade varchar(20) NULL,
  sign_place_date varchar(150) NULL,
  pass_count int4 NOT NULL DEFAULT 0,
  status varchar(30) NOT NULL DEFAULT 'Draft',
  pdf_path text NULL,
  tmp_sync_status varchar(30) NOT NULL DEFAULT 'Pending',
  tmp_synced_at timestamptz NULL,
  tmp_external_id varchar(200) NULL,
  tmp_error_message text NULL,
  created_at timestamptz DEFAULT now() NULL,
  created_by varchar(200) NULL,
  updated_at timestamptz NULL,
  updated_by varchar(200) NULL,
  CONSTRAINT t_ac_report_pk PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_t_ac_report_nik ON public.t_ac_report (assessee_nik);
CREATE INDEX IF NOT EXISTS idx_t_ac_report_status ON public.t_ac_report (status);
CREATE INDEX IF NOT EXISTS idx_t_ac_report_created_at ON public.t_ac_report (created_at DESC);

-- 2. Detail 9 Kompetensi & Rencana Pengembangan 70:20:10 per Report AC
CREATE TABLE IF NOT EXISTS public.t_ac_report_competency (
  id varchar(200) DEFAULT gen_random_uuid() NOT NULL,
  ac_report_id varchar(200) NOT NULL,
  competency_code varchar(10) NOT NULL,
  competency_name varchar(150) NOT NULL,
  cluster varchar(30) NOT NULL,
  sort_order int4 NOT NULL DEFAULT 1,
  required_level int4 NOT NULL,
  actual_level int4 NOT NULL,
  gap int4 NOT NULL,
  is_pass bool NOT NULL DEFAULT false,
  uraian_kompetensi text NULL,
  uraian_gap text NULL,
  training_recommendation text NULL,
  coaching_plan text NULL,
  ojt_plan text NULL,
  CONSTRAINT t_ac_report_competency_pk PRIMARY KEY (id),
  CONSTRAINT t_ac_report_competency_fk FOREIGN KEY (ac_report_id)
    REFERENCES public.t_ac_report(id) ON DELETE CASCADE,
  CONSTRAINT t_ac_report_competency_uq UNIQUE (ac_report_id, competency_code)
);

-- 3. Log Pengiriman / Integrasi Otomatis ke Sistem TMP
CREATE TABLE IF NOT EXISTS public.t_ac_report_tmp_log (
  id varchar(200) DEFAULT gen_random_uuid() NOT NULL,
  ac_report_id varchar(200) NOT NULL,
  request_payload jsonb NULL,
  response_status int4 NULL,
  response_body text NULL,
  sync_status varchar(30) NOT NULL,
  error_message text NULL,
  attempted_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT t_ac_report_tmp_log_pk PRIMARY KEY (id),
  CONSTRAINT t_ac_report_tmp_log_fk FOREIGN KEY (ac_report_id)
    REFERENCES public.t_ac_report(id) ON DELETE CASCADE
);

-- 4. Registrasi Menu Khusus "Assessment Center" di bawah subheader "Report"
-- Menggunakan path unik '/admin/report-ac' & nextval agar tidak bentrok dengan menu CR lain (mis. Vendor Assessment di id 23)
SELECT setval(
  'mst_page_id_seq',
  GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.mst_menu), (SELECT last_value FROM mst_page_id_seq))
);

INSERT INTO public.mst_menu (id, name, path, icon, is_active, position, subheader)
SELECT
  nextval('mst_page_id_seq'),
  'Assessment Center',
  '/admin/report-ac',
  'FactCheck',
  true,
  COALESCE((SELECT MAX(position) FROM public.mst_menu WHERE subheader = 'Report'::public.subheader_type), 20) + 1,
  'Report'::public.subheader_type
WHERE NOT EXISTS (
  SELECT 1 FROM public.mst_menu WHERE path = '/admin/report-ac'
);

UPDATE public.mst_menu
SET icon = 'FactCheck'
WHERE path = '/admin/report-ac' AND icon IS DISTINCT FROM 'FactCheck';

-- 5. Akses Menu untuk Super Admin & Role yang memiliki akses ke modul Report (menu_id = 17)
INSERT INTO public.mst_menu_access (role_id, fcreate, fread, fupdate, fdelete, menu_id)
SELECT r.id, true, true, true, true, m.id
FROM public.mst_role r
CROSS JOIN public.mst_menu m
WHERE m.path = '/admin/report-ac'
  AND (
    r.role_name = 'Super Admin'
    OR EXISTS (
      SELECT 1 FROM public.mst_menu_access ma
      WHERE ma.role_id = r.id AND ma.menu_id = 17 AND ma.fread = true
    )
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.mst_menu_access ma
    WHERE ma.menu_id = m.id AND ma.role_id = r.id
  );
