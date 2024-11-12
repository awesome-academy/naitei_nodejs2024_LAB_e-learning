import { AppDataSource } from "../repos/db";
import { Comment } from "../entity/Comment";

interface NestedComment extends Comment {
  children: NestedComment[];
}

const commentRepository = AppDataSource.getRepository(Comment);

export const getAllComments = async () => {
  return await commentRepository.find({
    relations: ["review"],
  });
};

export const createComment = async (
  review_id: number,
  user_id: number,
  parent_id: number,
  comment_text: string,
  course_id: number
) => {

  return await commentRepository.save({
    review_id,
    user_id,
    parent_id,
    comment_text,
    course_id
  });
};

export const getCommentsWithDetails = async () => {
  return await commentRepository.find({
    relations: {
      user: true,
      course: true,  
    },
    select: {
      id: true,
      comment_text: true,
      created_at: true,
      user: {
        name: true,
      },
      course: {
        name: true,  
      },
    },
  });
};


export const getAllCommentsByCourseId = async (courseId: number) => {
  const comments = await commentRepository.find({
    where: { review: { course_id: courseId } },
    relations: ["review", "user"],
  });

  const commentMap: Record<number, NestedComment> = {};

  // Create a map for accessing comments by ID
  comments.forEach((comment) => {
    commentMap[comment.id] = { ...comment, children: [] };
  });

  const nestedComments: NestedComment[] = [];

  comments.forEach((comment) => {
    if (comment.parent_id) {
      const parentComment = commentMap[comment.parent_id];
      if (parentComment) {
        // Only push if the parentComment exists
        parentComment.children.push(commentMap[comment.id]);
      } else {
        console.warn(`Parent comment with ID ${comment.parent_id} not found`);
      }
    } else {
      nestedComments.push(commentMap[comment.id]);
    }
  });

  return nestedComments;
};

export const findCommentById = async (id: number) => {
  return await commentRepository.findOne({
    where: { id: id },
    relations: ["review"],
  });
};

export const findChildComments = async (
  parent_id: number
): Promise<Comment[]> => {
  return await commentRepository.find({ where: { parent_id } }); // Tìm các comment có parentId là parentId
};

export const deleteComment = async (commentId: number) => {
  return await commentRepository.delete(commentId); // Xóa comment bằng commentId
};
export const updateComment = async (comment: Comment) => {
  return await commentRepository.save(comment);
};
