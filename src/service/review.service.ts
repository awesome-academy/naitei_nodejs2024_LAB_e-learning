import { AppDataSource } from "../repos/db";
import { Review } from "../entity/Review";

const reviewRepository = AppDataSource.getRepository(Review);

export const getReviewByCourseId = async (courseId: number): Promise<Review[]> => {
  return await AppDataSource.getRepository(Review).find({
    where: { course: { id: courseId } },
    relations: ["user", "comments", "course"], 
  });
};

export const getReviewsWithDetails = async () => {
  return await reviewRepository.find({
    relations: {
      user: true,
      course: true,
      comments: {
        user: true,
      },
    },
    select: {
      id: true,
      rating: true,
      created_at: true,
      user: {
        name: true,
      },
      course: {
        name: true,
      },
      comments: {
        id: true,
        comment_text: true,
        created_at: true,
        user: {
          name: true,
        },
      },
    },
    order: { created_at: "DESC" },
  });
};

export const createReview = (
  user_id: number,
  rating: number,
  course_id: number
) => {
  if (course_id <= 0) {
    return Promise.reject(new Error("Invalid course ID"));
  }
  return reviewRepository.save({
    user_id,
    rating,
    course_id,
  });
};
