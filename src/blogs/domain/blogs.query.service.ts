import { WithId } from "mongodb";
import { PaginationPostQuery, RawPost } from "../../posts/models/postTypes";
import { blogsQyRepository } from "../repositories/blogsQyRepository";
import { postsQyRepository } from "../../posts/repositories/postsQyRepository";
import { PaginationBlogQuery, RawBlog } from "../models/blogTypes";

export const blogsQueryService = {
    async findAll(query: PaginationBlogQuery): Promise<{totalCount: number, items: WithId<RawBlog>[]}> {
        return await blogsQyRepository.findAllBlogs(query)
    },

    async findById(id: string): Promise<WithId<RawBlog>> {
        return await blogsQyRepository.findBlog(id)
    },

    async findBlogPosts(blogId: string, query: PaginationPostQuery): Promise<{totalCount: number, items: WithId<RawPost>[]}> {
        const foundBlog = await blogsQyRepository.findBlog(blogId)

        return await postsQyRepository.findBlogPosts(String(foundBlog._id), query)
    }
}