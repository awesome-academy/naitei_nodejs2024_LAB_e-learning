import { AppDataSource } from "../repos/db";
import { Review } from "../entity/Review";

const reviewRepository = AppDataSource.getRepository(Review);

export const getReviewByCourseId = (courseId: number) => {
  return reviewRepository.find({
    where: { course_id: courseId },
    relations: ["user", "comments"],
  });
};

export const createReview = (
  user_id: number,
  rating: number,
  course_id: number
) => {
  return reviewRepository.save({
    user_id,
    rating,
    course_id,
  });
};
