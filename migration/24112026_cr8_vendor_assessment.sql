-- Migration for CR 8: Table tr_vendor_assessment
CREATE TABLE IF NOT EXISTS tr_vendor_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_name VARCHAR(255) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    participant_nik VARCHAR(100),
    vendor_name VARCHAR(255) NOT NULL,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Checkbox keikutsertaan tes (CR 8 Acceptance Criteria 2)
    has_critical_thinking BOOLEAN NOT NULL DEFAULT FALSE,
    critical_thinking_score VARCHAR(100),
    critical_thinking_category VARCHAR(100),
    
    has_work_endurance BOOLEAN NOT NULL DEFAULT FALSE,
    work_endurance_score VARCHAR(100),
    work_endurance_category VARCHAR(100),
    
    has_growth_mindset BOOLEAN NOT NULL DEFAULT FALSE,
    growth_mindset_score VARCHAR(100),
    growth_mindset_category VARCHAR(100),
    
    -- File storage metadata (CR 8 Acceptance Criteria 1 & 3)
    file_name VARCHAR(255) NOT NULL,
    file_original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    
    notes TEXT,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vendor_assessment_email ON tr_vendor_assessment(participant_email);
CREATE INDEX IF NOT EXISTS idx_vendor_assessment_date ON tr_vendor_assessment(assessment_date);
CREATE INDEX IF NOT EXISTS idx_vendor_assessment_vendor ON tr_vendor_assessment(vendor_name);
