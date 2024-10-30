import { findChildComments, updateComment } from "./../service/comment.service";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  getAllComments,
  findCommentById,
  deleteComment,
  createComment,
} from "../service/comment.service";

export const deleteCommentPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const commentId = parseInt(req.params.id);
    const currentUserId = req.session!.user?.id;

    const comment = await findCommentById(commentId);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    // Kiểm tra xem người dùng có quyền xóa bình luận hay không
    if (comment.user_id !== currentUserId) {
      res.status(403).json({ message: "Unauthorized to delete this comment" });
      return;
    }

    // Tìm các comment con
    const childComments = await findChildComments(commentId);

    // Xóa tất cả các comment con
    await Promise.all(
      childComments.map((childComment) => deleteComment(childComment.id))
    );

    // Xóa comment cha
    await deleteComment(commentId);

    res.json({
      message: "Comment and its child comments deleted successfully",
    });
  }
);

export const updateCommentPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const commentId = parseInt(req.params.id);
    const updatedText = req.body.comment_text;
    const currentUserId = req.session!.user?.id;

    const comment = await findCommentById(commentId);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    // Check if current user is the owner of the comment
    if (comment.user_id !== currentUserId) {
      res.status(403).json({ message: "Unauthorized to edit this comment" });
      return;
    }

    // Update comment and save to database
    comment.comment_text = updatedText;
    try {
      await updateComment(comment);
      res.json({ message: "Comment updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating comment", error });
    }
  }
);

export const createCommentPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { review_id, reply, parent_id, course_id } = req.body;
    const user_id = req.session!.user?.id;

    const comment = await createComment(review_id, user_id, parent_id, reply);
    res.redirect(`/enrollments/${course_id}`);
  }
);
