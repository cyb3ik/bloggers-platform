import { paginatedInput } from "../../core/pagination/paginationTypes"
import { LikeStatus, LikeViewModel, RawLike } from "../../likes/models/likes-types"

export type PostOutputModel = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
    extendedLikesInfo: {
        likesCount: number
        dislikesCount: number
        myStatus: LikeStatus
        newestLikes: LikeViewModel[]
    }
}

export type PostInputModel = {
    title: string
    shortDescription: string
    content: string
    blogId: string
}

export type RawPost = {
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
    extendedLikesInfo: {
        likesCount: number
        dislikesCount: number
    }
}

export enum PostSortAttributes {
    id = 'id',
    title = 'title',
    shortDescription = 'shortDescription',
    content ='content',
    blogId = 'blogId',
    blogName = 'blogName',
    createdAt = 'createdAt'
}

export type PaginationPostQuery = paginatedInput<PostSortAttributes>