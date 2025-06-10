import {
  createCriteria,
  deleteCriteria,
  getCriteria,
  getCriteriaColor,
  getCriteriaDetail,
  updateCriteria,
} from "@/models/CriteriaModel.js";
import { Criteria, CriteriaGroup, CriteriaRequest } from "@/types/MasterDataTypes.js";
import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Validation } from "@/validation/Validation.js";
import { CriteriaValidation } from "@/validation/CriteriaValidation.js";
import { FunctionMenuValidation } from "@/validation/FunctionMenuValidation.js";

export const handleGetCriteriaColor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const color = await getCriteriaColor();
    res.status(200).send({
      message: "Success!",
      data: color,
    });
  } catch (e) {
    next(e);
  }
};
export const handleCreateCriteria = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;
  const today = new Date();
  const groupId = uuidv4();
  const creator = payload.created_by;

  const groupPayload: CriteriaGroup = {
    id: groupId,
    value_code: payload.value_code,
    value_name: payload.value_name,
    created_by: creator,
    created_date: today,
    value_group: "CRITERIA",
  };

  const criteriaPayload = payload.criteria.map((prev: CriteriaRequest) => ({
    ...prev,
    id: uuidv4(),
    category_fk: groupId,
    created_by: creator,
    created_date: today,
  }));

  console.log("cek 1");
  console.log(groupPayload);
  console.log("cek 2");
  console.log(criteriaPayload);
  try {
    const validatedGroupPayloadRequest = Validation.validate(CriteriaValidation.CREATEGROUP, groupPayload);
    const validatedCriteriaPayloadRequest = Validation.validate(CriteriaValidation.CREATECRITERIA, criteriaPayload);
    let result = await createCriteria(validatedGroupPayloadRequest, validatedCriteriaPayloadRequest);
    res.status(200).send({
      message: `Success create criteria`,
      category_name: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetCriteria = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getCriteria();
    console.log("hasil ori", result);

    // 1) mapping: pastikan tiap item category_fk di-override jadi value_id
    const mapped = result.map((item: any) => ({
      ...item,
      category_fk: item.value_id,
    }));

    // 2) reduce: group by value_id, dan konsisten pakai acc[value_id]
    const groupedByValueId = Object.values(
      mapped.reduce(
        (acc: any, item: any) => {
          const { value_code, value_name, value_id, ...criteria } = item;

          // kalau belum ada grup untuk value_id ini, inisialisasi
          if (!acc[value_id]) {
            acc[value_id] = {
              value_code,
              value_name,
              value_id,
              criteria: [] as Array<Omit<typeof item, "value_code" | "value_name" | "value_id">>,
            };
          }

          // masukkan sisa properti sebagai satu elemen criteria
          acc[value_id].criteria.push(criteria);
          return acc;
        },
        {} as Record<
          string,
          {
            value_code: string;
            value_name: string;
            value_id: string;
            criteria: any[];
          }
        >
      )
    );

    console.log("grouped:", groupedByValueId);

    res.status(200).json({
      message: "Success get criteria",
      data: groupedByValueId,
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteCriteria = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(FunctionMenuValidation.ID, req.params.id);
    let result = await deleteCriteria(validatedId);
    res.status(200).send({
      message: `Success delete criteria`,
      name: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleUpdateCriteria = async (req: Request, res: Response, next: NextFunction) => {
  const today = new Date();
  const validatedId = Validation.validate(CriteriaValidation.ID, req.params.id);
  const payload = req.body;
  const criteria = payload.criteria.map((prev: Partial<Criteria>) => {
    if (!prev.hasOwnProperty("id") || !prev.hasOwnProperty("category_fk")) {
      return {
        id: uuidv4(),
        category_fk: validatedId,
        criteria_name: prev.criteria_name,
        minimum_score: prev.minimum_score,
        maximum_score: prev.maximum_score,
        is_active: prev.is_active,
        created_by: payload.user_id,
        created_date: today,
        updated_by: payload.user_id,
        updated_date: today,
        description: prev.description,
        color_id: prev.color_id,
      };
    }
    return { ...prev, updated_by: payload.user_id, updated_date: today };
  });

  console.log("cek update criteria", criteria);

  delete payload.user_id;
  delete payload.criteria;

  try {
    let result = await updateCriteria(payload, criteria, validatedId);
    res.status(200).send({
      message: `Success update criteria`,
      value_name: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetCriteriaDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const criteriaId = Validation.validate(CriteriaValidation.ID, req.params.id);

    const rawData = await getCriteriaDetail(criteriaId);

    if (rawData.length === 0) {
      res.status(404).json({ message: "Criteria not found" });
      return;
    }

    const groupedData = {
      value_name: rawData[0].value_name,
      value_code: rawData[0].value_code,
      criterias: rawData.reduce(
        (acc: any, row: any) => {
          if (row.criteria_name) {
            acc.push({
              criteria_name: row.criteria_name,
              minimum_score: row.minimum_score,
              maximum_score: row.maximum_score,
              description: row.description,
              color_id: row.color_id,
              color_name: row.color_name,
              hex_code: row.hex_code,
            });
          }
          return acc;
        },
        [] as Array<{ criteria_name: string; minimum_score: number; maximum_score: number; description: string }>
      ),
    };

    res.status(200).json({
      message: "Success!",
      data: groupedData,
    });
  } catch (error) {
    next(error);
  }
};
