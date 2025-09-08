-- update column mst_admin_web -> add from_darwin and nik

ALTER TABLE public.mst_admin_web ADD from_darwin bool NULL;
ALTER TABLE public.mst_admin_web ALTER COLUMN from_darwin SET STORAGE PLAIN;
ALTER TABLE public.mst_admin_web ADD nik varchar(20) NULL;
ALTER TABLE public.mst_admin_web ALTER COLUMN nik SET STORAGE EXTENDED;

-- create table mst_email_contact

CREATE TABLE public.mst_email_contact (
	uid uuid DEFAULT gen_random_uuid() NOT NULL,
	email_dt varchar(50) NULL,
	is_active bool NULL,
	created_date timestamp DEFAULT now() NULL,
	created_by varchar DEFAULT CURRENT_USER NULL,
	CONSTRAINT mst_email_contact_pk PRIMARY KEY (uid)
);


-- index rawscore for gen report
CREATE INDEX mst_standardized_score_critid_rawscore ON public.mst_standardized_score USING btree (value_id, raw_score)

