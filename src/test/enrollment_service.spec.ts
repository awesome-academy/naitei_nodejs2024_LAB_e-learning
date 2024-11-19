import { Enrollmentlesson } from './../entity/EnrollmentLesson';
import { Enrollment } from "./../entity/Enrollment";
import { faker } from "@faker-js/faker";
import { AppDataSource } from "../repos/db";
import { User } from "../entity/User";
import { Course } from "../entity/Course";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
import { UserRegisterDto } from "../entity/dto/user.dto";
import { UserGenderType, UserRoleType } from "../enum/user.enum";
import { CreateCourseDto } from "../entity/dto/course.dto";
import { Category } from "../entity/Category";
import { hasUserPaidForCourse } from "../service/payment.service";
import {
  countEnrolledUsersInCourse,
  enrollUserInCourse,
  getEnrollment,
  getEnrollmentProgress,
  getEnrollmentWithCourseAndUser,
  getLessons,
  markLessonAsDone,
  updateEnrollmentProgress,
} from "../service/enrollment.service";
import { CreateEnrollmentDto } from "../entity/dto/entrollment.dto";
import { LessonCreateDto } from "../entity/dto/lesson.dto";
import { LessonType } from "../enum/lesson.enum";
import { Lesson } from "../entity/Lesson";
import { CreateSectionDto } from "@src/entity/dto/section.dto";
import { Section } from "../entity/Section";

dotenv.config({ path: "test.env" });

let testDataSource: DataSource;
const userRepository = AppDataSource.getRepository(User);
const courseRepository = AppDataSource.getRepository(Course);
const categoryRepository = AppDataSource.getRepository(Category);
const enrollmentRepository = AppDataSource.getRepository(Enrollment);
const lessonRepository = AppDataSource.getRepository(Lesson);
const sectionRepository = AppDataSource.getRepository(Section);
const enrollmentlessonRepository = AppDataSource.getRepository(Enrollmentlesson);

beforeAll(async () => {
  testDataSource = await AppDataSource.initialize();
});

afterAll(async () => {
  await testDataSource.destroy();
});

beforeEach(async () => {
  await testDataSource.query("SET foreign_key_checks = 0;");

  await enrollmentlessonRepository.clear()
  await lessonRepository.clear();
  await sectionRepository.clear();
  await enrollmentRepository.clear();
  await courseRepository.clear();
  await categoryRepository.clear();
  await userRepository.clear();

  await testDataSource.query("SET foreign_key_checks = 1;");
});

describe("hasUserPurchasedCourse", () => {
  it("should return true if the user has purchased the course", async () => {
    const userDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.USER,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.MALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const user = await userRepository.save(userDto);

    const professorDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.PROFESSOR,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.FEMALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const professor = await userRepository.save(professorDto);

    const category = await categoryRepository.save({
      name: faker.commerce.department(),
    });

    const courseDto: CreateCourseDto = {
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: faker.number.int(),
      category_id: category.id,
      average_rating: faker.number.int({ min: 1, max: 5 }),
      professor_id: professor.id,
    };
    const course = await courseRepository.save(courseDto);

    const enrollment = await hasUserPaidForCourse(user.id, course.id);

    expect(enrollment).toBeTruthy();
    expect(enrollment).not.toBeNull();
  });
});

describe("enrollUserInCourse", () => {
  it("should throw an error if the user does not exist", async () => {
    const userDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.USER,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.MALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const user = await userRepository.save(userDto);

    const professorDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.PROFESSOR,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.FEMALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const professor = await userRepository.save(professorDto);

    const category = await categoryRepository.save({
      name: faker.commerce.department(),
    });

    const courseDto: CreateCourseDto = {
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: faker.number.int(),
      category_id: category.id,
      average_rating: faker.number.int({ min: 1, max: 5 }),
      professor_id: professor.id,
    };
    const course = await courseRepository.save(courseDto);

    try {
      await enrollUserInCourse(999, course.id);
    } catch (error) {
      expect(error.message).toBe(`User with ID 999 not found`);
    }
  });

  it("should throw an error if the course does not exist", async () => {
    const userDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.USER,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.MALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const user = await userRepository.save(userDto);

    const professorDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.PROFESSOR,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.FEMALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const professor = await userRepository.save(professorDto);

    const category = await categoryRepository.save({
      name: faker.commerce.department(),
    });

    const courseDto: CreateCourseDto = {
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: faker.number.int(),
      category_id: category.id,
      average_rating: faker.number.int({ min: 1, max: 5 }),
      professor_id: professor.id,
    };
    const course = await courseRepository.save(courseDto);

    try {
      await enrollUserInCourse(user.id, 1);
    } catch (error) {
      expect(error.message).toBe(`Course with ID 1 not found`);
    }
  });

  it("should enroll a user in a course successfully", async () => {
    const userDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.USER,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.MALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const user = await userRepository.save(userDto);

    const professorDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.PROFESSOR,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.FEMALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const professor = await userRepository.save(professorDto);

    const category = await categoryRepository.save({
      name: faker.commerce.department(),
    });

    const courseDto: CreateCourseDto = {
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: faker.number.int(),
      category_id: category.id,
      average_rating: faker.number.int({ min: 1, max: 5 }),
      professor_id: professor.id,
    };
    const course = await courseRepository.save(courseDto);
    const enrollment = await enrollUserInCourse(user.id, course.id);

    expect(enrollment).toBeDefined();
    expect(enrollment.user.id).toBe(user.id);
    expect(enrollment.course.id).toBe(course.id);
    expect(enrollment.progress).toBe(0);

    const savedEnrollment = await enrollmentRepository.findOne({
      where: { id: enrollment.id },
      relations: ["user", "course"],
    });
    expect(savedEnrollment).toBeDefined();
    expect(savedEnrollment?.user.id).toBe(user.id);
    expect(savedEnrollment?.course.id).toBe(course.id);
  });
});

describe("getEnrollmentWithCourseAndUser", () => {
  it("should return an existing enrollment if it exists", async () => {
    const userDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.USER,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.MALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const user = await userRepository.save(userDto);

    const professorDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.PROFESSOR,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.FEMALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const professor = await userRepository.save(professorDto);

    const category = await categoryRepository.save({
      name: faker.commerce.department(),
    });

    const courseDto: CreateCourseDto = {
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: faker.number.int(),
      category_id: category.id,
      average_rating: faker.number.int({ min: 1, max: 5 }),
      professor_id: professor.id,
    };
    const course = await courseRepository.save(courseDto);
    const existingEnrollmentDto: CreateEnrollmentDto = {
      user_id: user.id,
      course_id: course.id,
      progress: faker.number.int({ min: 1, max: 100 }),
      enrollment_date: new Date(),
    };
    const enrollment = await enrollmentRepository.save(existingEnrollmentDto);
    const result = await getEnrollmentWithCourseAndUser(user.id, course.id);

    expect(result).toBeDefined();
    expect(result?.id).toEqual(enrollment.id);
  });

  it("should create a new enrollment if one does not exist", async () => {
    const userDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.USER,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.MALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const user = await userRepository.save(userDto);

    const professorDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.PROFESSOR,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.FEMALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const professor = await userRepository.save(professorDto);

    const category = await categoryRepository.save({
      name: faker.commerce.department(),
    });

    const courseDto: CreateCourseDto = {
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: faker.number.int(),
      category_id: category.id,
      average_rating: faker.number.int({ min: 1, max: 5 }),
      professor_id: professor.id,
    };
    const course = await courseRepository.save(courseDto);

    const result = await getEnrollmentWithCourseAndUser(user.id, course.id);

    expect(result).toBeDefined();
    expect(result?.user_id).toEqual(user.id);
    expect(result?.course_id).toEqual(course.id);
    expect(result?.progress).toBe(0);
  });

  it("should throw an error if the user does not exist", async () => {
    const userDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.USER,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.MALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const user = await userRepository.save(userDto);

    const professorDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.PROFESSOR,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.FEMALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const professor = await userRepository.save(professorDto);

    const category = await categoryRepository.save({
      name: faker.commerce.department(),
    });

    const courseDto: CreateCourseDto = {
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: faker.number.int(),
      category_id: category.id,
      average_rating: faker.number.int({ min: 1, max: 5 }),
      professor_id: professor.id,
    };
    const course = await courseRepository.save(courseDto);

    try {
      await getEnrollmentWithCourseAndUser(999, course.id);
    } catch (error) {
      expect(error.message).toBe(`User with ID 999 not found`);
    }
  });

  it("should throw an error if the course does not exist", async () => {
    const userDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.USER,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.MALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const user = await userRepository.save(userDto);

    try {
      await getEnrollmentWithCourseAndUser(user.id, 999);
    } catch (error) {
      expect(error.message).toBe(`Course with ID 999 not found`);
    }
  });
});

describe("countEnrolledUsersInCourse", () => {
  it("should return the correct count of enrolled users for a course", async () => {
    const userDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.USER,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.MALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const user = await userRepository.save(userDto);

    const professorDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.PROFESSOR,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.FEMALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const professor = await userRepository.save(professorDto);

    const category = await categoryRepository.save({
      name: faker.commerce.department(),
    });

    const courseDto: CreateCourseDto = {
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: faker.number.int(),
      category_id: category.id,
      average_rating: faker.number.int({ min: 1, max: 5 }),
      professor_id: professor.id,
    };
    const course = await courseRepository.save(courseDto);
    const existingEnrollmentDto: CreateEnrollmentDto = {
      user_id: user.id,
      course_id: course.id,
      progress: faker.number.int({ min: 1, max: 100 }),
      enrollment_date: new Date(),
    };
    const enrollment = await enrollmentRepository.save(existingEnrollmentDto);

    const count = await countEnrolledUsersInCourse(enrollment.id);

    expect(count).toBe(1);
  });

  it("should return 0 if no users are enrolled in the course", async () => {
    const professorDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.PROFESSOR,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.FEMALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const professor = await userRepository.save(professorDto);

    const category = await categoryRepository.save({
      name: faker.commerce.department(),
    });

    const courseDto: CreateCourseDto = {
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: faker.number.int(),
      category_id: category.id,
      average_rating: faker.number.int({ min: 1, max: 5 }),
      professor_id: professor.id,
    };
    const course = await courseRepository.save(courseDto);
    const count = await countEnrolledUsersInCourse(course.id);

    expect(count).toBe(0);
  });
});

describe("getEnrollment", () => {
  it("should return the enrollment if the user is enrolled in the course", async () => {
    const userDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.USER,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.MALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const user = await userRepository.save(userDto);

    const professorDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.PROFESSOR,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.FEMALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const professor = await userRepository.save(professorDto);

    const category = await categoryRepository.save({
      name: faker.commerce.department(),
    });

    const courseDto: CreateCourseDto = {
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: faker.number.int(),
      category_id: category.id,
      average_rating: faker.number.int({ min: 1, max: 5 }),
      professor_id: professor.id,
    };
    const course = await courseRepository.save(courseDto);
    const existingEnrollmentDto: CreateEnrollmentDto = {
      user_id: user.id,
      course_id: course.id,
      progress: faker.number.int({ min: 1, max: 100 }),
      enrollment_date: new Date(),
    };
    const enrollment = await enrollmentRepository.save(existingEnrollmentDto);
    const result = await getEnrollment(user.id, course.id);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(enrollment.id);
    expect(result?.user.id).toBe(user.id);
    expect(result?.course.id).toBe(course.id);
  });
  it("should return null if the user is not enrolled in the course", async () => {
    const professorDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.PROFESSOR,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.FEMALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const professor = await userRepository.save(professorDto);

    const category = await categoryRepository.save({
      name: faker.commerce.department(),
    });

    const courseDto: CreateCourseDto = {
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: faker.number.int(),
      category_id: category.id,
      average_rating: faker.number.int({ min: 1, max: 5 }),
      professor_id: professor.id,
    };
    const course = await courseRepository.save(courseDto);
    const result = await getEnrollment(1, course.id);

    expect(result).toBeNull();
  });
});

describe("getEnrollmentProgress", () => {
  it("should return the progress of the user for the provided courses", async () => {
    const userDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.USER,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.MALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const user = await userRepository.save(userDto);

    const professorDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.PROFESSOR,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.FEMALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const professor = await userRepository.save(professorDto);

    const category = await categoryRepository.save({
      name: faker.commerce.department(),
    });
    const courses = await Promise.all(
      [1, 2].map(async () => {
        const courseDto: CreateCourseDto = {
          name: faker.commerce.productName(),
          description: faker.lorem.paragraph(),
          price: faker.number.int(),
          category_id: category.id,
          average_rating: faker.number.int({ min: 1, max: 5 }),
          professor_id: professor.id,
        };
        return await courseRepository.save(courseDto);
      })
    );
    const courseIds = courses.map((course) => course.id);
    const result = await getEnrollmentProgress(user.id, courseIds);

    result.forEach((progress, index) => {
      expect(progress.course_id).toBe(courses[index].id);
      expect(progress.progress).toBe(index * 50);
      expect(progress.course_name).toBe(courses[index].name);
    });
  });
});

describe("getLessons", () => {
  beforeEach(async () => {
    await lessonRepository.query("SET foreign_key_checks = 0;");
  
    await lessonRepository.clear();
    await sectionRepository.clear();
    await enrollmentRepository.clear();
    await courseRepository.clear();
    await categoryRepository.clear();
    await userRepository.clear();
  
    await lessonRepository.query("SET foreign_key_checks = 1;");
  });
  it("should return the lessons of the course", async () => {
    const professorDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.PROFESSOR,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.FEMALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const professor = await userRepository.save(professorDto);

    const category = await categoryRepository.save({
      name: faker.commerce.department(),
    });

    const courseDto: CreateCourseDto = {
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: faker.number.int(),
      category_id: category.id,
      average_rating: faker.number.int({ min: 1, max: 5 }),
      professor_id: professor.id,
    };
    const course = await courseRepository.save(courseDto);
    const sectionData: CreateSectionDto = {
      name: faker.commerce.productName(),
      course_id: course.id,
    };
    const section = await sectionRepository.save(sectionData);
    const lessonDtos: LessonCreateDto[] = [
      {
        name: "Lesson 1",
        type: faker.helpers.arrayElement([
          LessonType.VIDEO,
          LessonType.URL,
          LessonType.PDF,
          LessonType.TEXT,
        ]),
        content: faker.lorem.paragraph(),
        description: faker.lorem.sentence(),
        time: faker.number.int(),
        section_id: section.id,
      },
      {
        name: "Lesson 2",
        type: faker.helpers.arrayElement([
          LessonType.VIDEO,
          LessonType.URL,
          LessonType.PDF,
          LessonType.TEXT,
        ]),
        content: faker.lorem.paragraph(),
        description: faker.lorem.sentence(),
        time: faker.number.int(),
        section_id: section.id,
      },
      {
        name: "Lesson 3",
        type: faker.helpers.arrayElement([
          LessonType.VIDEO,
          LessonType.URL,
          LessonType.PDF,
          LessonType.TEXT,
        ]),
        content: faker.lorem.paragraph(),
        description: faker.lorem.sentence(),
        time: faker.number.int(),
        section_id: section.id,
      },
    ];
    const lessons = lessonDtos.map((lessonDto) => lessonDto);

    const courseLessons = await getLessons(course.id);

    expect(courseLessons.length).toBe(3);

    expect(courseLessons[0].name).toBe("Lesson 1");
    expect(courseLessons[1].name).toBe("Lesson 2");
    expect(courseLessons[2].name).toBe("Lesson 3");

    expect(courseLessons[0].content).toBeTruthy();
    expect(courseLessons[0].description).toBeTruthy();
    expect(courseLessons[0].time).toBeTruthy();
  });
});

describe("markLessonAsDone", () => {
  it('should mark the lesson as done and return the updated enrollment lesson', async () => {
    const userDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.USER,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.MALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const user = await userRepository.save(userDto);

    const professorDto: UserRegisterDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRoleType.PROFESSOR,
      phone_number: faker.string.numeric(10),
      date_of_birth: faker.date.past(),
      gender: UserGenderType.FEMALE,
      address: faker.location.streetAddress(),
      identity_card: faker.number
        .int({ min: 100000000, max: 999999999 })
        .toString(),
      additional_info: faker.lorem.sentence(),
      department: faker.commerce.department(),
      years_of_experience: faker.number.int({ min: 1, max: 30 }),
    };
    const professor = await userRepository.save(professorDto);

    const category = await categoryRepository.save({
      name: faker.commerce.department(),
    });

    const courseDto: CreateCourseDto = {
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: faker.number.int(),
      category_id: category.id,
      average_rating: faker.number.int({ min: 1, max: 5 }),
      professor_id: professor.id,
    };
    const course = await courseRepository.save(courseDto);
    const sectionDto: CreateSectionDto = {
      name: faker.commerce.productName(),
      course_id: course.id,
    };
    const section = await sectionRepository.save(sectionDto);
    const lessonDto: LessonCreateDto = {
      name: faker.commerce.productName(),
      type: faker.helpers.arrayElement([
        LessonType.PDF,
        LessonType.TEXT,
        LessonType.VIDEO,
        LessonType.URL,
      ]),
      content: faker.lorem.paragraph(),
      description: faker.lorem.sentence(),
      time: faker.number.int(),
      section_id: section.id,
    }
    const lesson = await lessonRepository.save(lessonDto);
    const existingEnrollmentDto: CreateEnrollmentDto = {
      user_id: user.id,
      course_id: course.id,
      progress: faker.number.int({ min: 1, max: 100 }),
      enrollment_date: new Date(),
    };
    const enrollment = await enrollmentRepository.save(existingEnrollmentDto);
    const result = await markLessonAsDone(lesson.id, enrollment.id);

    expect(result?.progress).toBe(100);

    expect(result?.lesson_id).toBe(lesson.id);
    expect(result?.enrollment_id).toBe(enrollment.id);
  });
})

  describe("updateEnrollmentProgress", () => {
    it('should update the enrollment progress correctly and set the completion date when all lessons are completed', async () => {
      const userDto: UserRegisterDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: UserRoleType.USER,
        phone_number: faker.string.numeric(10),
        date_of_birth: faker.date.past(),
        gender: UserGenderType.MALE,
        address: faker.location.streetAddress(),
        identity_card: faker.number
          .int({ min: 100000000, max: 999999999 })
          .toString(),
        additional_info: faker.lorem.sentence(),
        department: faker.commerce.department(),
        years_of_experience: faker.number.int({ min: 1, max: 30 }),
      };
      const user = await userRepository.save(userDto);

      const professorDto: UserRegisterDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: UserRoleType.PROFESSOR,
        phone_number: faker.string.numeric(10),
        date_of_birth: faker.date.past(),
        gender: UserGenderType.FEMALE,
        address: faker.location.streetAddress(),
        identity_card: faker.number
          .int({ min: 100000000, max: 999999999 })
          .toString(),
        additional_info: faker.lorem.sentence(),
        department: faker.commerce.department(),
        years_of_experience: faker.number.int({ min: 1, max: 30 }),
      };
      const professor = await userRepository.save(professorDto);

      const category = await categoryRepository.save({
        name: faker.commerce.department(),
      });

      const courseDto: CreateCourseDto = {
        name: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        price: faker.number.int(),
        category_id: category.id,
        average_rating: faker.number.int({ min: 1, max: 5 }),
        professor_id: professor.id,
      };
      const course = await courseRepository.save(courseDto);
      const existingEnrollmentDto: CreateEnrollmentDto = {
        user_id: user.id,
        course_id: course.id,
        progress: 100,
        enrollment_date: new Date(),
      }
      const enrollment = await enrollmentRepository.save(existingEnrollmentDto);
  
      await updateEnrollmentProgress(enrollment.id);
  
      const updatedEnrollment = await enrollmentRepository.findOne({
        where: { id: enrollment.id },
      });
  
      expect(updatedEnrollment?.progress).toBe(100); 
      expect(updatedEnrollment?.completion_date).toBeDefined(); 
    })
  })
