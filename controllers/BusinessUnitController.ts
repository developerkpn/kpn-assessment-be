import {
  createBusinessUnit,
  deleteBusinessUnit,
  getBusinessUnit,
  updateBusinessUnit,
} from "#dep/models/BusinessUnitModel";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {Validation} from "#dep/validation/Validation";
import {BusinessUnitValidation} from "#dep/validation/BusinessUnitValidation";

export const handleCreateBusinessUnit = async (req: Request, res: Response) => {
  const today = new Date();
  const payload = {
    id: uuidv4(),
    bu_code: req.body.bu_code,
    bu_name: req.body.bu_name,
    is_active: req.body.is_active,
    created_by: req.body.created_by,
    created_date: today,
  };

  try {
    const validatedRequest = Validation.validate(BusinessUnitValidation.CREATE, payload);
    let result = await createBusinessUnit(validatedRequest);
    res.status(200).send({
      message: `Success create business unit`,
      bu_code: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGetBusinessUnit = async (_req: Request, res: Response) => {
  try {
    let result = await getBusinessUnit();
    res.status(200).send({
      message: `Success get business unit`,
      data: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleUpdateBusinessUnit = async (req: Request, res: Response) => {
  const id = req.params.id;
  const payload = req.body;
  try {
    const validatedRequest = Validation.validate(BusinessUnitValidation.UPDATE, payload);
    const validatedId = Validation.validate(BusinessUnitValidation.ID, id);
    let result = await updateBusinessUnit(validatedRequest, validatedId);
    res.status(200).send({
      message: `Success update business unit`,
      bu_code: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleDeleteBusinessUnit = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const validatedId = Validation.validate(BusinessUnitValidation.ID, id);
    await deleteBusinessUnit(validatedId);
    res.status(200).send({
      message: `Success delete business unit`,
      id: id,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};
