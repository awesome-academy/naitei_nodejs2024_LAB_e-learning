import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getReviewsWithDetails } from 'src/service/review.service'; 

export const adminReviewShowGet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user?.id;
    const isLoggedIn = Boolean(userId);
    
    if (!isLoggedIn) {
      return res.status(403).render('error', { message: req.t('admin.not_logged_in') });
    }

    const reviews = await getReviewsWithDetails();

    return res.render('admin/reviewManagement', {
      title: req.t('admin.review_management_title'),
      message: req.t('admin.review_management_message'),
      reviews,
      isLoggedIn,
      t: req.t,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: req.t('admin.review_error') });
  }
});
