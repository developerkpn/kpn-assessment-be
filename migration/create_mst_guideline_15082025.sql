-- public.mst_guideline definition

-- Drop table

-- DROP TABLE public.mst_guideline;

CREATE TABLE public.mst_guideline (
	uid varchar(200) DEFAULT gen_random_uuid() NOT NULL,
	guideline_name text NULL,
	create_at timestamptz NULL,
	create_by varchar(200) NULL,
	update_at timestamptz NULL,
	update_by varchar(200) NULL,
	selected bool DEFAULT false NULL,
	function_test varchar(200) NULL,
	CONSTRAINT mst_guideline_pk PRIMARY KEY (uid)
);