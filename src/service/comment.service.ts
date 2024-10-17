import { AppDataSource } from "../repos/db";
import { Comment } from "../entity/Comment";

const commentRepository = AppDataSource.getRepository(Comment)

export const getAllComments = async () => {
    return await commentRepository.find({
        relations: ['review']
    })
}

export const createComment = async (commentData: Partial<Comment>) => {
    const newComment = await commentRepository.create(commentData)
    return commentRepository.save(newComment)
}

export const findCommentById = async (id: number) => {
    return await commentRepository.findOne({
        where: { id: id },
        relations: ['review'] 
    })
}

export const saveComment = async (comment: Comment) => {
    return await commentRepository.save(comment)
}

export const deleteComment = async (comment: Comment) => {
    return await commentRepository.remove(comment)
}
