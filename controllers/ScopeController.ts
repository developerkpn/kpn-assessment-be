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
  GetScopebyUserId: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.userDecode?.user_id;
      const role_name = req.userDecode?.role_name;
      const result = await ScopeModel.GetScopeByUserId(id as string, role_name as string);
      res.status(200).send({
        data: result,
      });
      return;
    } catch (error) {
      next(error);
    }
  },
};

export default ScopeController;
