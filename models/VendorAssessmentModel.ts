import { db } from "@/config/connection.js";
import { VendorAssessment } from "@/types/VendorAssessmentTypes.js";

export const VendorAssessmentModel = {
  create: async (data: Omit<VendorAssessment, "id" | "created_at" | "updated_at">): Promise<VendorAssessment> => {
    const client = await db.connect();
    try {
      const query = `
        INSERT INTO tr_vendor_assessment (
          participant_name,
          participant_email,
          participant_nik,
          vendor_name,
          assessment_date,
          has_critical_thinking,
          critical_thinking_score,
          critical_thinking_category,
          has_work_endurance,
          work_endurance_score,
          work_endurance_category,
          has_growth_mindset,
          growth_mindset_score,
          growth_mindset_category,
          file_name,
          file_original_name,
          file_path,
          file_size,
          mime_type,
          notes,
          created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        )
        RETURNING *
      `;
      const values = [
        data.participant_name,
        data.participant_email,
        data.participant_nik ?? null,
        data.vendor_name,
        data.assessment_date,
        data.has_critical_thinking ?? false,
        data.critical_thinking_score ?? null,
        data.critical_thinking_category ?? null,
        data.has_work_endurance ?? false,
        data.work_endurance_score ?? null,
        data.work_endurance_category ?? null,
        data.has_growth_mindset ?? false,
        data.growth_mindset_score ?? null,
        data.growth_mindset_category ?? null,
        data.file_name,
        data.file_original_name,
        data.file_path,
        data.file_size ?? null,
        data.mime_type ?? "application/pdf",
        data.notes ?? null,
        data.created_by ?? null,
      ];
      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  getAll: async (search?: string): Promise<VendorAssessment[]> => {
    const client = await db.connect();
    try {
      let query = `
        SELECT * FROM tr_vendor_assessment
      `;
      const values: any[] = [];
      if (search && search.trim() !== "") {
        query += `
          WHERE participant_name ILIKE $1 
             OR participant_email ILIKE $1 
             OR vendor_name ILIKE $1 
             OR participant_nik ILIKE $1
        `;
        values.push(`%${search.trim()}%`);
      }
      query += ` ORDER BY created_at DESC`;
      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  },

  getById: async (id: string): Promise<VendorAssessment | null> => {
    const client = await db.connect();
    try {
      const result = await client.query(
        `SELECT * FROM tr_vendor_assessment WHERE id = $1`,
        [id]
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  delete: async (id: string): Promise<VendorAssessment | null> => {
    const client = await db.connect();
    try {
      const result = await client.query(
        `DELETE FROM tr_vendor_assessment WHERE id = $1 RETURNING *`,
        [id]
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },
};
