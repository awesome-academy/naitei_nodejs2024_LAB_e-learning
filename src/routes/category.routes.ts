import { Router } from "express";
import * as categoryController from "../controller/category.controller";

const router: Router = Router();

router.get("/", categoryController.getAllCategory);

export default router;
