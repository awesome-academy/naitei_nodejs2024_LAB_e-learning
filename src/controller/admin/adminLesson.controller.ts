import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getAllLessons, createLesson, updateLesson, deleteLesson } from 'src/service/lession.service';

export const adminLesonShowGet = asyncHandler(async (req: Request, res: Response) => {
    try {
        const userId = req.session!.user?.id;
        const isLoggedIn = Boolean(userId);
        
        if (!isLoggedIn) {
        return res.status(403).render('error', { message: req.t('admin.not_logged_in') }); 
        }

        const lessons = await getAllLessons(); 

        if (!lessons) {
        return res.status(404).render('error', { message: req.t('admin.user_not_found') }); 
        }

        return res.render('admin/lessonManagement', {
        title: req.t('admin.user_management_title'),
        message: req.t('admin.user_management_message'),
        lessons, 
        isLoggedIn,
        t: req.t,
        });
    } catch (error) {
        console.error(error); 
        res.status(500).render('error', { message: req.t('course.course_error') });
    }
});

