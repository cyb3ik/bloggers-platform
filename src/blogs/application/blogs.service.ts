import { WithId } from "mongodb";
import { blogsRepository } from "../repositories/blogsRepository";
import { BlogInputModel, BlogPostInputModel, PaginationBlogQuery, RawBlog } from "../models/blogTypes"
import { PaginationPostQuery, RawPost } from "../../posts/models/postTypes";
import { postsRepository } from "../../posts/repositories/postsRepository";

export const blogsService = {

    async findAll(query: PaginationBlogQuery): Promise<{totalCount: number, items: WithId<RawBlog>[]}> {
        return blogsRepository.findAllBlogs(query)
    },
    
    async findById(id: string): Promise<WithId<RawBlog>> {
        return blogsRepository.findBlog(id)
    },

    async findBlogPosts(id: string, query: PaginationPostQuery): Promise<{totalCount: number, items: WithId<RawPost>[]}> {
        const foundBlog = await blogsRepository.findBlog(id)
        return blogsRepository.findBlogPosts(String(foundBlog._id), query)
    },

    async create(body: BlogInputModel): Promise<string> {
        const newBlog: RawBlog = {
            createdAt: new Date().toISOString(),
            isMembership: false,
            ...body
        }

        return await blogsRepository.createBlog(newBlog)
    },

    async createPostForBlog(id: string, body: BlogPostInputModel): Promise<string> {
        const requiredBlog = await blogsRepository.findBlog(id)

        const newPostForBlog: RawPost = {
            createdAt: new Date().toISOString(),
            blogId: requiredBlog._id.toString(),
            blogName: requiredBlog.name,
            ...body
        }

        return await postsRepository.createPost(newPostForBlog)
    },

    async update(id: string, dto: BlogInputModel): Promise<void> {
        await blogsRepository.updateBlog(id, dto)
        return
    },

    async delete(id: string): Promise<void> {
        await blogsRepository.deleteBlog(id)
        return
    }
}