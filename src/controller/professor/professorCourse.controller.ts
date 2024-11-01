import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { updateStatus, checkProfessorAuthorization, getUserPurchasedCourses, getCoursesInfo, createCourse, updateCourse, deleteCourse } from 'src/service/course.service';
import { getAllCategories } from 'src/service/category.service';
import { getSectionsByCourseIds } from 'src/service/section.service';

export const professorCourseShowGet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user?.id;
    const isLoggedIn = Boolean(userId);

    const courses = await getCoursesInfo(userId);
    const courseIds = courses.map(course => course.id);
    const sections = await getSectionsByCourseIds(courseIds);
    const categories = await getAllCategories();
    const payments = isLoggedIn ? await getUserPurchasedCourses(userId) : [];
    const purchasedCourseIds = payments.map(payment => payment.course_id);
    const purchasedCourses = courses.filter(course => purchasedCourseIds.includes(course.id));

    return res.render('professor/courseManagement', {
      title: req.t('admin.course_management_title'),
      message: req.t('admin.course_management_message'),
      name: req.session!.user.name,
      sections,
      courses,
      isLoggedIn,
      categories,
      t: req.t,
    });
  } catch (error) {
    res.status(500).render('error', { message: req.t('course.course_error') }); 
  }
});

export const professorCreateCourse = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user?.id;
    if (isNaN(userId)) {
      throw new Error(req.t('course.invalid_professor_id')); 
    }
    const course = await createCourse({
      name: req.body.name,
      description: req.body.description,
      professor_id: userId,
      price: req.body.price,
      category_id: req.body.category_id,
      average_rating: req.body.average_rating,
    });

    res.redirect(`/professors/courses`);
  } catch (error) {
    res.status(400).json({ message: req.t('course.creation_error', { error: error.message }) }); // i18n for creation error
  }
};

export const professorUpdateCourse = async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.body.id);
    const userId = req.session!.user?.id;

    if (!userId) {
      return res.status(403).render('error', { message: req.t('login.not_authenticated') });
    }

    const isAuthorized = await checkProfessorAuthorization(courseId, userId);
    if (!isAuthorized) {
      return res.status(403).render('error', { message: req.t('professor.update_error') }); 
    }

    const updatedCourse = await updateCourse(courseId, req.body);
    if (!updatedCourse) {
      return res.status(404).render('error', { message: req.t('course.course_not_found') });
    }

    res.redirect(`/professors/courses`);
  } catch (error) {
    res.status(400).render('error', { message: req.t('course.update_error', { error: error.message }) }); 
  }
};

export const professorDeleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await deleteCourse(Number(id));

    if (!success) {
      res.status(404).render('error', { message: req.t('course.course_not_found') }); 
    }

    res.status(204).send();
  } catch (error) {
    res.status(400).render('error', { message: req.t('course.deletion_error', { error: error.message }) }); 
  }
};

export const updateCourseStatus = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updatedCourse = await updateStatus(Number(id));

    if (!updatedCourse) {
      res.status(404).json({ message: req.t('course.course_not_found') }); 
    }

    res.redirect(`/professors/courses`);
  } catch (error) {
    res.status(500).json({ message: req.t('course.internal_error') });
  }
};
