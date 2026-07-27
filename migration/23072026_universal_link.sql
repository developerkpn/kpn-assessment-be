-- public.mst_universal_link definition
-- Universal (campaign) links for external assessee login, e.g. /join/<slug>
-- Idempotent: aman dijalankan ulang, tidak mengubah/menghapus baris yang sudah ada.

CREATE TABLE IF NOT EXISTS public.mst_universal_link (
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

-- Admin menu entry. id HARUS 22: dipakai hardcoded oleh checkPermission(..., 22)
-- di routes/UniversalLink.ts dan getPermission(..., 22) di frontend.
INSERT INTO public.mst_menu (id, name, path, icon, is_active, position, subheader)
SELECT 22, 'Universal Link', '/admin/universal-link', 'Link', true, 10, 'Master Data'
WHERE NOT EXISTS (SELECT 1 FROM public.mst_menu WHERE id = 22);

-- id diisi eksplisit di atas, jadi sequence disinkronkan ke max(id) supaya insert
-- menu berikutnya tidak bentrok. GREATEST menjaga sequence tidak pernah turun.
SELECT setval(
  'mst_page_id_seq',
  GREATEST((SELECT MAX(id) FROM public.mst_menu), (SELECT last_value FROM mst_page_id_seq))
);

-- Akses hanya untuk Super Admin (master admin). Admin BU tidak boleh melihat menu ini.
INSERT INTO public.mst_menu_access (role_id, fcreate, fread, fupdate, fdelete, menu_id)
SELECT r.id, true, true, true, true, 22
FROM public.mst_role r
WHERE r.role_name = 'Super Admin'
  AND NOT EXISTS (
    SELECT 1 FROM public.mst_menu_access ma
    WHERE ma.menu_id = 22 AND ma.role_id = r.id
  );
