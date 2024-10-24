import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getAllSections, updateSection, createSection, deleteSection } from 'src/service/section.service';


export const adminSectionShowGet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user?.id;
    const isLoggedIn = Boolean(userId);
    if (!isLoggedIn) {
      return res.status(403).render('error', { message: req.t('admin.not_logged_in') }); 
    }

    const sections = await getAllSections(); 

    if (!sections) {
      return res.status(404).render('error', { message: req.t('admin.user_not_found') }); 
    }

    return res.render('admin/sectionManagement', {
      title: req.t('admin.user_management_title'),
      message: req.t('admin.user_management_message'),
      sections, 
      isLoggedIn,
      t: req.t,
    });
  } catch (error) {
    console.error(error); 
    res.status(500).render('error', { message: req.t('course.course_error') });
  }
});

