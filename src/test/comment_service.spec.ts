import { faker } from "@faker-js/faker";
import { AppDataSource } from "../repos/db";
import {
  createComment,
  deleteComment,
  findChildComments,
  findCommentById,
  getAllComments,
  getAllCommentsByCourseId,
  getCommentsWithDetails,
  updateComment,
} from "../service/comment.service";
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
import { CommentDTO, CreateCommentDto } from "../entity/dto/comment.dto";

dotenv.config({ path: "test.env" });

let testDataSource: DataSource;
const userRepository = AppDataSource.getRepository(User);
const courseRepository = AppDataSource.getRepository(Course);
const categoryRepository = AppDataSource.getRepository(Category);
const reviewRepository = AppDataSource.getRepository(Review);
const commentRepository = AppDataSource.getRepository(Comment);

beforeAll(async () => {
  testDataSource = await AppDataSource.initialize();
});

afterAll(async () => {
  await testDataSource.destroy();
});

beforeEach(async () => {
  await commentRepository.query("SET foreign_key_checks = 0;");

  await commentRepository.clear();
  await reviewRepository.clear();
  await courseRepository.clear();
  await categoryRepository.clear();
  await userRepository.clear();

  await commentRepository.query("SET foreign_key_checks = 1;");
});

describe("getAllComments", () => {
  it("should return all comments", async () => {
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

    const reviewData: CreateReviewDto = {
      user_id: user.id,
      course_id: course.id,
      rating: faker.number.int({ min: 1, max: 5 }),
    };
    const review = await reviewRepository.save(reviewData);

    const numberOfComments = 3;
    const commentsData = [];
    for (let i = 0; i < numberOfComments; i++) {
      const commentDto = {
        comment_text: faker.lorem.sentence(),
        created_at: new Date(),
        user_id: user.id,
        course_id: course.id,
        review_id: review.id,
      };
      const comment = await commentRepository.save(commentDto);
      commentsData.push(comment);
    }

    const comments = await getAllComments();
    expect(comments).toBeTruthy();
    expect(comments.length).toBeGreaterThanOrEqual(numberOfComments);
    commentsData.forEach((fakeComment) => {
      const matchedComment = comments.find((c) => c.id === fakeComment.id);
      expect(matchedComment).toBeTruthy();
      expect(matchedComment?.comment_text).toBe(fakeComment.comment_text);
      expect(matchedComment?.user_id).toBe(fakeComment.user_id);
      expect(matchedComment?.review_id).toBe(fakeComment.review_id);
      expect(matchedComment?.course_id).toBe(fakeComment.course_id);
      expect(matchedComment?.parent_id).toBe(fakeComment.parent_id);
    });
  });
});


describe("createComment", () => {
  it("should create a comment", async () => {
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

    const reviewData: CreateReviewDto = {
      user_id: user.id,
      course_id: course.id,
      rating: faker.number.int({ min: 1, max: 5 }),
    };
    const review = await reviewRepository.save(reviewData);

    const comment = await createComment(
      review.id,
      user.id,
      null,
      "great!",
      course.id
    );
    expect(comment).toBeTruthy();
    expect(comment.comment_text).toBe("great!");
    expect(comment.course_id).toBe(course.id);
  });
});

describe("getCommentsWithDetails", () => {
  it("should retrieve comments with related user and course details", async () => {
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

    const commentDto = {
      comment_text: faker.lorem.sentence(),
      created_at: new Date(),
      user_id: user.id,
      course_id: course.id,
      review_id: review.id,
    };

    const comment = await commentRepository.save(commentDto);

    const comments = await getCommentsWithDetails();

    expect(comments).toBeDefined();
    expect(comments).not.toEqual([]);
    comments.forEach((comment) => {
      expect(comment.id).toBeDefined();
      expect(comment.comment_text).toBeDefined();
      expect(comment.created_at).toBeDefined();

      expect(comment.user).toBeDefined();
      expect(comment.user.name).toBeDefined();
      expect(comment.user.name).toEqual(user.name);

      expect(comment.course).toBeDefined();
      expect(comment.course.name).toBeDefined();
      expect(comment.course.name).toEqual(course.name);
    });
  });
});

describe("getAllCommentsByCourseId", () => {
  it("should return all comments by course id with nested structure", async () => {
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

    const parentDto: CommentDTO = {
      review_id: review.id,
      user_id: user.id,
      comment_text: faker.lorem.sentence(),
      parent_id: undefined,
      course_id: course.id,
    };
    const parentComment = await commentRepository.save(parentDto);

    const childCommentDto = {
      comment_text: faker.lorem.sentence(),
      user_id: user.id,
      course_id: course.id,
      review_id: review.id,
      parent_id: parentComment.id,
    };
    const childComment = await commentRepository.save(childCommentDto);

    const nestedComments = await getAllCommentsByCourseId(course.id);

    expect(nestedComments.length).toBe(1);
    expect(nestedComments[0].children.length).toBe(1);
    expect(nestedComments[0].children[0].id).toBe(childComment.id);
  });
});

describe("findCommentById", () => {
  it("should find a comment by its ID", async () => {
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

    const commentDto = {
      comment_text: faker.lorem.sentence(),
      created_at: new Date(),
      user_id: user.id,
      course_id: course.id,
      review_id: review.id,
    };

    const comment = await commentRepository.save(commentDto);

    const foundComment = await findCommentById(comment.id);

    expect(foundComment).toBeDefined();
    expect(foundComment).not.toBeNull();
    expect(foundComment?.id).toBe(comment.id);
    expect(foundComment?.comment_text).toBe(comment.comment_text);
  });
  it("should return null if comment does not exist", async () => {
    const nonExistentComment = await findCommentById(9999);
    expect(nonExistentComment).toBeNull();
  });
});

describe("findChildComments", () => {
  it("should return child comments for a given parent_id", async () => {
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

    const parentDto: CommentDTO = {
      review_id: review.id,
      user_id: user.id,
      comment_text: faker.lorem.sentence(),
      parent_id: undefined,
      course_id: course.id,
    };
    const parentComment = await commentRepository.save(parentDto);

    const commentDto = {
      comment_text: faker.lorem.sentence(),
      created_at: new Date(),
      user_id: user.id,
      course_id: course.id,
      review_id: review.id,
      parent_id: parentComment.id,
    };
    const comment = await commentRepository.save(commentDto);

    const childComments = await findChildComments(parentComment.id);
    expect(childComments).toBeInstanceOf(Array);
    expect(childComments.length).toBeGreaterThan(0);
    expect(childComments[0].comment_text).toBeDefined();
    expect(childComments[0].user_id).toBeDefined();
    expect(childComments[0].course_id).toBeDefined();
    expect(childComments[0].review_id).toBeDefined();
    expect(childComments[0].parent_id).toBe(parentComment.id);
  });
});

describe("deleteComment", () => {
  it("should delete comment successfully", async () => {
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

    const commentDto: CommentDTO = {
      review_id: review.id,
      user_id: user.id,
      comment_text: faker.lorem.sentence(),
      parent_id: undefined,
      course_id: course.id,
    };
    const comment = await commentRepository.save(commentDto);
    const result = await deleteComment(comment.id);

    expect(result).toEqual({ affected: 1, raw: [] });
  });
});

describe("updateComment", () => {
  it("should update comment successfully", async () => {
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

    const commentDto: CommentDTO = {
      review_id: review.id,
      user_id: user.id,
      comment_text: faker.lorem.sentence(),
      parent_id: undefined,
      course_id: course.id,
    };
    const comment = await commentRepository.save(commentDto);
    const result = await updateComment(comment);

    expect(result).toBeDefined();
  });
});
