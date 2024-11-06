import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { createComment } from "../service/comment.service";
import { createReview } from "src/service/review.service";
import { CreateReviewDto } from "src/entity/dto/review.dto";
import { CreateCommentDto } from "src/entity/dto/comment.dto";
import { validateOrReject } from "class-validator";

export const createReviewPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { comment, parent_id, course_id, rating } = req.body;
    const user_id = req.session!.user?.id;
    if (!user_id) {
      return res.status(400).render("error", { message: "User is not logged in." });
    }

    const reviewDto = new CreateReviewDto();
    reviewDto.user_id = parseInt(user_id);
    reviewDto.course_id = parseInt(course_id);
    reviewDto.rating = parseInt(rating);

    const commentDto = new CreateCommentDto();
    commentDto.review_id = 0;
    commentDto.user_id = parseInt(user_id);
    commentDto.parent_id = parent_id ? parseInt(parent_id) : 0;
    commentDto.comment = comment;

    try {
      await validateOrReject(reviewDto);
      const review = await createReview(user_id, rating, course_id);

      commentDto.review_id = review.id;
      await validateOrReject(commentDto);

      await createComment(review.id, user_id, parent_id, comment);
      res.redirect(`/enrollments/${course_id}`);
    } catch (error) {
      if (Array.isArray(error) && error[0].constraints) {
        // Handle validation errors
        const validationErrors = error.map(err => Object.values(err.constraints)).flat();
        res.status(400).render("error", { error: validationErrors.join(', ') });
      } else {
        res.status(400).render("error", { error: error.message });
      }
    }
  }
);
