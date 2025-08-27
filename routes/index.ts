import { Router } from "express";
const router = Router();
//import controllers here
import { isAuth } from "@/middleware/auth.js";
import { Batch } from "@/routes/Batch.js";
import { Category } from "@/routes/Category.js";
import EmailTemplate from "@/routes/EmailTemplate.js";
import GroupTest from "@/routes/GroupTest.js";
// import Guideline from "@/routes/GuideLine.js";
import Language from "@/routes/Language.js";
import Report from "@/routes/report/Report.js";
import SubTest from "@/routes/SubTest.js";
import Test from "@/routes/Test.js";
import Assessee from "@/routes/transactions/Assessee.js";
import Assessment from "@/routes/transactions/Assessment.js";
import AdminWeb from "./AdminWeb.js";
import Auth from "./Auth.js";
import BusinessUnit from "./BusinessUnit.js";
import Criteria from "./Criteria.js";
import FunctionMenu from "./FunctionMenu.js";
import Menu from "./Menu.js";
import Question from "./Question.js";
import Series from "./Series.js";
import TermsPP, { ShortBrief } from "./TermsPP.js";
import Proctoring from "./transactions/Proctoring.js";
// import Guideline from "@/routes/GuideLine.js";
import Translation from "@/routes/Translation.js";

//@using router
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
router.use("/api/languages", isAuth, Language);
router.use("/api/report", isAuth, Report);
// router.use("/api/guideline", Guideline, errorMiddleware);
router.use("/api/report", Report);
router.use("/api/languages", isAuth, Language);
router.use("/api/translation", isAuth, Translation);
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
