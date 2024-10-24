import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getSectionsByCourseIds,updateSection, createSection, deleteSection, calculateTotalTimeAndLessons } from 'src/service/section.service';
import { getCoursesByUserId  } from 'src/service/course.service';


export const professorSectionShowGet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user?.id;
    const isLoggedIn = Boolean(userId);

    if (!isLoggedIn) {
      return res.status(403).render('error', { message: req.t('admin.not_logged_in') });
    }

    const courses = await getCoursesByUserId(userId);

    if (!courses || courses.length === 0) {
      return res.status(404).render('error', { message: req.t('admin.no_courses_found') });
    }

    const courseIds = courses.map(course => course.id);
    let sections = await getSectionsByCourseIds(courseIds);

    for (let section of sections) {
      const { total_time, total_lesson } = await calculateTotalTimeAndLessons(section.id);
      section.total_time = total_time;  
      section.total_lesson = total_lesson;  
    }

    return res.render('professor/sectionManagement', {
      title: req.t('admin.user_management_title'),
      message: req.t('admin.user_management_message'),
      sections, 
      courses,
      isLoggedIn,
      t: req.t,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: req.t('course.course_error') });
  }
});


export const professorCreateSection = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user?.id;
    const courseIds = req.body.course_id; 
    const names = req.body.name; 
    const totalTimes = req.body.total_time; 
    const totalLessons = req.body.total_lesson; 

    for (let i = 0; i < names.length; i++) {
      const courseId = Number(courseIds[i]);

      if (isNaN(courseId)) {
          throw new Error("Invalid CourseId");
      }

      await createSection({
          name: names[i],
          total_lesson: totalLessons[i],
          course_id: courseId, 
          total_time: totalTimes[i],
      });
    }

    res.redirect(`/professors/sections`);
  } catch (error) {
    res.status(400).render('error', { message: error.message });
  }
};


export const professorUpdateSection = async (req: Request, res: Response) => {
  try {
    const sectionId = Number(req.body.id);
    const userId = req.session!.user?.id; 

    if (isNaN(sectionId) || isNaN(userId)) {
      res.status(400).render('error', { message: 'Invalid section ID or user ID.' });
      return;
    }

    const updatedSection = await updateSection(sectionId, req.body);

    if (!updatedSection) {
      console.error('Failed to update section:', sectionId);
      res.status(404).render('error', { message: req.t('professor.section_not_found')});
      return;
    }

    res.redirect(`/professors/sections`);
  } catch (error) {
    res.status(400).render('error', { message: error.message });
  }
};

export const professorDeleteSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await deleteSection(Number(id)); 
    if (!success) {
      res.status(404).render('error', { message: req.t('professor.section_not_found')});
      return;
    }
    res.status(204).send(); 
    // res.redirect(`/professors/sections`);
  } catch (error) {
    res.status(400).render('error',{ message: error.message });
  }
};