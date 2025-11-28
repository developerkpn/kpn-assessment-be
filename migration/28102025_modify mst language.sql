-- public.mst_language definition

-- Drop table

-- DROP TABLE public.mst_language;

CREATE TABLE public.mst_language (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	language_code varchar(2) NOT NULL,
	language_name varchar(100) NOT NULL,
	language_name_native varchar(100) NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	"order" int4 DEFAULT 0 NULL,
	is_display_client bool DEFAULT true NULL,
	create_at timestamp DEFAULT now() NULL,
	update_at timestamp NULL,
	create_by uuid NULL,
	update_by uuid NULL,
	CONSTRAINT chk_language_code_format CHECK (((language_code)::text ~ '^[a-z]{2}$'::text)),
	CONSTRAINT mst_language_language_code_key UNIQUE (language_code),
	CONSTRAINT mst_language_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_mst_language_active ON public.mst_language USING btree (is_active);
CREATE INDEX idx_mst_language_code ON public.mst_language USING btree (language_code);

ALTER TABLE mst_language 
  ADD COLUMN IF NOT EXISTS is_display_client BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS create_at TIMESTAMP default NOW(),
  ADD COLUMN IF NOT EXISTS update_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS create_by UUID,
  ADD COLUMN IF NOT EXISTS update_by UUID