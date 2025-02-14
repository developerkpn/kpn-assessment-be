// import {NextFunction, Request, Response} from "express";
// import { v4 as uuidv4 } from "uuid";
// import {Validation} from "#dep/validation/Validation";
// import {BatchValidation} from "#dep/validation/BatchValidation";
// import {createBatch} from "#dep/models/BatchModel";
//
// export const handleCreateBatch = async(req: Request, res: Response, next: NextFunction) => {
//     try {
//         const validatedRequest = Validation.validate(BatchValidation.CREATE, req.body);
//
//         const batch: BatchHeaderRequest = {
//             id:  uuidv4(),
//             created_by: req.userDecode!.user_id,
//             created_at: new Date(),
//             ...validatedRequest
//         }
//
//         const result = await createBatch(validatedRequest);
//
//         res.status(201).send({
//
//         });
//
//
//
//
//
//     } catch (e) {
//         next(e);
//     }
// }