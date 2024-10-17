import { AppDataSource } from "../repos/db";
import { Review } from "../entity/Review";

const reviewRepository = AppDataSource.getRepository(Review)

export const getAllReviews = async () => {
    return await reviewRepository.find({
        relations: ['user', 'course']
    })
}

export const createReview = async (reviewData: Partial<Review>) => {
    const newReview = await reviewRepository.create(reviewData)
    return reviewRepository.save(newReview)
}

export const findReviewById = async (id: number) => {
    return await reviewRepository.findOne({
        where: { id: id },
        relations: ['user', 'course'] 
    })
}

export const saveReview = async (review: Review) => {
    return await reviewRepository.save(review)
}

export const deleteReview = async (review: Review) => {
    return await reviewRepository.remove(review)
}
