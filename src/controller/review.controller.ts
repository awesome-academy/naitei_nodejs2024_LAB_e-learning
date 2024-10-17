import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { createReview, deleteReview, findReviewById, getAllReviews, saveReview } from '@src/service/review.service';

// Get the list of reviews
export const reviewList = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const reviews = getAllReviews()
  res.json(reviews);
});

export const reviewCreateGet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // You can return an HTML form here if you're rendering views
    res.json({ message: 'Ready to create a new review' });
  });

// Create a new review
export const reviewCreatePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { user_id, course_id, rating } = req.body;

  const review = createReview({
    user_id,
    course_id,
    rating,
  });

  res.status(201).json(review);
});

// Get details of a specific review
export const reviewDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const review = await findReviewById(parseInt(req.params.id))

  if (!review) {
    res.status(404).json({ message: 'Review not found' });
    return;
  }

  res.json(review);
});

export const reviewUpdateGet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const review = await findReviewById(parseInt(req.params.id));
  
    if (review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }
  
    // You can return an HTML form here if you're rendering views
    // For now, let's return the review data as JSON
    res.json(review);
  });

// Update an existing review
export const reviewUpdatePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const review = await findReviewById(parseInt(req.params.id))

  if (!review) {
    res.status(404).json({ message: 'Review not found' });
    return;
  }

  const { rating } = req.body;

  review.rating = rating;

  await saveReview(review)
  res.json(review);
});

// Delete a review
export const reviewDeletePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const review = await findReviewById(parseInt(req.params.id))

  if (!review) {
    res.status(404).json({ message: 'Review not found' });
    return;
  }

  await deleteReview(review)
  res.status(204).send(); // No content to send back
});
