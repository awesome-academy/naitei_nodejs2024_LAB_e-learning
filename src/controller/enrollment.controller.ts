import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { updateEnrollmentProgress, enrollUserInCourse, getEnrollment, markLessonAsDone, hasUserPurchasedCourse, getEnrollmentWithCourseAndUser } from '../service/enrollment.service';
import { getProfessorAndCourseCountByCourseId, getSectionsWithLessons, countEnrolledUsersInCourse, getCourseById, getProfessorByCourse   } from '../service/course.service';
import { getAllCommentsByCourseId } from '../service/comment.service';
import { getUserById } from '@src/service/user.service';
import { getEnrollmentLesson } from '@src/service/enrollmentlesson.service';
import { getCategoryById } from '@src/service/category.service';

export const getUserCourseEnrollments = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const userId = req.session!.user?.id;
  const isLoggedIn = Boolean(userId);
  const userName = req.session!.user?.name;
  const userMail = req.session!.user?.email;
  const userRole = req.session!.user?.role; 

  if (!userId || !courseId) {
    return res.status(400).render('error', { message: req.t('course.userid_courseid_required') });
  }

  if (userRole !== 'professor') {
    const hasAccess = await hasUserPurchasedCourse(Number(userId), Number(courseId));
    
    if (!hasAccess) {
      return res.status(403).render('error', { message: req.t('course.purchase_course_error') });
    }
  }


  let enrollment = await getEnrollmentWithCourseAndUser(
    Number(userId),
    Number(courseId)
  );
  if (!enrollment) {
    enrollment = await enrollUserInCourse(userId, Number(courseId));
  }

  const course = await getCourseById(Number(courseId));
  const professor = await getProfessorByCourse(Number(courseId));
  const sectionsWithLessons = await getSectionsWithLessons(Number(courseId));
  const lessonProgress = await getEnrollmentLesson(enrollment.id)

  const totalHours = sectionsWithLessons.reduce((sum, section) => sum + section.total_time, 0);
  const totalLessons = sectionsWithLessons.reduce((sum, section) => sum + section.lessons.length, 0);
  const totalStudents = await countEnrolledUsersInCourse(Number(courseId));
  const allComments = await getAllCommentsByCourseId(Number(courseId));

  const professorCourseCount = await getProfessorAndCourseCountByCourseId(Number(courseId));
  let category
  if (course != null)
    category = await getCategoryById(Number(course.category_id))

  res.status(200).render('enrollment', {
    course,
    enrollment,
    title: req.t("home.course"),
    message: req.t("home.message"),
    name: professor?.name || 'Unknown Professor',
    totalHours,
    sectionsWithLessons,
    totalLessons,
    totalStudents,
    lessonProgress,
    allComments,
    category,
    userName,
    userMail,
    professorCourseCount,
    isLoggedIn,
    t: req.t,
    userId: req.session!.user?.id,
    user: req.session!.user,
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
