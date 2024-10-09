import { AppDataSource } from '../repos/db';
import { Course } from '../entity/Course';
import { Enrollment } from '../entity/Enrollment';
import { Section } from '../entity/Section';
import { Lesson } from '../entity/Lesson';
import { User } from '../entity/User';


const enrollmentRepository = AppDataSource.getRepository(Enrollment);
const courseRepository = AppDataSource.getRepository(Course);
const sectionRepository = AppDataSource.getRepository(Section);
const lessonRepository = AppDataSource.getRepository(Lesson);
const userRepository = AppDataSource.getRepository(User);


export async function getAllCourses() {
  return await courseRepository.find({
    select: ['id', 'name', 'price', 'description', 'average_rating', 'created_at', 'updated_at'],
    order: { name: 'ASC' },
  });
}

export async function getProfessorByCourse(courseId: number) {
  const course = await courseRepository.findOne({
    where: { id: courseId },
    relations: {professor: true}
  });

  return course?.professor;
}

export const getCoursesWithSectionsAndHours = async () => {
  const courses = await getAllCourses();

  if (courses.length === 0) {
    throw new Error('No courses found.');
  }

  return await Promise.all(
    courses.map(async (course) => {
      const sectionsWithLessons = await getSectionsWithLessons(course.id);
      const totalHours = sectionsWithLessons.reduce(
        (sum, section) => sum + section.total_time,
        0
      );

      return {
        ...course,
        sectionsWithLessons,
        totalHours,
      };
    })
  );
};

export async function getSectionsWithLessons(courseId: number) {
  const sections = await sectionRepository.find({
    where: { course: { id: courseId } },
  });

  return await Promise.all(
    sections.map(async (section) => {
      const lessons = await lessonRepository.find({
        where: { section: { id: section.id } },
        select: ['id', 'name','type','content', 'description', 'time', 'created_at', 'updated_at'],
      });

      return {
        ...section,
        lessons,
        total_time: lessons.reduce((sum, lesson) => sum + lesson.time, 0),
      };
    })
  );
}

export async function countEnrolledUsersInCourse(courseId: number): Promise<number> {
  const count = await enrollmentRepository.count({
    where: {
      course: { id: courseId },
      user: { role: 'user' },
    },
    relations: ['user'],
  });

  return count;
}

interface courseFilter {
  professorId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  name?: string;
}

interface courseSorting {
  sortBy?: 'price' | 'average_rating' | 'created_at';
  order?: 'ASC' | 'DESC';
}

export async function filterAndSortCourses(
  filters: courseFilter,
  sorting: courseSorting
) {
  const query = courseRepository.createQueryBuilder('course');

  // Apply filter
  if (filters.professorId) {
    query.andWhere('course.professor_id = :professorId', {
      professorId: filters.professorId,
    });
  }

  if (filters.minPrice) {
    query.andWhere('course.price >= :minPrice', {
      minPrice: filters.minPrice,
    });
  }

  if (filters.maxPrice) {
    query.andWhere('course.price <= :maxPrice', { maxPrice: filters.maxPrice });
  }

  if (filters.minRating) {
    query.andWhere('course.average_rating >= :minRating', { minRating: filters.minRating });
  }

  if (filters.name) {
    query.andWhere('course.name LIKE :name', { name: `%${filters.name}%` });
  }

  // Apply sorting
  if (sorting.sortBy) {
    query.orderBy(`course.${sorting.sortBy}`, sorting.order || 'ASC');
  } else {
    // Default sorting by creation date
    query.orderBy('course.created_at', 'DESC');
  }

  return await query.getMany();
}

export async function getCourseById(id: number) {
  return await courseRepository.findOne({
    where: { id: id },
  });
}

export async function saveCourse(course: Course) {
  return await courseRepository.save(course)
}

export async function deleteCourse(course: Course) {
  return await courseRepository.remove(course)
}
