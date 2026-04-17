-- ─────────────────────────────────────────────────────────────
-- MIGRATION: Add 'section' column to support batch → section hierarchy
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────

-- 1. Add section column to roll_list (each roll is in ONE section of ONE batch)
ALTER TABLE roll_list
ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'Section 1';

-- 2. Add section column to students (remembers which section a student registered under)
ALTER TABLE students
ADD COLUMN IF NOT EXISTS section TEXT;

-- 3. Update the unique constraint on roll_list to include section
--    (same roll number CAN exist in different sections of same batch — unlikely but safe)
-- First drop the old constraint if it exists
ALTER TABLE roll_list DROP CONSTRAINT IF EXISTS roll_list_batch_id_enrollment_no_key;
-- Add new composite unique constraint
ALTER TABLE roll_list
ADD CONSTRAINT roll_list_batch_section_enrollment_key
UNIQUE (batch_id, section, enrollment_no);

-- 4. Optional: Index on section for faster queries
CREATE INDEX IF NOT EXISTS idx_roll_list_section ON roll_list(batch_id, section);
CREATE INDEX IF NOT EXISTS idx_students_section ON students(batch_id, section);
