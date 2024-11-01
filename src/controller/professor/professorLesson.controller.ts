import { Request, Response } from 'express';
import {  createLesson, updateLesson, deleteLesson } from 'src/service/lession.service';

export const professorCreateLesson = async (req: Request, res: Response) => {
    try {
        const sectionIds = req.body.section_id;
        const names = req.body.name;
        const types = req.body.type;
        const contents = req.body.content;
        const descriptions = req.body.description; 
        const times = req.body.time;


        for (let i = 0; i < names.length; i++) {
            const sectionId = Number(sectionIds[i]);
      
            if (isNaN(sectionId)) {
                throw new Error("Invalid sectionId");
            }
            await createLesson({
                name: names[i],
                type: types[i],
                section_id: sectionId, 
                content: contents[i],
                description: descriptions[i],
                time: times[i],
            });
          }

        res.redirect(`/professors/courses`);
    } catch (error) {
        res.status(400).render('error', { message: error.message });
    }
};

export const professorUpdateLesson = async (req: Request, res: Response) => {
    try {
        const lessonId = Number(req.body.id);
        const sectionId = Number(req.body.section_id); 
        if (isNaN(lessonId) || isNaN(sectionId)) {
            res.status(400).render('error', { message: 'Invalid lesson ID or section ID.' });
            return;
        }

        const updatedLesson = await updateLesson(lessonId, req.body);
        
        if (!updatedLesson) {
            res.status(404).render('error', { message: 'Lesson not found.' });
            return;
        }

        res.redirect(`/professors/courses`);
    } catch (error) {
        res.status(400).render('error', { error: error.message || 'An unexpected error occurred.' });
      }
};


export const professorDeleteLesson = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const success = await deleteLesson(Number(id)); 

        if (!success) {
        res.status(404).render('error', { message: 'Lesson not found.' });
        return;
        }
        res.status(204).send(); 
        res.redirect(`/professors/courses`);
    } catch (error) {
        res.status(400).render('error', { message: error.message });
    }
};