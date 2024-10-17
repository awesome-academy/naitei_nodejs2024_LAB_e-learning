import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getAllComments, createComment, saveComment, findCommentById, deleteComment } from '@src/service/comment.service';

// Get the list of comments
export const commentList = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const comments = await getAllComments()
  res.json(comments);
});

export const commentCreateGet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // You can return an HTML form here if you're rendering views
    res.json({ message: 'Ready to create a new comment' });
  });

// Create a new comment
export const commentCreatePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { review_id, parent_id, comment_text } = req.body;

  const comment = await createComment({
    review_id,
    parent_id,
    comment_text,
  });

  res.status(201).json(comment);
});

// Get details of a specific comment
export const commentDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const comment = await findCommentById(parseInt(req.params.id))

  if (!comment) {
    res.status(404).json({ message: 'Comment not found' });
    return;
  }

  res.json(comment);
});

export const commentUpdateGet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const comment = await findCommentById(parseInt(req.params.id));
  
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }
  
    // You can return an HTML form here if you're rendering views
    // For now, let's return the comment data as JSON
    res.json(comment);
  });

// Update an existing comment
export const commentUpdatePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const comment = await findCommentById(parseInt(req.params.id))

  if (!comment) {
    res.status(404).json({ message: 'Comment not found' });
    return;
  }

  const { comment_text } = req.body;

  comment.comment_text = comment_text;

  await saveComment(comment)
  res.json(comment);
});

// Delete a comment
export const commentDeletePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const comment = await findCommentById(parseInt(req.params.id))

  if (!comment) {
    res.status(404).json({ message: 'Comment not found' });
    return;
  }

  await deleteComment(comment)
  res.status(204).send(); // No content to send back
});
