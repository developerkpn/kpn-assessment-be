import { z } from "zod";
import {
  AC_COMPETENCY_MASTER,
  getRequiredLevelsByGrade,
} from "@/helper/acCompetencyMaster.js";

const CompetencyItemSchema = z.object({
  competency_code: z.enum(["S", "I", "G", "A", "P", "MP", "DM", "DO", "RB"]),
  actual_level: z.coerce.number().int().min(1).max(4),
  uraian_kompetensi: z.string().optional().default(""),
  uraian_gap: z.string().optional().default(""),
  training_recommendation: z.string().optional().default(""),
  coaching_plan: z.string().optional().default(""),
  ojt_plan: z.string().optional().default(""),
});

export class ACReportValidation {
  static readonly UPSERT = z
    .object({
      assessee_nik: z.string().trim().min(1, "NIK Asesi wajib diisi").max(100),
      assessee_name: z.string().trim().min(1, "Nama Asesi wajib diisi").max(255),
      gender: z.string().trim().max(50).optional().default(""),
      age: z.string().trim().max(50).optional().default(""),
      business_unit: z.string().trim().max(255).optional().default(""),
      department: z.string().trim().max(255).optional().default(""),
      work_location: z.string().trim().max(255).optional().default(""),
      join_date: z.string().trim().nullable().optional(),
      review_date: z.string().trim().nullable().optional(),
      assessor_name: z.string().trim().max(255).optional().default(""),
      current_position_grade: z.string().trim().max(255).optional().default(""),
      proposed_position: z.string().trim().max(255).optional().default(""),
      target_grade: z.string().trim().min(1, "Golongan Tujuan wajib dipilih").max(20),
      strength: z.string().optional().default(""),
      area_of_development: z.string().optional().default(""),
      recommendation_type: z
        .enum(["Suitable", "Need Development", "Not Recommended"])
        .optional(),
      development_duration: z.string().trim().max(100).optional().default("6 - 12 bulan"),
      evaluation_grade: z.string().trim().max(20).optional().default(""),
      sign_place_date: z.string().trim().max(150).optional().default(""),
      status: z.enum(["Draft", "Completed"]).optional().default("Draft"),
      competencies: z.array(CompetencyItemSchema).default([]),
    })
    .superRefine((data, ctx) => {
      if (data.status !== "Completed") return;

      const addIssue = (path: (string | number)[], message: string) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path,
          message,
        });
      };

      // 1. Identitas wajib pada status Completed
      const requiredIdentity: Array<[keyof typeof data, string]> = [
        ["gender", "Gender wajib dipilih"],
        ["age", "Usia Asesi wajib diisi"],
        ["business_unit", "Unit Bisnis wajib diisi"],
        ["department", "Departemen wajib diisi"],
        ["work_location", "Lokasi Kerja wajib diisi"],
        ["review_date", "Tanggal Review wajib diisi"],
        ["assessor_name", "Nama Assessor wajib diisi"],
        ["current_position_grade", "Posisi & Golongan Saat Ini wajib diisi"],
        ["proposed_position", "Posisi Tujuan wajib diisi"],
      ];

      for (const [key, label] of requiredIdentity) {
        const val = data[key];
        if (!val || !String(val).trim()) {
          addIssue([key], label);
          return;
        }
      }

      // 2. Profil 9 Kompetensi (Uraian Kompetensi & Uraian Gap jika GAP)
      const reqMap = getRequiredLevelsByGrade(data.target_grade);
      const inputByCode = new Map(
        data.competencies.map((c) => [c.competency_code, c])
      );

      for (const master of AC_COMPETENCY_MASTER) {
        const item = inputByCode.get(master.code);
        const reqLvl = reqMap[master.code];
        const actLvl = Number(item?.actual_level ?? reqLvl);
        const isGap = actLvl < reqLvl;

        if (!item || !item.uraian_kompetensi?.trim()) {
          addIssue(
            ["competencies"],
            `Uraian Kompetensi pada aspek "${master.no}. ${master.name}" wajib diisi`
          );
          return;
        }

        if (isGap && (!item.uraian_gap?.trim() || item.uraian_gap.trim() === "-")) {
          addIssue(
            ["competencies"],
            `Uraian Gap pada aspek "${master.no}. ${master.name}" wajib diisi`
          );
          return;
        }
      }

      // 3. Ringkasan Kekuatan & Area Pengembangan
      if (!data.strength?.trim()) {
        addIssue(["strength"], "Kekuatan (Strength) wajib diisi");
        return;
      }
      if (!data.area_of_development?.trim()) {
        addIssue(["area_of_development"], "Area Pengembangan wajib diisi");
        return;
      }

      // 4. Rencana Pengembangan 70:20:10 untuk aspek yang GAP
      for (const master of AC_COMPETENCY_MASTER) {
        const item = inputByCode.get(master.code);
        const reqLvl = reqMap[master.code];
        const actLvl = Number(item?.actual_level ?? reqLvl);
        if (actLvl < reqLvl) {
          if (
            !item?.training_recommendation?.trim() ||
            !item?.coaching_plan?.trim() ||
            !item?.ojt_plan?.trim()
          ) {
            addIssue(
              ["competencies"],
              `Rencana Pengembangan (Training, Coaching, OJT) pada aspek "${master.name}" wajib dilengkapi`
            );
            return;
          }
        }
      }
    });
}
