import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { updateEnrollmentProgress, getEnrollment, markLessonAsDone, hasUserPurchasedCourse, getEnrollmentWithCourseAndUser } from '../service/enrollment.service';
import { getSectionsWithLessons, countEnrolledUsersInCourse, getCourseById, getProfessorByCourse   } from '../service/course.service';


export const getUserCourseEnrollments = asyncHandler(async (req: Request, res: Response) => {
  const  {courseId}  = req.params;
  const userId = req.session!.user?.id;
  if (!userId || !courseId) {
    return res.status(400).render('error', { message: req.t('course.userid_courseid_required')  });
  }

  const hasAccess = await hasUserPurchasedCourse(Number(userId), Number(courseId));

  if (!hasAccess) {
    return res.status(403).render('error', { message: req.t('course.purchase_course_error')  });
  }

  const enrollment = await getEnrollmentWithCourseAndUser(Number(userId), Number(courseId));

  if (!enrollment || !enrollment.course) {
    return res.status(404).render('error', { message: req.t('course.enrollment_error')  });
  }

  const course = await getCourseById(Number(courseId));
  const professor = await getProfessorByCourse(Number(courseId));
  const sectionsWithLessons = await getSectionsWithLessons(Number(courseId));

  const totalHours = sectionsWithLessons.reduce((sum, section) => sum + section.total_time, 0);
  const totalLessons = sectionsWithLessons.reduce((sum, section) => sum + section.lessons.length, 0);
  const totalStudents = await countEnrolledUsersInCourse(Number(courseId));

  res.status(200).render('enrollment', {
    course,
    enrollment,
    name: professor?.name || 'Unknown Professor',
    totalHours,
    sectionsWithLessons,
    totalLessons,
    totalStudents,
    t: req.t,
  });
});

export const updateLessonProgress = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {  courseId, lessonId } = req.params;
  const userId = req.session!.user?.id;
  
  if (!userId || !courseId || !lessonId) {
    return res.status(404).render('error', { message: req.t('course.enrollment_not_found')  });
  }

  const enrollment = await getEnrollment(+userId, +courseId);
  if (!enrollment) {
    return res.status(404).render('error', { message: req.t('course.enrollment_not_found')  });
  }

  try {
    const updatedLesson = await markLessonAsDone(+lessonId, enrollment.id);
    await updateEnrollmentProgress(enrollment.id);

    res.redirect(`/enrollments/${courseId}`);
  } catch (error) {
    return res.status(404).render('error', { message: req.t('course.progress_error')  });
  }
});
