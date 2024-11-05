import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { updateStatus, checkProfessorAuthorization, getUserPurchasedCourses, getCoursesInfo, createCourse, updateCourse, deleteCourse } from 'src/service/course.service';
import { getSectionsByCourseIds } from 'src/service/section.service';
import { getAllCategories} from 'src/service/category.service';
import { error } from 'console';
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
    const courses = await getCoursesInfo(userId);
    const courseIds = courses.map(course => course.id);
    const sections = await getSectionsByCourseIds(courseIds);
    const sectionIds = sections.map(section => section.id);
    const lessons = await getLessonsBySectionIds(sectionIds);

    for (const section of sections) {
      const { total_time, total_lesson } = await calculateTotalTimeAndLessons(section.id);
      section.total_time = total_time;
      section.total_lesson = total_lesson;
    }
    
    const courseLessons: { [key: number]: { [key: number]: Lesson[] } } = {};
    sections.forEach(section => {
      if (!courseLessons[section.course_id]) {
        courseLessons[section.course_id] = {};
      }
      courseLessons[section.course_id][section.id] = [];
    });

    lessons.forEach(lesson => {
      const sectionId = lesson.section_id;
      const section = sections.find(sec => sec.id === sectionId);
      if (section) {
        const courseId = section.course_id;
        if (courseLessons[courseId] && courseLessons[courseId][sectionId]) {
          courseLessons[courseId][sectionId].push(lesson);
        }
      }
    });
    const lessonTypes = Object.values(LessonType);
    return res.render('professor/courseManagement', {
      title: req.t('admin.course_management_title'),
      message: req.t('admin.course_management_message'),
      name: req.session!.user.name,
      lessons,
      sections,
      courses,
      courseLessons,  
      lessonTypes,
      t: req.t,
    });
  } catch (error) {
    console.error("Error in professorCourseShowGet:", error);
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
    res.status(400).json({ message: req.t('course.creation_error', { error: error.message }) }); 
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
