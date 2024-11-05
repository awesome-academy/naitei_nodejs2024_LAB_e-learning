import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { updateEnrollmentProgress, getEnrollment, markLessonAsDone, hasUserPurchasedCourse, getEnrollmentWithCourseAndUser, enrollUserInCourse } from '../service/enrollment.service';
import { getSectionsWithLessons, countEnrolledUsersInCourse, getCourseById, getProfessorByCourse   } from '../service/course.service';
import { getAllCommentsByCourseId } from '../service/comment.service';
import { getUserById } from '@src/service/user.service';
import { getEnrollmentLesson } from '@src/service/enrollmentlesson.service';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GetUserCourseEnrollmentsDto, UpdateLessonProgressDto } from '@src/entity/dto/entrollment.dto';


export const getUserCourseEnrollments = asyncHandler(async (req: Request, res: Response) => {
  const  {courseId}  = req.params;
  const userId = req.session!.user?.id;
  // validate
  const dto = plainToInstance(GetUserCourseEnrollmentsDto, { courseId });
  await validateOrReject(dto);

  const isLoggedIn = Boolean(userId);
  const userName = req.session!.user?.name;
  const userMail = req.session!.user?.email;
  
  if (!userId || !courseId) {
    return res.status(400).render('error', { message: req.t('course.userid_courseid_required')  });
  }

  const hasAccess = await hasUserPurchasedCourse(
    Number(userId),
    Number(courseId)
  );

  let enrollment = await getEnrollmentWithCourseAndUser(
    Number(userId),
    Number(courseId)
  );

  if (!enrollment) {
    enrollment = await enrollUserInCourse(userId, Number(courseId));
  }

  if (!enrollment || !enrollment.course) {
    return res.status(404).render('error', { message: req.t('course.enrollment_error')  });
  }

  const course = await getCourseById(Number(courseId));
  const professor = await getProfessorByCourse(Number(courseId));
  const sectionsWithLessons = await getSectionsWithLessons(Number(courseId));

  const totalHours = sectionsWithLessons.reduce((sum, section) => sum + section.total_time, 0);
  const totalLessons = sectionsWithLessons.reduce((sum, section) => sum + section.lessons.length, 0);
  const totalStudents = await countEnrolledUsersInCourse(Number(courseId));
  const allComments = await getAllCommentsByCourseId(Number(courseId));
  const lessonProgress = await getEnrollmentLesson(enrollment.id)
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
    allComments,
    userName,
    userMail,
    isLoggedIn,
    lessonProgress,
    t: req.t,
    userId: req.session!.user?.id,
  });
});

export const updateLessonProgress = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {  courseId, lessonId } = req.params;
  const userId = req.session!.user?.id;

  // Validate request parameters
  const dto = plainToInstance(UpdateLessonProgressDto, { courseId, lessonId });
  await validateOrReject(dto);
  
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
