import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { createEnrollments, deleteEnrollment, findEnrollmentById, getAllEnrollments, saveEnrollment } from '@src/service/enrollment.service';

// Get the list of enrollments
export const enrollmentList = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const enrollments = await getAllEnrollments()
  res.json(enrollments);
});

export const enrollmentCreateGet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // You can return an HTML form here if you're rendering views
    res.json({ message: 'Ready to create a new enrollment' });
  });

// Create a new enrollment
export const enrollmentCreatePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { user_id, course_id, enrollment_date, progress, completion_date } = req.body;

  const enrollment = createEnrollments({
    user_id,
    course_id,
    enrollment_date,
    progress,
    completion_date,
  });

  res.status(201).json(enrollment);
});

// Get details of a specific enrollment
export const enrollmentDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const enrollment = await findEnrollmentById(parseInt(req.params.id))

  if (!enrollment) {
    res.status(404).json({ message: 'Enrollment not found' });
    return;
  }

  res.json(enrollment);
});

export const enrollmentUpdateGet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const enrollment = await findEnrollmentById(parseInt(req.params.id));
  
    if (!enrollment) {
      res.status(404).json({ message: 'Enrollment not found' });
      return;
    }
  
    // You can return an HTML form here if you're rendering views
    // For now, let's return the enrollment data as JSON
    res.json(enrollment);
  });

// Update an existing enrollment
export const enrollmentUpdatePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const enrollment = await findEnrollmentById(parseInt(req.params.id))

  if (!enrollment) {
    res.status(404).json({ message: 'Enrollment not found' });
    return;
  }

  const { progress, completion_date } = req.body;

  enrollment.progress = progress;
  enrollment.completion_date = completion_date;

  await saveEnrollment(enrollment)
  res.json(enrollment);
});

// Delete an enrollment
export const enrollmentDeletePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const enrollment = await findEnrollmentById(parseInt(req.params.id))

  if (!enrollment) {
    res.status(404).json({ message: 'Enrollment not found' });
    return;
  }

  await deleteEnrollment
  res.status(204).send(); // No content to send back
});
