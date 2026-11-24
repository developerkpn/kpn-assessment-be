-- Migration: Add instruction column to mst_grouptest_head
ALTER TABLE mst_grouptest_head ADD COLUMN IF NOT EXISTS instruction TEXT;
