import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { createComment } from "../service/comment.service";
import { createReview } from "@src/service/review.service";

export const createReviewPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { comment, parent_id, course_id, rating } = req.body;
    const user_id = req.session!.user?.id;
    const review = await createReview(user_id, rating, course_id);
    const newComment = await createComment(
      review.id,
      user_id,
      parent_id,
      comment
    );
    res.redirect(`/enrollments/${course_id}`);
  }
);
