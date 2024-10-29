import { AppDataSource } from "../repos/db";
import { Course } from "../entity/Course";
import { Enrollment } from "../entity/Enrollment";
import { Section } from "../entity/Section";
import { Lesson } from "../entity/Lesson";
import { User } from "../entity/User";
import { Payment } from "../entity/Payment";
import { Category } from "./../entity/Category";
import { In } from "typeorm";

const enrollmentRepository = AppDataSource.getRepository(Enrollment);
const courseRepository = AppDataSource.getRepository(Course);
const sectionRepository = AppDataSource.getRepository(Section);
const lessonRepository = AppDataSource.getRepository(Lesson);
const userRepository = AppDataSource.getRepository(User);
const paymentRepository = AppDataSource.getRepository(Payment);

export async function getAllCourses() {
  return await courseRepository.find({
    select: [
      "id",
      "name",
      "price",
      "description",
      "average_rating",
      "created_at",
      "updated_at",
    ],
    order: { name: "ASC" },
  });
}

export const getPaymentsByUserId = async (
  userId: number
): Promise<Payment[]> => {
  const paymentRepository = AppDataSource.getRepository(Payment);

  return await paymentRepository.find({
    where: { id: userId },
  });
};

export const getCoursesByIds = async (
  courseIds: number[]
): Promise<Course[]> => {
  const courseRepository = AppDataSource.getRepository(Course);

  return await courseRepository.findBy({
    id: In(courseIds),
  });
};

export async function getUserPurchasedCourses(
  userId: number
): Promise<Payment[]> {
  const payments = await paymentRepository.find({
    where: {
      user_id: userId,
      status: "done",
    },
  });

  return payments;
}

export async function getProfessorByCourse(courseId: number) {
  const course = await courseRepository.findOne({
    where: { id: courseId },
    relations: { professor: true },
  });

  return course?.professor;
}

export const getCoursesWithSectionsAndHours = async () => {
  const courses = await getAllCourses();
  if (courses.length === 0) {
    throw new Error("No courses found.");
  }

  return await Promise.all(
    courses.map(async (course) => {
      const sectionsWithLessons = await getSectionsWithLessons(course.id);
      const totalHours = sectionsWithLessons.reduce(
        (sum, section) => sum + section.total_time,
        0
      );

      const professor = await getProfessorByCourse(course.id);
      const professorName = professor?.name || "Unknown";
      const professorId = professor?.id || "Unknown";

      return {
        ...course,
        professorName,
        professorId,
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
        select: [
          "id",
          "name",
          "type",
          "content",
          "progress",
          "description",
          "time",
          "created_at",
          "updated_at",
        ],
      });

      return {
        ...section,
        lessons,
        total_time: lessons.reduce((sum, lesson) => sum + lesson.time, 0),
      };
    })
  );
}

export async function countEnrolledUsersInCourse(
  courseId: number
): Promise<number> {
  const count = await enrollmentRepository.count({
    where: {
      course: { id: courseId },
      user: { role: "user" },
    },
    relations: ["user"],
  });

  return count;
}

export async function createCourse(data: Partial<Course>): Promise<Course> {
  const newCourse = courseRepository.create({
    name: data.name,
    description: data.description,
    price: data.price,
    average_rating: data.average_rating,
    professor_id: data.professor_id,
  });

  return await courseRepository.save(newCourse);
}

export const updateCourse = async (id: number, courseData: any) => {
  const course = await courseRepository.findOne({
    where: { id },
    relations: ["professor", "sections"],
  });

  if (!course) {
    throw new Error(`Course with ID ${id} not found.`);
  }

  course.name = courseData.name;

  const professor = await getProfessorByCourse(courseData.professor_id);
  if (professor) {
    course.professor = professor;
    course.professor_id = professor.id;
  }

  course.description = courseData.description;
  course.price = courseData.price;
  course.average_rating = courseData.average_rating;

  return await courseRepository.save(course);
};

export async function deleteCourse(id: number): Promise<boolean> {
  const result = await courseRepository.delete(id);
  return result.affected !== 0;
}

export interface CourseFilter {
  professorId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  name?: string;
  category?: string;
}

export interface CourseSorting {
  sortBy?: "name" | "price" | "average_rating" | "created_at";
  order?: "ASC" | "DESC";
}

export const filterAndSortCourses = async (
  filters: CourseFilter,
  sorting: CourseSorting,
  page: number = 1,
  limit: number = 10
) => {
  const query = courseRepository
    .createQueryBuilder("course")
    .innerJoinAndSelect("course.category", "category");

  // Apply filters
  if (filters.professorId) {
    query.andWhere("course.professor_id = :professorId", {
      professorId: filters.professorId,
    });
  }
  if (filters.minPrice) {
    query.andWhere("course.price >= :minPrice", { minPrice: filters.minPrice });
  }
  if (filters.maxPrice) {
    query.andWhere("course.price <= :maxPrice", { maxPrice: filters.maxPrice });
  }
  if (filters.minRating) {
    query.andWhere("course.average_rating >= :minRating", {
      minRating: filters.minRating,
    });
  }
  if (filters.name) {
    query.andWhere("course.name LIKE :name", { name: `%${filters.name}%` });
  }

  // Apply sorting
  if (sorting.sortBy) {
    query.orderBy(`course.${sorting.sortBy}`, sorting.order || "ASC");
  }

  if (filters.category) {
    query.andWhere("category.name LIKE :category", {
      category: `%${filters.category}%`,
    });
  }

  // Apply pagination (offset and limit)
  const offset = (page - 1) * limit;
  query.skip(offset).take(limit);

  // Execute the query and get results
  const [courses, total] = await query.getManyAndCount();

  const results = await Promise.all(
    courses.map(async (course) => {
      const sectionsWithLessons = await getSectionsWithLessons(course.id);
      const totalHours = sectionsWithLessons.reduce(
        (sum, section) => sum + section.total_time,
        0
      );

      const professor = await getProfessorByCourse(course.id);
      const professorName = professor?.name || "Unknown";
      const professorId = professor?.id || "Unknown";

      return {
        ...course,
        professorName,
        professorId,
        sectionsWithLessons,
        totalHours,
      };
    })
  );

  // Return paginated result along with total count
  return {
    courses: results,
    total,
    page,
    pageCount: Math.ceil(total / limit),
  };
};

export async function getCourseById(id: number) {
  return await courseRepository.findOne({
    where: { id: id },
  });
}
