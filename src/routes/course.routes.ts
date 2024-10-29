import { Router } from "express";
import * as courseController from "../controller/course.controller";

const router: Router = Router();

router.get("/all", courseController.courseShowGet);
router.get("/", courseController.courseGet);
router.get("/:id", courseController.getCourseDetail);
export default router;
