// src/test/course_service.spec.ts

import { faker } from "@faker-js/faker";
import { AppDataSource } from "../repos/db";
import {
  getAllCourses,
  createCourse,
  getProfessorByCourse,
  getCoursesByUserId,
  getCategoryByCourse,
  updateCourse,
  deleteCourse,
  getUserPurchasedCourses,
  updateStatus,
  countEnrolledUsersInCourse,
  getPaymentsByUserId,
  getCoursesByIds,
  getProfessorAndCourseCountByCourseId,
  getCoursesWithSectionsAndHours,
  updateCourseAverageRating,
  getCoursesInfo,
  getSectionsWithLessons
} from "../service/course.service";
import { Course } from "../entity/Course";
import { Enrollment } from "../entity/Enrollment";
import { Payment } from "../entity/Payment";
import { Review } from "../entity/Review";
import { Section } from "../entity/Section";
import { Lesson } from "../entity/Lesson";
import { User } from "../entity/User";
import { Category } from "../entity/Category";
import { In } from "typeorm";
import { CourseStatus } from "../enum/course.enum";
import { UserRegisterDto } from "../entity/dto/user.dto";
import { UserGenderType, UserRoleType } from "../enum/user.enum";
import { LessonType } from "../enum/lesson.enum";
import { CreateCourseDto } from "../entity/dto/course.dto";
import { DataSource } from "typeorm";

import * as dotenv from "dotenv";
dotenv.config({ path: "test.env" });

let testDataSource: DataSource;

beforeAll(async () => {
  testDataSource = await AppDataSource.initialize();
});

afterAll(async () => {
  await testDataSource.destroy();
});

// Hàm tạo người dùng
const createUser = async (role: UserRoleType = UserRoleType.USER): Promise<User> => {
  const userRegisterDto: UserRegisterDto = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: role,
    phone_number: faker.string.numeric(10),
    date_of_birth: faker.date.past(),
    gender: role === UserRoleType.USER ? UserGenderType.MALE : UserGenderType.FEMALE,
    address: faker.location.streetAddress(),
    identity_card: faker.number.int({ min: 100000000, max: 999999999 }).toString(),
    additional_info: faker.lorem.sentence(),
    department: faker.commerce.department(),
    years_of_experience: faker.number.int({ min: 1, max: 30 }),
  };
  const userRepository = testDataSource.getRepository(User);
  return await userRepository.save(userRegisterDto);
};

// Hàm tạo danh mục
const createCategory = async (): Promise<Category> => {
  const categoryRepository = testDataSource.getRepository(Category);
  const category = {
    name: faker.commerce.department(),
  };
  return await categoryRepository.save(category);
};

// Hàm tạo khóa học
const createCourseData = async (professorId: number, categoryId: number): Promise<Course> => {
  const courseRepository = testDataSource.getRepository(Course);
  const courseData: CreateCourseDto = {
    name: faker.commerce.productName(),
    description: faker.lorem.paragraph(),
    price: faker.number.int({ min: 10, max: 1000 }),
    category_id: categoryId,
    average_rating: faker.number.int({ min: 1, max: 5 }),
    professor_id: professorId,
  };
  return await courseRepository.save(courseData);
};

describe("Course Service - Improved Tests", () => {
  let user: User;
  let professor: User;
  let category: Category;
  let course: Course;

  beforeEach(async () => {
    user = await createUser(UserRoleType.USER);
    professor = await createUser(UserRoleType.PROFESSOR);
    category = await createCategory();
    course = await createCourseData(professor.id, category.id);
  });

  describe("getAllCourses", () => {
    it("should return all public courses", async () => {
      const courseRepository = testDataSource.getRepository(Course);
    
      const publicCourse = await courseRepository.save({
        name: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        price: faker.number.int({ min: 10, max: 500 }),
        category_id: category.id,
        professor_id: professor.id,
        status: CourseStatus.PUBLIC,
      });
    
      const result = await getAllCourses();
    
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    
      const retrievedCourse = result.find(c => c.id === publicCourse.id);
      expect(retrievedCourse).toBeDefined();
      expect(retrievedCourse!.name).toBe(publicCourse.name);
      expect(retrievedCourse!.status).toBe(CourseStatus.PUBLIC);
    });

    it("should throw an error if course does not exist", async () => {
      const invalidCourseId = -1;
      await expect(getProfessorByCourse(invalidCourseId)).rejects.toThrow(/not found/);
    });
  });

  describe("createCourse", () => {
    it("should create a new course with valid data", async () => {
      const courseData = {
        name: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        price: faker.number.int({ min: 10, max: 1000 }),
        category_id: category.id,
        professor_id: professor.id,
      };
      
      const result = await createCourse(courseData);

      expect(result).toBeDefined();
      expect(result.name).toBe(courseData.name);
      expect(result.description).toBe(courseData.description);
      expect(result.price).toBe(courseData.price);
      expect(result.category_id).toBe(courseData.category_id);
      expect(result.professor_id).toBe(courseData.professor_id);
      expect(result.average_rating).toBe(0); 
    });

    it("should throw an error when required fields are missing", async () => {
      const incompleteCourseData = {
        description: faker.lorem.paragraph(),
        price: 100,
        category_id: category.id,
        professor_id: professor.id,
      };
      
      await expect(createCourse(incompleteCourseData as any)).rejects.toThrow();
    });
  });

  describe("getProfessorByCourse", () => {
    it("should return the professor for a given course", async () => {
      const result = await getProfessorByCourse(course.id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(professor.id);
      expect(result!.name).toBe(professor.name);
    });

    it("should throw an error if course does not exist", async () => {
      const invalidCourseId = -1;
      await expect(getProfessorByCourse(invalidCourseId)).rejects.toThrow("Course not found");
    });
  });

  describe("getCoursesByIds", () => {
    it("should return courses for given IDs", async () => {
      const courseRepository = testDataSource.getRepository(Course);
      const anotherCourse = await createCourseData(professor.id, category.id);

      const result = await getCoursesByIds([course.id, anotherCourse.id]);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: course.id }),
          expect.objectContaining({ id: anotherCourse.id }),
        ])
      );
    });

    it("should return an empty array if no courses match the given IDs", async () => {
      const result = await getCoursesByIds([-1, -2]);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("getProfessorAndCourseCountByCourseId", () => {
    it("should return the course count for a professor by course ID", async () => {
      // Tạo thêm một số khóa học cho giáo sư
      await createCourseData(professor.id, category.id);
      await createCourseData(professor.id, category.id);

      const result = await getProfessorAndCourseCountByCourseId(course.id);

      expect(result).toBe(3); // Tổng số khóa học của giáo sư đã tạo: 3
    });

    it("should throw an error if course does not exist", async () => {
      const invalidCourseId = -1;
      await expect(getProfessorAndCourseCountByCourseId(invalidCourseId)).rejects.toThrow("Course not found");
    });
  });

  describe("getCategoryByCourse", () => {
    it("should fetch category for a given course", async () => {
      const result = await getCategoryByCourse(course.id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(category.id);
      expect(result!.name).toBe(category.name);
    });

    it("should throw an error if course does not exist", async () => {
      const invalidCourseId = -1;
      await expect(getCategoryByCourse(invalidCourseId)).rejects.toThrow("Course not found");
    });
  });

  describe("updateCourse", () => {
    it("should update an existing course", async () => {
      const courseData = {
        name: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        price: faker.number.int({ min: 100, max: 200 }),
        category_id: category.id,
      };
      
      const updatedCourse = await updateCourse(course.id, courseData);

      expect(updatedCourse).toBeDefined();
      expect(updatedCourse!.id).toBe(course.id);
      expect(updatedCourse!.name).toBe(courseData.name);
      expect(updatedCourse!.description).toBe(courseData.description);
      expect(updatedCourse!.price).toBe(courseData.price);
      expect(updatedCourse!.category_id).toBe(courseData.category_id);
    });

    it("should throw an error if course not found", async () => {
      const invalidCourseId = -1;
      const courseData = {
        name: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        price: faker.number.int({ min: 100, max: 200 }),
        category_id: category.id,
      };

      await expect(updateCourse(invalidCourseId, courseData)).rejects.toThrow(`Course with ID ${invalidCourseId} not found.`);
    });
  });

  describe("deleteCourse", () => {
    it("should delete a course by ID", async () => {
      const newCourse = await createCourseData(professor.id, category.id);
      const result = await deleteCourse(newCourse.id);

      expect(result).toBe(true);

      // Kiểm tra khóa học đã bị xóa
      const courseRepository = testDataSource.getRepository(Course);
      const deletedCourse = await courseRepository.findOneBy({ id: newCourse.id });
      expect(deletedCourse).toBeNull();
    });

    it("should return false if course not deleted", async () => {
      const invalidCourseId = -1;
      const result = await deleteCourse(invalidCourseId);

      expect(result).toBe(false);
    });
  });

  describe("getUserPurchasedCourses", () => {
    it("should fetch purchased courses for a user", async () => {
      const paymentRepository = testDataSource.getRepository(Payment);
      await paymentRepository.save({
        user_id: user.id,
        course_id: course.id,
        status: "done",
        amount: 100,
      });
  
      const result = await getUserPurchasedCourses(user.id);
  
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
  
      const purchasedCourse = result[0];
      expect(purchasedCourse.course_id).toBe(course.id);
      expect(purchasedCourse.status).toBe("done");
    });
  
    it("should return an empty array if user has no purchases", async () => {
      const result = await getUserPurchasedCourses(user.id);
  
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("updateStatus", () => {
    it("should toggle course status between DRAFT and PUBLIC", async () => {
      expect(course.status).toBe(CourseStatus.DRAFT);

      const updatedCourse = await updateStatus(course.id);
      expect(updatedCourse).toBeDefined();
      expect(updatedCourse!.status).toBe(CourseStatus.PUBLIC);

      const revertedCourse = await updateStatus(course.id);
      expect(revertedCourse).toBeDefined();
      expect(revertedCourse!.status).toBe(CourseStatus.DRAFT);
    });

    it("should return null if course not found", async () => {
      const invalidCourseId = -1;
      const result = await updateStatus(invalidCourseId);

      expect(result).toBeNull();
    });
  });

  describe("countEnrolledUsersInCourse", () => {
    it("should count enrolled users in a course", async () => {
      const enrollmentRepository = testDataSource.getRepository(Enrollment);
    
      await enrollmentRepository.save({ user_id: user.id, course_id: course.id, progress: 50 });
      const anotherUser = await createUser(UserRoleType.USER);
      await enrollmentRepository.save({ user_id: anotherUser.id, course_id: course.id, progress: 60 });
    
      const result = await countEnrolledUsersInCourse(course.id);
    
      expect(result).toBe(2); 
    });
    

    it("should return zero if no users are enrolled", async () => {
      const result = await countEnrolledUsersInCourse(course.id);

      expect(result).toBe(0);
    });
  });

  describe("getCoursesWithSectionsAndHours", () => {

    it("should return an empty array if course has no sections", async () => {
      const newCourse = await createCourseData(professor.id, category.id);
      const result = await getSectionsWithLessons(newCourse.id);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("updateCourseAverageRating", () => {
    it("should update average rating for a course", async () => {
      const reviewRepository = testDataSource.getRepository(Review);
      const courseRepository = testDataSource.getRepository(Course);
      
      await reviewRepository.save({ user_id: user.id, course_id: course.id, rating: 4 });
      await reviewRepository.save({ user_id: professor.id, course_id: course.id, rating: 5 });

      await updateCourseAverageRating(course.id);

      const updatedCourse = await courseRepository.findOneBy({ id: course.id });
      expect(updatedCourse).toBeDefined();
      expect(updatedCourse!.average_rating).toBe(4.5);
    });

    it("should handle courses with no reviews", async () => {
      const courseRepository = testDataSource.getRepository(Course);
      
      await updateCourseAverageRating(course.id);

      const updatedCourse = await courseRepository.findOneBy({ id: course.id });
      expect(updatedCourse).toBeDefined();
      expect(updatedCourse!.average_rating).toBe(0);
    });
  });

  describe("getPaymentsByUserId", () => {
    it("should return an empty array if user has no payments", async () => {
      const result = await getPaymentsByUserId(user.id);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("getCoursesByUserId", () => {
    it("should return courses for a given user", async () => {
      const result = await getCoursesByUserId(professor.id);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(courseItem => {
        expect(courseItem.professor_id).toBe(professor.id);
      });
    });

    it("should return an empty array if user has no courses", async () => {
      const newProfessor = await createUser(UserRoleType.PROFESSOR);
      const result = await getCoursesByUserId(newProfessor.id);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("getCoursesInfo", () => {
    it("should throw an error if professor not found", async () => {
      const invalidProfessorId = -1;
      await expect(getCoursesInfo(invalidProfessorId)).rejects.toThrow("Professor with ID -1 not found.");
    });
  });

  describe("getSectionsWithLessons", () => {
    it("should return sections with lessons and total time for a course", async () => {
      const sectionRepository = testDataSource.getRepository(Section);
      const lessonRepository = testDataSource.getRepository(Lesson);
      
      const section1 = await sectionRepository.save({
        name: faker.lorem.words(3),
        course_id: course.id,
      });

      const lesson1 = await lessonRepository.save({
        name: faker.lorem.words(3),
        type: LessonType.VIDEO,
        content: faker.lorem.sentence(),
        description: faker.lorem.sentence(),
        time: 30,
        section_id: section1.id,
      });
      
      const lesson2 = await lessonRepository.save({
        name: faker.lorem.words(3),
        type: LessonType.PDF,
        content: faker.lorem.sentence(),
        description: faker.lorem.sentence(),
        time: 45,
        section_id: section1.id,
      });

      const result = await getSectionsWithLessons(course.id);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);

      const firstSection = result.find(c => c.id === section1.id);
      expect(firstSection).toBeDefined();
      expect(firstSection!.lessons).toBeInstanceOf(Array);
      expect(firstSection!.lessons.length).toBe(2);
      expect(firstSection!.total_time).toBe(75);
    });

    it("should return an empty array if course has no sections", async () => {
      const newCourse = await createCourseData(professor.id, category.id);
      const result = await getSectionsWithLessons(newCourse.id);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });
});
