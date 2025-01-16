import { Router } from "express";
const router = Router();
//import controllers here
import BusinessUnit from "./BusinessUnit";
import Auth from "./Auth";
import TermsPP, { ShortBrief } from "./TermsPP";
import { hashPassword } from "#dep/helper/auth/password";
import AdminWeb from "./AdminWeb";
import Series from "./Series";
import Criteria from "./Criteria";
import FunctionMenu from "./FunctionMenu";
import { isAuth } from "#dep/middleware/auth";
import Question from "./Question";
import Menu from "./Menu";
import {Category} from "#dep/routes/Category";

//#depusing router
// router.use('/api/<endpoint>', <controller>)
router.use("/api/auth", Auth);
router.use("/api/admin", AdminWeb);
router.use("/api/bu", isAuth, BusinessUnit);
router.use("/api/terms-pp", isAuth, TermsPP);
router.use("/api/short-brief", isAuth, ShortBrief);
router.use("/api/series", isAuth, Series);
router.use("/api/criteria", isAuth, Criteria);
router.use("/api/function-menu", isAuth, FunctionMenu);
router.use("/api/question", isAuth, Question);
router.use("/api/menu", isAuth, Menu);
router.use("/api/category", isAuth, Category)

router.use("/api/check", (req, res) => {
  res.status(200).send({
    message: "Connected",
  });
});

// router.post("/api/hash", async (req, res) => {
//   const password = req.body.password;
//   const hashed = await hashPassword(password);
//   res.status(200).send({
//     hashed: hashed,
//   });
// });

// router.get("/api/example", Example.exampleMethod);

export default router;
