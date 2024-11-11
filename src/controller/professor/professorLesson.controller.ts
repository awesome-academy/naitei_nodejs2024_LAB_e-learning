import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getLessonsBySectionIds, createLesson, updateLesson, deleteLesson } from 'src/service/lession.service';
import { getCoursesByUserId  } from 'src/service/course.service';
import { getSectionsByCourseIds } from 'src/service/section.service';
import { validateOrReject, ValidationError  } from 'class-validator';
import { LessonCreateDto, LessonUpdateDto } from 'src/entity/dto/lesson.dto';


export const professorCreateLesson = asyncHandler(async (req: Request, res: Response) => {
    try {
      const sectionIds = Array.isArray(req.body.section_id) ? req.body.section_id : [req.body.section_id];
      const names = Array.isArray(req.body.name) ? req.body.name : [req.body.name];
      const types = Array.isArray(req.body.type) ? req.body.type : [req.body.type];
      const contents = Array.isArray(req.body.content) ? req.body.content : [req.body.content];
      const descriptions = Array.isArray(req.body.description) ? req.body.description : [req.body.description];
      const times = Array.isArray(req.body.time) ? req.body.time : [req.body.time];
  
      const validationErrors: { property: string; messages: string[] }[] = [];
  
      for (let i = 0; i < names.length; i++) {
        const lessonData = new LessonCreateDto();
        lessonData.name = names[i];
        lessonData.type = types[i];
        lessonData.section_id = Number(sectionIds[i]);
        lessonData.content = contents[i];
        lessonData.description = descriptions[i];
        lessonData.time = times[i];
  
        try {
          await validateOrReject(lessonData);
        } catch (errors) {
          (errors as ValidationError[]).forEach((error: ValidationError) => {
            validationErrors.push({
              property: `${error.property}_${i}`,
              messages: error.constraints ? Object.values(error.constraints) : [],
            });
          });
        }
      }
  
      if (validationErrors.length > 0) {
        res.status(400).json({ errors: validationErrors });
        return;
      }
  
      const savedLessons = [];
      for (let i = 0; i < names.length; i++) {
        const newLesson = await createLesson({
          name: names[i],
          type: types[i],
          section_id: Number(sectionIds[i]),
          content: contents[i],
          description: descriptions[i],
          time: times[i],
        });
        savedLessons.push(newLesson);
      }
  
      res.status(200).json({ success: true, lessons: savedLessons });
    } catch (error) {
      console.error("Error creating lesson:", error);
      res.status(400).json({ errors: [{ property: 'general', messages: [error.message || "An unexpected error occurred"] }] });
    }
  });
  
  export const professorUpdateLesson = asyncHandler(async (req: Request, res: Response) => {
    try {
      const lessonId = Number(req.body.id);
      const sectionId = Number(req.body.section_id);
  
      if (isNaN(lessonId) || isNaN(sectionId)) {
        res.status(400).json({ errors: [{ property: 'id', messages: ['Invalid lesson ID or section ID.'] }] });
        return;
      }
  
      const lessonData = new LessonUpdateDto();
      lessonData.name = req.body.name;
      lessonData.type = req.body.type;
      lessonData.content = req.body.content;
      lessonData.description = req.body.description;
      lessonData.time = req.body.time;
  
      await validateOrReject(lessonData);
  
      const updatedLesson = await updateLesson(lessonId, lessonData);
  
      if (!updatedLesson) {
        res.status(404).json({ errors: [{ property: 'general', messages: ['Lesson not found.'] }] });
        return;
      }
  
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error updating lesson:", error);
  
      if (Array.isArray(error) && error[0] instanceof ValidationError) {
        const validationErrors = error.map(err => ({
          property: err.property,
          messages: Object.values(err.constraints),
        }));
        res.status(400).json({ errors: validationErrors });
      } else {
        res.status(400).json({ errors: [{ property: 'general', messages: [error.message || 'An unexpected error occurred'] }] });
      }
    }
  });

export const professorDeleteLesson = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const success = await deleteLesson(Number(id)); 

        if (!success) {
        res.status(404).render('error', { message: 'Lesson not found.' });
        return;
        }
        res.status(204).send(); 
    } catch (error) {
        res.status(400).render('error', { message: error.message });
    }
};
