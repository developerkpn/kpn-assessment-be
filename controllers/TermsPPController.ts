import { BRIEF_ID, PP_ID, TERMS_ID } from "#dep/constant";
import {
  getShortBrief,
  getTermsPP,
  updateShortBrief,
  updateTermsPP,
} from "#dep/models/TermsPPModel";
import { BriefRequest, TermsPPRequest } from "#dep/types/MasterDataTypes";
import { Request, Response } from "express";
import {Validation} from "#dep/validation/Validation";
import {TermsPPValidation} from "#dep/validation/TermsPPValidation";

export const handleGetTermsPP = async (_req: Request, res: Response) => {
  let data = { terms: "", pp: "" };

  try {
    let result = await getTermsPP();
    result.forEach((row) => {
      if (row.id === TERMS_ID) {
        data.terms = row;
      }
      if (row.id === PP_ID) {
        data.pp = row;
      }
    });
    res.status(200).send({
      message: `Success get terms & PP`,
      data: data,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleUpdateTerms = async (req: Request, res: Response) => {
  const today = new Date();
  const payload: TermsPPRequest = {
    name: req.body.name,
    updated_by: req.body.updated_by,
    updated_date: today,
  };

  try {
    const validatedRequest = Validation.validate(TermsPPValidation.UPDATETERMS, payload);
    let result = await updateTermsPP(validatedRequest, TERMS_ID);
    res.status(200).send({
      message: `Success update terms`,
      id: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleUpdatePP = async (req: Request, res: Response) => {
  const today = new Date();
  const payload: TermsPPRequest = {
    name: req.body.name,
    updated_by: req.body.updated_by,
    updated_date: today,
  };

  try {
    const validatedRequest = Validation.validate(TermsPPValidation.UPDATEPP, payload);
    let result = await updateTermsPP(validatedRequest, PP_ID);
    res.status(200).send({
      message: `Success update privacy policy`,
      id: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGetBrief = async (req: Request, res: Response) => {
  try {
    let result = await getShortBrief();
    res.status(200).send({
      message: `Success get short brief`,
      data: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleUpdateBrief = async (req: Request, res: Response) => {
  const today = new Date();
  const payload: BriefRequest = {
    short_brief_name: req.body.short_brief_name,
    updated_by: req.body.updated_by,
    updated_date: today,
  };
  try {
    const validatedRequest = Validation.validate(TermsPPValidation.UPDATESB, payload);
    let result = await updateShortBrief(validatedRequest, BRIEF_ID);
    res.status(200).send({
      message: `Success update short brief`,
      id: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};
