import { WithId } from "mongodb";
import { PaginationPostQuery, RawPost } from "../../posts/models/postTypes";
import { blogsQyRepository } from "../repositories/blogsQyRepository";
import { postsQyRepository } from "../../posts/repositories/postsQyRepository";
import { PaginationBlogQuery, RawBlog } from "../models/blogTypes";

export const blogsQueryService = {
    async findAllBlogs(query: PaginationBlogQuery): Promise<{totalCount: number, items: WithId<RawBlog>[]}> {
        return await blogsQyRepository.findAllBlogs(query)
    },

    async findBlogById(id: string): Promise<WithId<RawBlog>> {
        return await blogsQyRepository.findBlogById(id)
    },

    async findBlogPosts(blogId: string, query: PaginationPostQuery): Promise<{totalCount: number, items: WithId<RawPost>[]}> {
        const foundBlog = await blogsQyRepository.findBlogById(blogId)

        return await postsQyRepository.findBlogPosts(String(foundBlog._id), query)
    }
}