import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { createLesson, deleteLesson, findLessonById, getAllLessons, saveLesson } from '../service/lession.service';
import { plainToInstance } from 'class-transformer';
import { LessonCreateDto, LessonUpdateDto } from '@src/entity/dto/lesson.dto';
import { validate } from 'class-validator';

// Get the list of lessons
export const lessonList = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const lessons = await getAllLessons()
  res.json(lessons);
});

export const lessonCreateGet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    res.json({ message: 'Ready to create a new lesson' });
  });

export const lessonCreatePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const lessonData = plainToInstance(LessonCreateDto, req.body);
  const errors = await validate(lessonData);

  if (errors.length > 0) {
    const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
    res.status(400).render('error', { message: messages.join(', ') });
  }
  const { name, progress, type, content, description, time, section_id } = lessonData;

  const lesson = createLesson({
    name,
    progress,
    type,
    content,
    description,
    time,
    section_id,
  });
  res.status(201).json(lesson);
});

export const lessonDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const lesson = await findLessonById(parseInt(req.params.id))

  if (!lesson) {
    return res.status(404).render('error', { message: req.t('course.lesson_not_found')  });
  }

  res.json(lesson);
});

export const lessonUpdateGet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const lesson = await findLessonById(parseInt(req.params.id));

    if (!lesson) {
      return res.status(404).render('error', { message: req.t('course.lesson_not_found')  });
    }

    res.json(lesson);
  });

// Update an existing lesson
export const lessonUpdatePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const lesson = await findLessonById(parseInt(req.params.id))

  if (!lesson) {
    return res.status(404).render('error', { message: req.t('course.lesson_not_found')  });
  }

  const lessonData = plainToInstance(LessonUpdateDto, req.body);
  const errors = await validate(lessonData);

  if (errors.length > 0) {
    const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
    res.status(400).render('error', { message: messages.join(', ') });
  }

  const { name, progress, type, content, description, time } = lessonData;

  if (name) lesson.name = name;
  if (progress !== undefined) lesson.progress = progress;
  if (type) lesson.type = type;
  if (content) lesson.content = content;
  if (description) lesson.description = description;
  if (time) lesson.time = time;

  await saveLesson(lesson)
  res.json(lesson);
});
