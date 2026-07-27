-- Element translations untuk halaman login eksternal (alur login-first + link registrasi).
-- Tanpa baris ini frontend menampilkan key mentah ("no_account_yet").
-- Idempotent: hanya menambah key/bahasa yang belum ada, tidak mengubah baris lama.

INSERT INTO public.mst_element_translations (id, element_id, language_id, description)
SELECT gen_random_uuid()::varchar, v.element_id, v.language_id, v.description
FROM (VALUES
  ('no_account_yet', 'en', 'Don''t have an account yet?'),
  ('no_account_yet', 'id', 'Belum punya akun?'),
  ('register_here',  'en', 'Register here'),
  ('register_here',  'id', 'Daftar di sini')
) AS v(element_id, language_id, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.mst_element_translations t
  WHERE t.element_id = v.element_id
    AND t.language_id = v.language_id
);
