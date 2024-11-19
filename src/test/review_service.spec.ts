import { faker } from "@faker-js/faker";
import { AppDataSource } from "../repos/db";
import {
  createReview,
  getReviewsWithDetails,
  getReviewByCourseId,
} from "../service/review.service";
import { Review } from "../entity/Review";
import { User } from "../entity/User";
import { Comment } from "../entity/Comment";
import { Course } from "../entity/Course";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
import { UserRegisterDto } from "../entity/dto/user.dto";
import { UserGenderType, UserRoleType } from "../enum/user.enum";
import { CreateCourseDto } from "../entity/dto/course.dto";
import { Category } from "../entity/Category";
import { CreateReviewDto } from "../entity/dto/review.dto";
import { CommentDTO } from "@src/entity/dto/comment.dto";

dotenv.config({ path: "test.env" });

let testDataSource: DataSource;

beforeAll(async () => {
  testDataSource = await AppDataSource.initialize();
});

afterAll(async () => {
  await testDataSource.destroy();
});

describe("createReview", () => {
  const userRepository = AppDataSource.getRepository(User);
  const courseRepository = AppDataSource.getRepository(Course);
  const categoryRepository = AppDataSource.getRepository(Category);
  it("should save a review with the given user_id, rating, and course_id", async () => {
    const userRegisterDto: UserRegisterDto = {
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
    const user = await userRepository.save(userRegisterDto);

    const professorRegisterDto: UserRegisterDto = {
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
    const professor = await userRepository.save(professorRegisterDto);

    const category = await categoryRepository.save({
      name: faker.commerce.department(),
    });

    const courseData: CreateCourseDto = {
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: faker.number.int(),
      category_id: category.id,
      average_rating: faker.number.int({ min: 1, max: 5 }),
      professor_id: professor.id,
    };
    const course = await courseRepository.save(courseData);

    const review = await createReview(user.id, 5, course.id);

    expect(review).toBeDefined();
    expect(review.user_id).toBe(user.id);
    expect(review.rating).toBe(5);
    expect(review.course_id).toBe(course.id);
  });

  it("should throw an error if course_id is invalid", async () => {
    const userRegisterDto: UserRegisterDto = {
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
    const user = await userRepository.save(userRegisterDto);
    const invalidCourseId = -1;

    try {
      await createReview(user.id, 5, invalidCourseId);
    } catch (error) {
      expect(error.message).toBe("Invalid course ID");
    }
  });
});

describe("getReviewByCourseId", () => {
  beforeEach(async () => {
    await commentRepository.query("SET foreign_key_checks = 0;");

    await commentRepository.clear();
    await reviewRepository.clear();
    await courseRepository.clear();
    await categoryRepository.clear();
    await userRepository.clear();

    await commentRepository.query("SET foreign_key_checks = 1;");
  });
  const userRepository = AppDataSource.getRepository(User);
  const courseRepository = AppDataSource.getRepository(Course);
  const categoryRepository = AppDataSource.getRepository(Category);
  const reviewRepository = AppDataSource.getRepository(Review);
  const commentRepository = AppDataSource.getRepository(Comment);
  it("should retrieve reviews with related user and comments for a given course id", async () => {
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

    const reviewDto: CreateReviewDto = {
      user_id: user.id,
      course_id: course.id,
      rating: faker.number.int({ min: 1, max: 5 }),
    };
    const review = await reviewRepository.save(reviewDto);

    const reviews = await getReviewByCourseId(reviewDto.course_id);
    
    expect(reviews).toBeDefined();
    expect(reviews).not.toEqual([]);
    reviews.forEach((review) => {
      expect(review.course).toBeDefined();
      expect(review.course?.id).toBe(reviewDto.course_id);
    });
  });

  it("should return an empty array when course id does not exist", async () => {
    const course_id = -1;
    const reviews = await getReviewByCourseId(course_id);

    expect(reviews).toEqual([]);
  });
});

describe("getReviewsWithDetails", () => {
  const userRepository = AppDataSource.getRepository(User);
  const courseRepository = AppDataSource.getRepository(Course);
  const categoryRepository = AppDataSource.getRepository(Category);
  const reviewRepository = AppDataSource.getRepository(Review);
  const commentRepository = AppDataSource.getRepository(Comment);

  it("should retrieve reviews with user, course, and comments details", async () => {
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
      id: faker.number.int(),
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

    const reviewDto: CreateReviewDto = {
      user_id: user.id,
      course_id: course.id,
      rating: faker.number.int({ min: 1, max: 5 }),
    };
    const review = await reviewRepository.save(reviewDto);

    const commentDto: CommentDTO = {
      review_id: review.id,
      user_id: user.id,
      comment_text: faker.lorem.sentence(),
      parent_id: faker.number.int(),
      course_id: course.id,
    };
    const comment = await commentRepository.save(commentDto);

    const reviews = await getReviewsWithDetails();

    expect(reviews).toBeInstanceOf(Array);
    expect(reviews.length).toBeGreaterThan(0);

    const firstReview = reviews[0];
    expect(firstReview.id).toBeDefined();
    expect(firstReview.rating).toBeDefined();
    expect(firstReview.created_at).toBeDefined();
    expect(firstReview.user.name).toBeDefined();
    expect(firstReview.course.name).toBeDefined();
    expect(firstReview.comments).toBeInstanceOf(Array);

    expect(firstReview.user.name).toBe(user.name);
    expect(firstReview.course.name).toBe(course.name);

    const firstComment = firstReview.comments[0];
    expect(firstComment.id).toBeDefined();
    expect(firstComment.comment_text).toBeDefined();
    expect(firstComment.created_at).toBeDefined();
    expect(firstComment.user.name).toBeDefined();

    expect(firstComment.user.name).toBe(user.name);
    expect(firstComment.comment_text).toBe(comment.comment_text);
  });
});
