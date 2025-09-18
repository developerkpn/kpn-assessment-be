import ScopeModel from "@/models/ScopeModel.js";
import { NextFunction, Request, Response } from "express";

const ScopeController = {
  GetDataScope: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ScopeModel.GetScope();
      res.status(200).send({ data: result });
      return;
    } catch (error) {
      next(error);
    }
  },
};

export default ScopeController;
