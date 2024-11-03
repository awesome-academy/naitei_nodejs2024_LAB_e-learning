import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getCommentsWithDetails } from 'src/service/comment.service'; 

export const adminCommentShowGet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user?.id;
    const isLoggedIn = Boolean(userId);
    
    if (!isLoggedIn) {
      return res.status(403).render('error', { message: req.t('admin.not_logged_in') });
    }

    const comments = await getCommentsWithDetails();

    return res.render('admin/commentManagement', {
      title: req.t('admin.comment_management_title'),
      message: req.t('admin.comment_management_message'),
      comments,
      isLoggedIn,
      t: req.t,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: req.t('admin.comment_error') });
  }
});
