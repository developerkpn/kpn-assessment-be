ALTER TABLE public.t_progress_batch_head ADD guideline_opened bool DEFAULT false NULL;

ALTER TABLE public.mutex_transaction ADD expires_at TIMESTAMPTZ ;