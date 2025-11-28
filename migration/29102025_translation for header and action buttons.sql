CREATE TABLE IF NOT EXISTS mst_element_translations (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()
  element_id VARCHAR(255) 
  language_id VARCHAR(2) REFERENCES mst_language (language_code)
  description TEXT
  create_at TIMESTAMP DEFAULT now()
  create_by VARCHAR(250)
  update_at TIMESTAMP
  update_by VARCHAR(250)
)

INSERT INTO public.mst_menu (id,"name","path",icon,is_active,"position",subheader)
	VALUES (20,'Element Translation','/admin/element-trans','Subtitles',true,8,'Master Data'::public.subheader_type);

INSERT INTO public.mst_menu (id,"name","path",icon,is_active,"position",subheader)
	VALUES (21,'Language','/admin/language','Language',true,9,'Master Data'::public.subheader_type);
