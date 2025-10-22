CREATE TYPE public.terms_pp AS ENUM (
	'terms',
	'pp');
  
ALTER TABLE public.mst_term_pp ADD type_dt public.terms_pp NULL;
ALTER TABLE public.mst_term_pp ADD language_type varchar(5) NULL;
ALTER TABLE public.mst_term_pp ADD language_id varchar(2) NULL;

ALTER TABLE public.mst_term_pp ADD CONSTRAINT mst_term_pp_mst_language_fk FOREIGN KEY (language_id) REFERENCES public.mst_language(language_code);
