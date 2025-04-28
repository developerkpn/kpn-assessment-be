import { async } from "rxjs";
import { Request, Response } from "express";
import { createAdmin } from "#dep/models/AdminWebModel";
import { Validation } from "#dep/validation/Validation";
import { CategoryValidation } from "#dep/validation/CategoryValidation";
import { createCategory, deleteCategory, getCategory, updateCategory } from "#dep/models/CategoryModel";
import { error } from "winston";

export const handleCreateCategory = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const payload = {
      category_name: req.body.category_name,
      category_code: req.body.category_code,
      created_by: req.userDecode?.user_id,
      created_at: today,
      criteria_id: req.body.criteria_id,
      is_active: req.body.is_active,
    };
    const validatedRequest = Validation.validate(CategoryValidation.CREATE, payload);
    let result = await createCategory(validatedRequest);
    res.status(200).send({
      message: `Success create category`,
      category_code: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGetCategory = async (req: Request, res: Response) => {
  try {
    let result = await getCategory();
    res.status(200).send({
      message: `Success get category`,
      data: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleUpdateCategory = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const today = new Date();
  const payload = {
    updated_by: req.userDecode?.user_id,
    updated_at: today,
    ...req.body,
  };

  try {
    const validatedRequest = Validation.validate(CategoryValidation.UPDATE, payload);
    const validatedId = Validation.validate(CategoryValidation.ID, id);
    let result = await updateCategory(validatedRequest, validatedId);
    res.status(200).send({
      message: `Success update category`,
      category_code: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleDeleteCategory = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const validatedId = Validation.validate(CategoryValidation.ID, id);
    console.log(validatedId);
    let result = await deleteCategory(validatedId);
    res.status(200).send({
      message: `Success delete category`,
      id: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};
