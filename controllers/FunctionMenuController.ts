import {
  createFunctionMenu,
  deleteFunctionMenu,
  getFunctionMenu,
  updateFunctionMenu,
} from "#dep/models/FunctionMenuModel";
import { FunctionMenuRequest } from "#dep/types/MasterDataTypes";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {Validation} from "#dep/validation/Validation";
import {FunctionMenuValidation} from "#dep/validation/FunctionMenuValidation";

export const handleGetFunctionMenu = async (_req: Request, res: Response) => {
  try {
    let result = await getFunctionMenu();
    res.status(200).send({
      message: `Success get function menu`,
      data: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleCreateFunctionMenu = async (req: Request, res: Response) => {
  const today = new Date();
  const payload: FunctionMenuRequest = {
    id: uuidv4(),
    fm_code: req.body.fm_code,
    fm_name: req.body.fm_name,
    is_active: req.body.is_active,
    created_by: req.body.created_by,
    created_date: today,
  };

  try {
    const validatedRequest = Validation.validate(FunctionMenuValidation.CREATE, payload);
    let result = await createFunctionMenu(validatedRequest);
    res.status(200).send({
      message: `Success create function menu`,
      fm_code: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleDeleteFunctionMenu = async (req: Request, res: Response) => {
  try {
    const validatedId = Validation.validate(FunctionMenuValidation.ID, req.params.id);
    await deleteFunctionMenu(validatedId);
    res.status(200).send({
      message: `Success delete function menu`,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleUpdateFunctionMenu = async (req: Request, res: Response) => {
  try {
    const validatedRequest = Validation.validate(FunctionMenuValidation.UPDATE, req.body);
    const validatedId = Validation.validate(FunctionMenuValidation.ID, req.params.id);
    let result = await updateFunctionMenu(validatedRequest, validatedId);
    res.status(200).send({
      message: `Success update function menu`,
      fm_code: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};
