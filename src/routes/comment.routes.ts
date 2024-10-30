import { Router } from "express";
import * as commentController from "../controller/comment.controller";
import { isUser } from "src/middleware/roleCheckMiddleware";

const router: Router = Router();

router.post("/create", isUser, commentController.createCommentPost);
router.delete("/:id", isUser, commentController.deleteCommentPost);
router.put("/update/:id", isUser, commentController.updateCommentPost);

export default router;
