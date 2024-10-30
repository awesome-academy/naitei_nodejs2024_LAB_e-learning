import { Router } from "express";
import * as reviewController from "../controller/review.controller";

const router: Router = Router();

// Public access: Get the list of comments
router.post("/create", reviewController.createReviewPost);
// Admin only: Delete a comment

export default router;
