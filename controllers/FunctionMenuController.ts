import {
  createFunctionMenu,
  deleteFunctionMenu,
  getFunctionMenu,
  getFunctionMenuFinal,
  updateFunctionMenu,
} from "@/models/FunctionMenuModel.js";
import { FunctionMenuRequest } from "@/types/MasterDataTypes.js";
import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Validation } from "@/validation/Validation.js";
import { FunctionMenuValidation } from "@/validation/FunctionMenuValidation.js";

export const handleGetFunctionMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let result = await getFunctionMenu();
    res.status(200).send({
      message: `Success get function menu`,
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetFunctionMenuFinal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let result = await getFunctionMenuFinal();
    res.status(200).send({
      message: `Success get function menu`,
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleCreateFunctionMenu = async (req: Request, res: Response, next: NextFunction) => {
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
  } catch (e) {
    next(e);
  }
};

export const handleDeleteFunctionMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(FunctionMenuValidation.ID, req.params.id);
    await deleteFunctionMenu(validatedId);
    res.status(200).send({
      message: `Success delete function menu`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleUpdateFunctionMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedRequest = Validation.validate(FunctionMenuValidation.UPDATE, req.body);
    const validatedId = Validation.validate(FunctionMenuValidation.ID, req.params.id);
    let result = await updateFunctionMenu(validatedRequest, validatedId);
    res.status(200).send({
      message: `Success update function menu`,
      fm_code: result,
    });
  } catch (e) {
    next(e);
  }
};
