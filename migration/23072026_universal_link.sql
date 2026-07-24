-- public.mst_universal_link definition
-- Universal (campaign) links for external assessee login, e.g. /join/<slug>

-- DROP TABLE public.mst_universal_link;

CREATE TABLE public.mst_universal_link (
	id varchar(200) DEFAULT gen_random_uuid() NOT NULL,
	link_name varchar(255) NOT NULL,
	slug varchar(100) NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	created_by varchar(200) NULL,
	updated_at timestamptz NULL,
	updated_by varchar(200) NULL,
	CONSTRAINT mst_universal_link_pk PRIMARY KEY (id),
	CONSTRAINT mst_universal_link_slug_uq UNIQUE (slug)
);

-- Admin menu entry (id 22), access granted to Super Admin (master admin) only
INSERT INTO public.mst_menu (id, name, path, icon, is_active, position, subheader)
VALUES (22, 'Universal Link', '/admin/universal-link', 'Link', true, 10, 'Master Data');

INSERT INTO public.mst_menu_access (id, role_id, fcreate, fread, fupdate, fdelete, menu_id)
SELECT (SELECT COALESCE(MAX(id), 0) FROM mst_menu_access) + 1,
       id, true, true, true, true, 22
FROM mst_role
WHERE role_name = 'Super Admin';
