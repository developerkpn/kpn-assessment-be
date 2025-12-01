CREATE TABLE public.mst_location (
	id varchar(20) NOT NULL,
	location_name varchar(50) NULL,
	business_unit varchar(50) NULL,
	is_active bool NULL DEFAULT TRUE,
	create_at timestamp NULL DEFAULT NOW(),
	create_by varchar(255) NULL,
	update_at timestamp NULL,
	update_by varchar(255) NULL,
	CONSTRAINT mst_location_pk PRIMARY KEY (id),
	CONSTRAINT mst_location_mst_business_unit_fk FOREIGN KEY (business_unit) REFERENCES public.mst_business_unit(bu_code)
);
