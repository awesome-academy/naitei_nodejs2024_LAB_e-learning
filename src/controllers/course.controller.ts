import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getAllCourses, 
  getCourseById, 
  createCourse, 
  deleteCourse, 
  updateCourse, 
} from '../service/course.service';

export const courseList = 
    asyncHandler(async (req: Request, res: Response) => {
      const courses = await getAllCourses();
      res.status(200).json(courses);
    });

export const courseDetails = 
    asyncHandler(async (req: Request, res: Response) => {
      const courseId = parseInt(req.params.id);
      const course = await getCourseById(courseId);

      if (course) {
        res.status(200).json(course);
      } else {
        res.status(404).json({ message: 'Course not found' });
      }
    });

export const createCourseGet = 
    asyncHandler(async (req: Request, res: Response) => {
      res.status(200).json({ message: 'Provide course data to create a course' });
    });

export const createCoursePost = 
    asyncHandler(async (req: Request, res: Response) => {
      const courseData = req.body; 
      const newCourse = await createCourse(courseData);
      res.status(201).json(newCourse);
    });

export const deleteCourseGet = 
    asyncHandler(async (req: Request, res: Response) => {
      res.status(200).json({ message: 'Confirm course deletion' });
    });

export const deleteCoursePost = 
    asyncHandler(async (req: Request, res: Response) => {
      const courseId = parseInt(req.params.id);
      const course = await getCourseById(courseId);

      if (course) {
        await deleteCourse(course);
        res.status(200).json({ message: 'Course deleted' });
      } else {
        res.status(404).json({ message: 'Course not found' });
      }
    });

export const updateCourseGet = 
    asyncHandler(async (req: Request, res: Response) => {
      res.status(200).json({ message: 'Provide updated course data' });
    });

export const updateCoursePost = 
    asyncHandler(async (req: Request, res: Response) => {
      const courseId = parseInt(req.params.id);
      const course = await getCourseById(courseId);

      if (course) {
        const updatedData = req.body;
        const updatedCourse = await updateCourse(course, updatedData);
        res.status(200).json(updatedCourse);
      } else {
        res.status(404).json({ message: 'Course not found' });
      }
    });
