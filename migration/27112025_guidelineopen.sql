ALTER TABLE public.t_progress_batch_head ADD guideline_open bool DEFAULT false NULL;

ALTER TABLE public.mutex_transaction ADD expires_at TIMESTAMPTZ ;