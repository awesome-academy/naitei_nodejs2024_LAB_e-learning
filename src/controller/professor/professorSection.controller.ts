import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getSectionsByCourseIds,updateSection, createSection, deleteSection, calculateTotalTimeAndLessons } from 'src/service/section.service';
import { getCoursesByUserId  } from 'src/service/course.service';
import { CreateSectionDto, UpdateSectionDto } from '@src/entity/dto/section.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';


export const professorCreateSection = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user?.id;
    const courseIds = req.body.course_id; 
    const names = req.body.name; 
    const totalTimes = req.body.total_time; 
    const totalLessons = req.body.total_lesson; 
    const validationErrors = [];

    for (let i = 0; i < names.length; i++) {
      const courseId = Number(courseIds[i]);

      if (isNaN(courseId)) {
          throw new Error("Invalid CourseId");
      }

      const sectionData = new CreateSectionDto();
      sectionData.name = names[i];
      sectionData.total_lesson = totalLessons[i] ? totalLessons[i] : undefined;
      sectionData.course_id = courseId;
      sectionData.total_time = totalTimes[i] ? totalTimes[i] : undefined;

      const errors = await validate(sectionData);

      if (errors.length > 0) {
        const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
        validationErrors.push(...messages);
      } else {
        await createSection(sectionData);
      }
    }

    if (validationErrors.length > 0) {
      res.status(400).render('error', { message: validationErrors.join(', ') });
      return;
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

    const sectionData = new UpdateSectionDto()
    sectionData.id = sectionId
    sectionData.name = req.body.name ? req.body.name : undefined
    sectionData.total_lesson = req.body.total_lesson ? req.body.total_lesson : undefined
    sectionData.total_time = req.body.total_time ? req.body.total_time : undefined
    
    const errors = await validate(sectionData);

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      res.status(400).render('error', { message: messages.join(', ') });
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