-- public.mst_admin_web_bu definition

-- Drop table

-- DROP TABLE public.mst_admin_web_bu;

CREATE TABLE public.mst_admin_web_bu (
	uid uuid DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NULL,
	bu_code varchar(20) NULL,
	create_at timestamp DEFAULT now() NULL,
	create_by uuid NULL,
	CONSTRAINT mst_admin_web_bu_pk PRIMARY KEY (uid)
);


-- public.mst_admin_web_bu foreign keys

ALTER TABLE public.mst_admin_web_bu ADD CONSTRAINT mst_admin_web_bu_mst_admin_web_fk FOREIGN KEY (user_id) REFERENCES public.mst_admin_web(id);
ALTER TABLE public.mst_admin_web_bu ADD CONSTRAINT mst_admin_web_bu_mst_business_unit_fk FOREIGN KEY (bu_code) REFERENCES public.mst_business_unit(bu_code);

-- MST_SCOPE
CREATE TABLE public.mst_scope (
	scope_id varchar(10) NOT NULL,
	scope_desc varchar(100) NULL,
	create_at timestamp DEFAULT now() NULL,
	create_by uuid DEFAULT gen_random_uuid() NULL,
	update_at timestamp NULL,
	update_by uuid NULL,
	is_active bool DEFAULT true NULL,
	CONSTRAINT mst_scope_pk PRIMARY KEY (scope_id)
);

-- MST_ADMIN_WEB_SCOPE
CREATE TABLE public.mst_admin_web_scope (
	uid uuid NOT NULL,
	user_id uuid NULL,
	scope_id varchar(10) NULL,
	create_at timestamp NULL,
	create_by uuid NULL,
	CONSTRAINT mst_admin_web_scope_pk PRIMARY KEY (uid),
	CONSTRAINT mst_admin_web_scope_mst_admin_web_fk FOREIGN KEY (user_id) REFERENCES public.mst_admin_web(id),
	CONSTRAINT mst_admin_web_scope_mst_scope_fk FOREIGN KEY (scope_id) REFERENCES public.mst_scope(scope_id)
);


--update adminweb with new column
ALTER TABLE public.mst_admin_web ADD update_at timestamp NULL;
ALTER TABLE public.mst_admin_web ADD update_by uuid NULL;