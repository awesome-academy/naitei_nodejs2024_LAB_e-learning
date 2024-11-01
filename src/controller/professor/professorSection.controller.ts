import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getSectionsByCourseIds,updateSection, createSection, deleteSection, calculateTotalTimeAndLessons } from 'src/service/section.service';
import { getCoursesByUserId  } from 'src/service/course.service';


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

    res.redirect(`/professors/courses`);
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
      res.status(404).render('error', { message: req.t('professor.section_not_found')});
      return;
    }

    res.redirect(`/professors/courses`);
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
  } catch (error) {
    res.status(400).render('error',{ message: error.message });
  }
};