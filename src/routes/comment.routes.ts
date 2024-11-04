import { Router } from "express";
import * as commentController from "../controller/comment.controller";
import { isUser, isProfessor } from "src/middleware/roleCheckMiddleware";

const router: Router = Router();

router.post("/create",commentController.createCommentPost);
router.delete("/:id",  commentController.deleteCommentPost);
router.put("/update/:id",commentController.updateCommentPost);

export default router;
