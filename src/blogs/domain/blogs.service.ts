import { blogsRepository } from "../repositories/blogsRepository";
import { BlogInputModel, BlogPostInputModel, RawBlog } from "../models/blogTypes"
import { RawPost } from "../../posts/models/postTypes";
import { postsRepository } from "../../posts/repositories/postsRepository";
import { blogsQyRepository } from "../repositories/blogsQyRepository";

export const blogsService = {

    async createBlog(body: BlogInputModel): Promise<string> {
        const newBlog: RawBlog = {
            createdAt: new Date().toISOString(),
            isMembership: false,
            ...body
        }

        return await blogsRepository.createBlog(newBlog)
    },

    async createPostForBlog(id: string, body: BlogPostInputModel): Promise<string> {
        const requiredBlog = await blogsRepository.findBlogById(id)

        const newPostForBlog: RawPost = {
            createdAt: new Date().toISOString(),
            blogId: requiredBlog._id.toString(),
            blogName: requiredBlog.name,
            ...body
        }

        return await postsRepository.createPost(newPostForBlog)
    },

    async updateBlogById(id: string, dto: BlogInputModel): Promise<void> {
        return await blogsRepository.updateBlogById(id, dto)
    },

    async deleteBlogById(id: string): Promise<void> {
        return await blogsRepository.deleteBlogById(id)
    }
}