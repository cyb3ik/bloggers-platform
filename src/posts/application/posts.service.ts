import { WithId } from "mongodb";
import { postsRepository } from "../repositories/postsRepository";
import { PaginationPostQuery, PostInputModel, RawPost } from "../models/postTypes";
import { blogsRepository } from "../../blogs/repositories/blogsRepository";

export const postsService = {

    async findAll(query: PaginationPostQuery): Promise<{totalCount: number, items: WithId<RawPost>[]}> {
        return postsRepository.findAllPosts(query)
    },

    async findById(id: string): Promise<WithId<RawPost>> {
        return postsRepository.findPost(id)
    },

    async create(body: PostInputModel): Promise<string> {
        const requiredBlog = await blogsRepository.findBlog(body.blogId)

        const newPost: RawPost = {
            blogName: requiredBlog.name,
            createdAt: new Date().toISOString(),
            ...body
        }

        return await postsRepository.createPost(newPost)
    },

    async update(id: string, dto: PostInputModel): Promise<void> {
        await postsRepository.updatePost(id, dto)
        return
    },

    async delete(id: string): Promise<void> {
        await postsRepository.deletePost(id)
        return
    }
}