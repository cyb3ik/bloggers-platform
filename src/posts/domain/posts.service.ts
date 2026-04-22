import { postsRepository } from "../repositories/postsRepository";
import { PostInputModel, RawPost } from "../models/postTypes";
import { blogsQyRepository } from "../../blogs/repositories/blogsQyRepository";
import { CommentInputModel, RawComment } from "../../comments/models/commentTypes";
import { commentsRepository } from "../../comments/repositories/commentsRepository";
import { WithId } from "mongodb";
import { RawUser } from "../../users/models/userTypes";

export const postsService = {

    async createPost(body: PostInputModel): Promise<string> {
        const requiredBlog = await blogsQyRepository.findBlogById(body.blogId)

        const newPost: RawPost = {
            blogName: requiredBlog.name,
            createdAt: new Date().toISOString(),
            ...body
        }

        return await postsRepository.createPost(newPost)
    },

    async createCommentForPost(id: string, user: WithId<RawUser>, body: CommentInputModel): Promise<string> {
        const requiredPost = await postsRepository.findPostById(id)

        const newCommentForPost: RawComment = {
            content: body.content,
            createdAt: new Date().toISOString(),
            commentatorInfo: {
                userId: user._id.toString(),
                userLogin: user.login
            },
            postId: requiredPost._id.toString()
        }

        return await commentsRepository.createComment(newCommentForPost)
    },

    async updatePostById(id: string, dto: PostInputModel): Promise<void> {
        return await postsRepository.updatePostById(id, dto)
    },

    async deletePostById(id: string): Promise<void> {
        return await postsRepository.deletePostById(id)
    }
}