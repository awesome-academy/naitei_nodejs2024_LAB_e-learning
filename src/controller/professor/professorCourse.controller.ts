import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getSectionsWithLessons, checkProfessorAuthorization, getUserPurchasedCourses, getCoursesInfo, createCourse, updateCourse, deleteCourse} from 'src/service/course.service';
import { getAllCategories} from 'src/service/category.service';
import { error } from 'console';
import { getSectionsByCourseIds} from 'src/service/section.service';
import { getLessonsBySectionIds } from 'src/service/lession.service';
import { calculateTotalTimeAndLessons } from "../../service/section.service";
import { LessonType } from '../../enum/lesson.enum';

export interface Lesson {
  id: number;
  name: string;
  description: string;
  time: number;
  type: string;
  content: string;
  section_id: number;
}


export const professorCourseShowGet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user?.id;
    const isLoggedIn = Boolean(userId);

    const courses = await getCoursesInfo(userId);
    const courseIds = courses.map(course => course.id);
    const sections = await getSectionsByCourseIds(courseIds);
    const sectionIds = sections.map(section => section.id);
    const lessons: Lesson[] = await getLessonsBySectionIds(sectionIds);

    for (const section of sections) {
      const { total_time, total_lesson } = await calculateTotalTimeAndLessons(section.id);
      section.total_time = total_time;
      section.total_lesson = total_lesson;
    }

    const categories = await getAllCategories();
    const payments = isLoggedIn ? await getUserPurchasedCourses(userId) : [];
    const purchasedCourseIds = payments.map(payment => payment.course_id);
    const purchasedCourses = courses.filter((course) =>
      purchasedCourseIds.includes(course.id)
    );
    const courseLessons: { [key: number]: Lesson[] } = {};
    lessons.forEach(lesson => {
      const section = sections.find(section => section.id === lesson.section_id);
      if (section) {
        const courseId = section.course_id;
        if (!courseLessons[courseId]) {
          courseLessons[courseId] = [];
        }
        courseLessons[courseId].push(lesson);
      }
    });
    const lessonTypes = Object.values(LessonType);
    return res.render('professor/courseManagement', {
      title: req.t('admin.course_management_title'),
      message: req.t('admin.course_management_message'),
      name: req.session!.user.name,
      sections,
      courses,
      courseLessons,  
      isLoggedIn,
      lessonTypes,
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
          throw new Error("Invalid professorId");
      }
      const course = await createCourse({
          name: req.body.name,
          description: req.body.description,
          professor_id: userId, 
          price: req.body.price,
          category_id: req.body.category_id,
          average_rating: req.body.average_rating
      });

      res.redirect(`/professors/courses`);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
};

  
export const professorUpdateCourse = async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.body.id);
    const userId = req.session!.user?.id; 

    if (!userId) {
      return res.status(403).render('error', { message: req.t('login.not-authentication') });
    }

    const isAuthorized = await checkProfessorAuthorization(courseId, userId);
    if (!isAuthorized) {
      return res.status(403).render('error', { message: req.t('professor.update_error') });
    }

    const updatedCourse = await updateCourse(courseId, req.body);
    if (!updatedCourse) {
      return res.status(404).render('error', { message: req.t('course.course_error_notfound') });
    }

    res.redirect(`/professors/courses`);
  }  catch (error) {
    res.status(400).render('error', { error: error.message || 'An unexpected error occurred.' });
  }
};
  
export const professorDeleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await deleteCourse(Number(id)); 

    if (!success) {
      res.status(404).render('error', { message: req.t('course.course_error_notfound') });
      return;
    }
    
    res.status(204).send(); 
  } catch (error) {
    res.status(400).render('error', { message: error.message });
  }
};
  