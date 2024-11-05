import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getUserPurchasedCourses, getCoursesWithSectionsAndHours} from 'src/service/course.service';

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

  