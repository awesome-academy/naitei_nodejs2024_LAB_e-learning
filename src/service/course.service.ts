import { AppDataSource } from "../repos/db";
import { Course } from "../entity/Course";
import { Enrollment } from "../entity/Enrollment";
import { Section } from "../entity/Section";
import { Lesson } from "../entity/Lesson";
import { Payment } from "../entity/Payment";
import { Review } from "../entity/Review";
import { Category } from "./../entity/Category";
import { In } from "typeorm";
import { User } from "../entity/User";
import { CourseStatus } from "../enum/course.enum"

const enrollmentRepository = AppDataSource.getRepository(Enrollment);
const courseRepository = AppDataSource.getRepository(Course);
const sectionRepository = AppDataSource.getRepository(Section);
const lessonRepository = AppDataSource.getRepository(Lesson);
const paymentRepository = AppDataSource.getRepository(Payment);
const userRepository = AppDataSource.getRepository(User);
const reviewRepository = AppDataSource.getRepository(Review);

export const getAllCourses = async (): Promise<Course[]> => {
  return courseRepository.find({
    where: { status: CourseStatus.PUBLIC }, 
    select: ["id", "name", "status"], 
  });
};

export const getPaymentsByUserId = async (userId: number): Promise<Payment[]> => {  
  return await paymentRepository.find({
    where: { id: userId },
  });
};

export const getCoursesByIds = async (courseIds: number[]): Promise<Course[]> => {
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

export const getProfessorByCourse = async (courseId: number): Promise<User> => {
  const course = await courseRepository.findOne({ where: { id: courseId }, relations: ['professor'] });
  
  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.professor) {
    throw new Error(`Professor not found for course with ID ${courseId}`);
  }

  return course.professor;
};

export const getProfessorAndCourseCountByCourseId = async (courseId: number): Promise<number> => {
  const course = await courseRepository.findOne({ where: { id: courseId }, relations: ['professor'] });
  
  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.professor) {
    throw new Error(`Professor not found for course with ID ${courseId}`);
  }

  const count = await courseRepository.count({ where: { professor_id: course.professor.id } });
  return count;
};

export const getCoursesByUserId = async (userId: number) => {
  return await courseRepository.find({ where: { professor_id: userId } });
};

export async function getCoursesInfo(professorId: number): Promise<any[]> {
  const professor = await userRepository.findOne({
    where: { id: professorId, role: 'professor' },
  });

  if (!professor) {
    throw new Error(`Professor with ID ${professorId} not found.`);
  }

  const courses = await courseRepository.find({
    where: { professor: { id: professorId } },
    relations: ['category', 'professor'],
  });

  const coursesWithEnrollmentAndPaymentCount = await Promise.all(
    courses.map(async (course) => {
      const enrollmentCount = await enrollmentRepository.count({
        where: { course: { id: course.id } },
      });

      const paymentCount = await paymentRepository.count({
        where: { course: { id: course.id } },
      });

      return {
        ...course,
        enrollmentCount: enrollmentCount,
        paymentCount: paymentCount,
      };
    })
  );

  return coursesWithEnrollmentAndPaymentCount;
}

export const getCategoryByCourse = async (courseId: number): Promise<Category> => {
  const course = await courseRepository.findOne({ where: { id: courseId }, relations: ['category'] });
  
  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.category) {
    throw new Error(`Category not found for course with ID ${courseId}`);
  }

  return course.category;
};

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

      const professorName = professor?.name || 'Unknown'; 
      const professorId = professor?.id || 'Unknown';

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
      category_id: data.category_id,
      average_rating: 0, 
      professor_id: data.professor_id,
  });

  return await courseRepository.save(newCourse);
}

export const checkProfessorAuthorization = async (courseId: number, userId: number) => {
  const course = await courseRepository.findOne({
    where: { id: courseId },
    relations: ['professor'],
  });

  if (!course) {
    return false;
  }

  return course.professor.id === userId; 
};

export const updateCourse = async (id: number, courseData: any) => {
  const course = await courseRepository.findOne({ where: { id }, relations: ['professor', 'sections'] });

  if (!course) {
    throw new Error(`Course with ID ${id} not found.`);
  }

  course.name = courseData.name;
  course.category_id = courseData.category_id;
  course.description = courseData.description; 
  course.price = courseData.price; 

  return await courseRepository.save(course);
}


export const updateStatus = async (courseId: number) => {
  try {
    const course = await courseRepository.findOne({ where: { id: courseId } });

    if (!course) {
      return null;
    }

    course.status = course.status === CourseStatus.DRAFT ? CourseStatus.PUBLIC : CourseStatus.DRAFT;

    return await courseRepository.save(course);
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái khóa học:', error);
    throw error; 
  }
};

export const updateCourseAverageRating = async (courseId: number) => {
  try {
    const reviews = await reviewRepository.find({
      where: { course_id: courseId },
      select: ["rating"],
    });

    const totalRatings = reviews?.length || 0;
    const sumRatings = reviews?.reduce((sum, review) => sum + review.rating, 0);

    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    await courseRepository.update(
      { id: courseId },
      { average_rating: averageRating }
    );
  } catch (error) {
    console.error(`Failed to update average rating for course ID ${courseId}:`, error);
    throw error;
  }
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
  // Ensure `courseRepository` is defined
  if (!courseRepository || !courseRepository.createQueryBuilder) {
    throw new Error("Course repository or QueryBuilder is not initialized.");
  }

  const query = courseRepository
    .createQueryBuilder("course")
    .innerJoinAndSelect("course.category", "category")
    .where("course.status = :status", { status: CourseStatus.PUBLIC });

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
  if (filters.category) {
    query.andWhere("category.name LIKE :category", {
      category: `%${filters.category}%`,
    });
  }

  // Validate and apply sorting
  const validSortByFields = ["name", "price", "average_rating", "created_at"];
  const sortBy = sorting.sortBy && validSortByFields.includes(sorting.sortBy) ? sorting.sortBy : "name";
  const order = sorting.order === "ASC" || sorting.order === "DESC" ? sorting.order : "ASC";

  query.orderBy(`course.${sortBy}`, order);

  // Apply pagination
  const offset = (page - 1) * limit;
  query.skip(offset).take(limit);

  // Execute the query and get results
  const [courses, total] = await query.getManyAndCount();

  return {
    courses,
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
