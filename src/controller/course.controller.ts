import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Course } from '../entity/Course';
import { getCoursesWithSectionsAndHours, filterAndSortCourses, getSectionsWithLessons, getCourseById, countEnrolledUsersInCourse, getProfessorByCourse, getAllCourses, saveCourse, deleteCourse} from '../service/course.service'

export const filterAndSort = asyncHandler(async (req: Request, res: Response) => {
      try {
        const { professorId, 
          minPrice, 
          maxPrice, 
          minRating, 
          name, 
          sortBy, 
          order, 
        } = req.body;
        const courses = await filterAndSortCourses(
          {
            professorId,
            minPrice,
            maxPrice,
            minRating,
            name,
          },
          {
            sortBy,
            order,
          },
        );
        res.json(courses);
      } catch (error) {
        console.error('Error filtering and sorting courses:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
});


export const courseShowGet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const courses = await getCoursesWithSectionsAndHours();
    res.render('course', {
      title: req.t('home.title'),
      message: req.t('home.message'),
      courses,
      t: req.t, 
    });
  } catch (error) {
    res.status(500).render('error', { message: req.t('course.course_error') });
  }
});

export const getCourseDetail = asyncHandler(async (req: Request, res: Response) => {
  const courseId = Number(req.params.id);

  if (!courseId) {
    return res.status(400).render('error', { message: req.t('course.course_error_id_required') });
  }

  const course = await getCourseById(courseId);
  if (!course) {
    return res.status(404).render('error', { message: req.t('course.course_error_notfound') });
  }

  const professor = await getProfessorByCourse(courseId);
  const sectionsWithLessons = await getSectionsWithLessons(courseId);

  const totalHours = sectionsWithLessons.reduce((sum, section) => sum + section.total_time, 0);
  const totalLessons = sectionsWithLessons.reduce((sum, section) => sum + section.lessons.length, 0);
  const totalStudents = await countEnrolledUsersInCourse(courseId);

  res.render('courseDetail', {
    course,
    name: professor?.name || 'Unknown Professor',
    totalHours,
    sectionsWithLessons,
    totalLessons,
    totalStudents,
    t: req.t
  });
});

// user admin crud 
// List all courses
export const courseList = async (req: Request, res: Response): Promise<void> => {
  const courses = await getAllCourses()
  res.json(courses); // Alternatively, render a view for admins
};

// Get course details
export const courseDetails = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const course = await getCourseById(parseInt(id))

  if (!course) {
    res.status(404).json({ message: 'Course not found' });
    return;
  }

  res.json(course); // Alternatively, render a detailed view for admins
};

// Render course creation form (if needed)
export const courseCreateGet = (req: Request, res: Response): void => {
  res.render('courseCreateForm'); // Render a view (if needed)
};

// Handle course creation
export const courseCreatePost = async (req: Request, res: Response): Promise<void> => {
  const { name, price, description, professor_id } = req.body;

  const newCourse = new Course({
    name,
    price: parseFloat(price),
    description,
    professor_id: parseInt(professor_id),
    average_rating: 0,
  });

  await saveCourse(newCourse);
  res.status(201).json(newCourse); // Alternatively, redirect or render a success page
};

// Render course deletion confirmation form (if needed)
export const courseDeleteGet = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const course = await getCourseById(parseInt(id))

  if (!course) {
    res.status(404).json({ message: 'Course not found' });
    return;
  }

  res.render('courseDeleteForm', { course }); // Render a view (if needed)
};

// Handle course deletion
export const courseDeletePost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const course = await getCourseById(parseInt(id))
  if (!course) {
    res.status(404).json({ message: 'Course not found' });
    return;
  }

  await deleteCourse(course)
  res.json({ message: 'Course deleted' }); // Alternatively, redirect or render a success page
};

// Render course update form (if needed)
export const courseUpdateGet = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const course = await getCourseById(parseInt(id))

  if (!course) {
    res.status(404).json({ message: 'Course not found' });
    return;
  }

  res.render('courseUpdateForm', { course }); // Render a view (if needed)
};

// Handle course update
export const courseUpdatePost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, price, description } = req.body;
  const course = await getCourseById(parseInt(id))
  if (!course) {
    res.status(404).json({ message: 'Course not found' });
    return;
  }

  course.name = name;
  course.price = parseFloat(price);
  course.description = description;

  await saveCourse(course)
  res.json(course); // Alternatively, redirect or render a success page
};
