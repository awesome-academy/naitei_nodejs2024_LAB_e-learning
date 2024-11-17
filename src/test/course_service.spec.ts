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
import { AppDataSource } from "../repos/db";
import { Course } from "../entity/Course";
import { Enrollment } from "../entity/Enrollment";
import { Payment } from "../entity/Payment";
import { Review } from "../entity/Review";
import { Section } from "../entity/Section";
import { Lesson } from "../entity/Lesson";
import { User } from "../entity/User";
import { In } from "typeorm";
import { CourseStatus } from "../enum/course.enum";

jest.mock("../repos/db", () => {
  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    findBy: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  return {
    AppDataSource: {
      getRepository: jest.fn(() => mockRepository),
      isInitialized: true,
    },
  };
});

let mockCourseRepository: any;
let mockEnrollmentRepository: any;
let mockPaymentRepository: any;
let mockReviewRepository: any;
let mockSectionRepository: any;
let mockLessonRepository: any;
let mockUserRepository: any;

beforeAll(() => {
  mockCourseRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    update: jest.fn(() => Promise.resolve({ affected: 1 })),
    findBy: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[{ id: 1, name: "Course A" }], 1]),
    })),
  };

  mockEnrollmentRepository = {
    count: jest.fn(),
  };

  mockPaymentRepository = {
    find: jest.fn(),
    count: jest.fn(),
  };

  mockReviewRepository = {
    find: jest.fn(() => Promise.resolve([])),
  };

  mockSectionRepository = {
    find: jest.fn(),
  };

  mockLessonRepository = {
    find: jest.fn(),
  };

  mockUserRepository = {
    findOne: jest.fn(),
  };

  (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
    if (entity === Course) return mockCourseRepository;
    if (entity === Enrollment) return mockEnrollmentRepository;
    if (entity === Payment) return mockPaymentRepository;
    if (entity === Review) return mockReviewRepository;
    if (entity === Section) return mockSectionRepository;
    if (entity === Lesson) return mockLessonRepository;
    if (entity === User) return mockUserRepository;
    throw new Error("Invalid entity type");
  });
});

beforeEach(() => {
  jest.clearAllMocks();

  mockCourseRepository.delete.mockImplementation((id: number) => {
    if (id === 1) {
      return Promise.resolve({ affected: 1 });
    }
    return Promise.resolve({ affected: 0 });
  });
});

describe("Additional Tests for Course Service", () => {
  describe("getAllCourses", () => {
    it("should return all public courses", async () => {
      const mockCourses = [
        { id: 1, name: "Course A", status: CourseStatus.PUBLIC },
        { id: 2, name: "Course B", status: CourseStatus.PUBLIC },
      ];
      mockCourseRepository.find.mockResolvedValue(mockCourses);

      const result = await getAllCourses();

      expect(mockCourseRepository.find).toHaveBeenCalledWith({
        where: { status: CourseStatus.PUBLIC },
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
      expect(result).toEqual(mockCourses);
    });
  });

  describe("createCourse", () => {
    it("should create a new course", async () => {
      const courseData = {
        name: "New Course",
        description: "New Description",
        price: 100,
        category_id: 1,
        professor_id: 2,
      };
      const mockCourse = { id: 1, ...courseData };
      mockCourseRepository.create.mockReturnValue(mockCourse);
      mockCourseRepository.save.mockResolvedValue(mockCourse);

      const result = await createCourse(courseData);

      expect(mockCourseRepository.create).toHaveBeenCalledWith({
        ...courseData,
        average_rating: 0,
      });
      expect(mockCourseRepository.save).toHaveBeenCalledWith(mockCourse);
      expect(result).toEqual(mockCourse);
    });
  });

  describe("getProfessorByCourse", () => {
    it("should return the professor for a given course", async () => {
      const mockProfessor = { id: 2, name: "Professor A" };
      mockCourseRepository.findOne.mockResolvedValue({
        id: 1,
        professor: mockProfessor,
      });

      const result = await getProfessorByCourse(1);

      expect(mockCourseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { professor: true },
      });
      expect(result).toEqual(mockProfessor);
    });
  });

  describe("getCoursesByIds", () => {
    it("should return courses for given IDs", async () => {
      const mockCourses = [
        { id: 1, name: "Course A" },
        { id: 2, name: "Course B" },
      ];
      mockCourseRepository.findBy.mockResolvedValue(mockCourses);

      const result = await getCoursesByIds([1, 2]);

      expect(mockCourseRepository.findBy).toHaveBeenCalledWith({ id: In([1, 2]) });
      expect(result).toEqual(mockCourses);
    });
  });

  describe("getProfessorAndCourseCountByCourseId", () => {
    it("should return the course count for a professor by course ID", async () => {
      const mockProfessor = { id: 2, name: "Professor A" };
      mockCourseRepository.findOne.mockResolvedValue({
        id: 1,
        professor: mockProfessor,
      });
      mockCourseRepository.count.mockResolvedValue(3);

      const result = await getProfessorAndCourseCountByCourseId(1);

      expect(mockCourseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { professor: true },
      });
      expect(mockCourseRepository.count).toHaveBeenCalledWith({
        where: { professor: { id: mockProfessor.id } },
      });
      expect(result).toBe(3);
    });
  });

describe("Course Service - Additional Functions", () => {
  describe("getCategoryByCourse", () => {
    it("should fetch category for a given course", async () => {
      const mockCategory = { id: 1, name: "Programming" };
      mockCourseRepository.findOne.mockResolvedValue({
        id: 1,
        name: "Course A",
        category: mockCategory,
      });

      const result = await getCategoryByCourse(1);

      expect(mockCourseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { category: true },
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe("updateCourse", () => {
    it("should update an existing course", async () => {
      const courseId = 1;
      const courseData = {
        name: "Updated Course",
        description: "Updated Description",
        price: 200,
        category_id: 2,
      };
      const mockCourse = { id: courseId, ...courseData };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockCourseRepository.save.mockResolvedValue(mockCourse);

      const result = await updateCourse(courseId, courseData);

      expect(mockCourseRepository.findOne).toHaveBeenCalledWith({
        where: { id: courseId },
        relations: ["professor", "sections"],
      });
      expect(mockCourseRepository.save).toHaveBeenCalledWith(mockCourse);
      expect(result).toEqual(mockCourse);
    });

    it("should throw an error if course not found", async () => {
      mockCourseRepository.findOne.mockResolvedValue(null);

      await expect(updateCourse(1, {})).rejects.toThrowError("Course with ID 1 not found.");
    });
  });

  describe("deleteCourse", () => {
    it("should delete a course by ID", async () => {
      const result = await deleteCourse(1);

      expect(mockCourseRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it("should return false if course not deleted", async () => {
      const result = await deleteCourse(2);

      expect(mockCourseRepository.delete).toHaveBeenCalledWith(2);
      expect(result).toBe(false);
    });
  });

  describe("getUserPurchasedCourses", () => {
    it("should fetch purchased courses for a user", async () => {
      const mockPayments = [
        { id: 1, user_id: 1, course_id: 1, status: "done" },
        { id: 2, user_id: 1, course_id: 2, status: "done" },
      ];
      mockPaymentRepository.find.mockResolvedValue(mockPayments);

      const result = await getUserPurchasedCourses(1);

      expect(mockPaymentRepository.find).toHaveBeenCalledWith({
        where: { user_id: 1, status: "done" },
      });
      expect(result).toEqual(mockPayments);
    });
  });

  describe("updateStatus", () => {
    it("should toggle course status between DRAFT and PUBLIC", async () => {
      const mockCourse = { id: 1, status: CourseStatus.DRAFT };
      const updatedCourse = { ...mockCourse, status: CourseStatus.PUBLIC };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockCourseRepository.save.mockResolvedValue(updatedCourse);

      const result = await updateStatus(1);

      expect(mockCourseRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockCourseRepository.save).toHaveBeenCalledWith(updatedCourse);
      expect(result).toEqual(updatedCourse);
    });

    it("should return null if course not found", async () => {
      mockCourseRepository.findOne.mockResolvedValue(null);

      const result = await updateStatus(1);

      expect(result).toBeNull();
    });
  });

  describe("countEnrolledUsersInCourse", () => {
    it("should count enrolled users in a course", async () => {
      mockEnrollmentRepository.count.mockResolvedValue(10);

      const result = await countEnrolledUsersInCourse(1);

      expect(result).toBe(10);
    });
  });

  describe("getCoursesWithSectionsAndHours", () => {
    it("should return courses with sections and total hours", async () => {
      mockCourseRepository.find.mockResolvedValue([{ id: 1, name: "Course A" }]);
      mockSectionRepository.find.mockResolvedValue([{ id: 1, name: "Section 1" }]);
      mockLessonRepository.find.mockResolvedValue([
        { id: 1, time: 30 },
        { id: 2, time: 45 },
      ]);

      const result = await getCoursesWithSectionsAndHours();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toEqual(1);
    });
  });

  describe("updateCourseAverageRating", () => {
    it("should update average rating for a course", async () => {
      const mockReviews = [{ rating: 4 }, { rating: 5 }];
      mockReviewRepository.find.mockResolvedValue(mockReviews);
      mockCourseRepository.update.mockResolvedValue({ affected: 1 });
    
      await updateCourseAverageRating(1);
    
      expect(mockReviewRepository.find).toHaveBeenCalledWith({
        where: { course_id: 1 },
        select: ["rating"],
      });
      expect(mockCourseRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        { average_rating: 4.5 }
      );
    });
  });
});
describe("Course Service - Additional Functions", () => {
  describe("getPaymentsByUserId", () => {
    it("should return payments for a user", async () => {
      const mockPayments = [{ id: 1, amount: 100 }, { id: 2, amount: 200 }];
      mockPaymentRepository.find.mockResolvedValue(mockPayments);

      const result = await getPaymentsByUserId(1);

      expect(mockPaymentRepository.find).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockPayments);
    });
  });

  describe("getCoursesByIds", () => {
    it("should return courses for given IDs", async () => {
      const mockCourses = [{ id: 1, name: "Course A" }, { id: 2, name: "Course B" }];
      mockCourseRepository.findBy.mockResolvedValue(mockCourses);

      const result = await getCoursesByIds([1, 2]);

      expect(mockCourseRepository.findBy).toHaveBeenCalledWith({ id: In([1, 2]) });
      expect(result).toEqual(mockCourses);
    });
  });

  describe("getCoursesByUserId", () => {
    it("should return courses for a given user", async () => {
      const mockCourses = [{ id: 1, name: "Course A" }];
      mockCourseRepository.find.mockResolvedValue(mockCourses);

      const result = await getCoursesByUserId(1);

      expect(mockCourseRepository.find).toHaveBeenCalledWith({
        where: { professor_id: 1 },
      });
      expect(result).toEqual(mockCourses);
    });
  });

  describe("getCoursesInfo", () => {
    it("should return courses info with enrollment and payment count", async () => {
      const mockProfessor = { id: 1, role: "professor" };
      const mockCourses = [
        { id: 1, name: "Course A", professor: mockProfessor },
        { id: 2, name: "Course B", professor: mockProfessor },
      ];
  
      mockUserRepository.findOne.mockResolvedValue(mockProfessor);
      mockCourseRepository.find.mockResolvedValue(mockCourses);
      mockEnrollmentRepository.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(10);
      mockPaymentRepository.count
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(4);
  
      const result = await getCoursesInfo(1);
  
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, role: "professor" },
      });
      expect(mockCourseRepository.find).toHaveBeenCalledWith({
        where: { professor: { id: 1 } },
        relations: ["category", "professor"],
      });
      expect(mockEnrollmentRepository.count).toHaveBeenCalledTimes(2);
      expect(mockPaymentRepository.count).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        { ...mockCourses[0], enrollmentCount: 5, paymentCount: 2 },
        { ...mockCourses[1], enrollmentCount: 10, paymentCount: 4 },
      ]);
    });
  
    it("should throw an error if professor not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
  
      await expect(getCoursesInfo(1)).rejects.toThrowError(
        "Professor with ID 1 not found."
      );
    });
  });

  describe("getSectionsWithLessons", () => {
    it("should return sections with lessons and total time for a course", async () => {
      const mockSections = [{ id: 1, name: "Section 1" }];
      const mockLessons = [
        { id: 1, time: 30 },
        { id: 2, time: 45 },
      ];

      mockSectionRepository.find.mockResolvedValue(mockSections);
      mockLessonRepository.find.mockResolvedValue(mockLessons);

      const result = await getSectionsWithLessons(1);

      expect(mockSectionRepository.find).toHaveBeenCalledWith({
        where: { course: { id: 1 } },
      });
      expect(mockLessonRepository.find).toHaveBeenCalledWith({
        where: { section: { id: 1 } },
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
      expect(result).toEqual([
        {
          ...mockSections[0],
          lessons: mockLessons,
          total_time: 75, 
        },
      ]);
    });
  });
});
});
