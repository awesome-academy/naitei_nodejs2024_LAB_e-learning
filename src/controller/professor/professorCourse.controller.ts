import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { updateStatus, checkProfessorAuthorization, getUserPurchasedCourses, getCoursesInfo, createCourse, updateCourse, deleteCourse } from 'src/service/course.service';
import { getSectionsByCourseIds } from 'src/service/section.service';
import { getAllCategories } from 'src/service/category.service';
import { getLessonsBySectionIds } from 'src/service/lession.service';
import { calculateTotalTimeAndLessons } from "../../service/section.service";
import { LessonType } from '../../enum/lesson.enum';
import { CreateCourseDto } from 'src/entity/dto/course.dto';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

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
    const categories = await getAllCategories();
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
      categories,
      courses,
      courseLessons,  
      lessonTypes,
      courseData: {},  // Empty courseData for new form
      errors: [],       // Empty errors for initial load
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
    const courseData = new CreateCourseDto();
    courseData.name = typeof req.body.name === 'string' ? req.body.name : String(req.body.name);
    courseData.description = typeof req.body.description === 'string' ? req.body.description : String(req.body.description);
    courseData.price = req.body.price ? parseInt(req.body.price) : 0;
    courseData.category_id = req.body.category_id ? parseInt(req.body.category_id) : 0;
    courseData.average_rating = req.body.average_rating ? parseFloat(req.body.average_rating) : 0;
    

    await validateOrReject(courseData);

    const course = await createCourse({
      name: req.body.name,
      description: req.body.description,
      professor_id: userId,
      price: req.body.price,
      category_id: req.body.category_id,
      average_rating: req.body.average_rating,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    if (Array.isArray(error) && error[0].constraints) {
      const validationErrors = error.map(err => ({
        property: err.property,
        messages: Object.values(err.constraints),
      }));
      res.status(400).json({ errors: validationErrors });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

export const professorUpdateCourse = async (req: Request, res: Response): Promise<void> => {
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

    const courseData = new CreateCourseDto();
    courseData.category_id = req.body.category_id ? parseInt(req.body.category_id) : 0
    courseData.description = req.body.description ? req.body.description : undefined
    courseData.name = req.body.name ? req.body.name : undefined
    courseData.price = req.body.price ? parseInt(req.body.price) : 0

    await validateOrReject(courseData)

    const updatedCourse = await updateCourse(courseId, req.body);
    if (!updatedCourse) {
      return res.status(404).render('error', { message: req.t('course.course_not_found') });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    if (Array.isArray(error) && error[0].constraints) {
      const validationErrors = error.map(err => ({
        property: err.property,
        messages: Object.values(err.constraints),
      }));
      res.status(400).json({ errors: validationErrors });
    } else {
      res.status(400).json({ error: error.message });
    }
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