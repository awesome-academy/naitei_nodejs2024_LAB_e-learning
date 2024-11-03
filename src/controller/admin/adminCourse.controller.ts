import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getUserPurchasedCourses, getCoursesWithSectionsAndHours } from 'src/service/course.service';
import { getSectionsByCourseId } from 'src/service/section.service';

export const adminCourseShowGet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user?.id;
    const isLoggedIn = Boolean(userId); 

    const courses = await getCoursesWithSectionsAndHours();
    const payments = isLoggedIn ? await getUserPurchasedCourses(userId) : [];
    const purchasedCourseIds = payments.map(payment => payment.course_id);
    const purchasedCourses = courses.filter(course => purchasedCourseIds.includes(course.id));

    return res.render('admin/courseManagement', {
        title: req.t('admin.course_management_title'),
        message: req.t('admin.course_management_message'),
        name: userId.name,
        courses,
        isLoggedIn,
        t: req.t,
      });
  } catch (error) {
    res.status(500).render('error', { message: req.t('course.course_error') });
  }
});

export const getCourseSections = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user?.id;
    const isLoggedIn = Boolean(userId);
    if (!isLoggedIn) {
      res.status(403).render('error', { message: req.t('admin.not_logged_in') });
    }

    const courseId = req.params.courseId;
    const sections = await getSectionsByCourseId(parseInt(courseId)); // Get sections for a specific course

    if (!sections || sections.length === 0) {
      res.status(404).render('error', { message: req.t('admin.section_not_found') });
    }

    return res.render('admin/sectionManagement', {
      title: req.t('admin.section_management_title'),
      message: req.t('admin.section_management_message'),
      sections,
      isLoggedIn,
      t: req.t,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: req.t('course.course_error') });
  }
});
  