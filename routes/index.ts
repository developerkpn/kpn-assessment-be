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
import { Category } from "#dep/routes/Category";
import SubTest from "#dep/routes/SubTest";
import GroupTest from "#dep/routes/GroupTest";
import Test from "#dep/routes/Test";
import { Batch } from "#dep/routes/Batch";
import EmailTemplate from "#dep/routes/EmailTemplate";
import Assessment from "#dep/routes/transactions/Assessment";
import Proctoring from "./transactions/Proctoring";
import Assessee from "#dep/routes/transactions/Assessee";
import Report from "#dep/routes/report/Report";

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
router.use("/api/category", isAuth, Category);
router.use("/api/subtest", isAuth, SubTest);
router.use("/api/test", isAuth, Test);
router.use("/api/grouptest", isAuth, GroupTest);
router.use("/api/batch", isAuth, Batch);
router.use("/api/email-template", isAuth, EmailTemplate);
router.use("/api/assessment", Assessment);
router.use("/api/proctoring", Proctoring);
router.use("/api/assessee", Assessee);
router.use("/api/report", Report);
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
