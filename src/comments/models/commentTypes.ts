import { paginatedInput } from "../../core/pagination/paginationTypes"

export type CommentOutputModel = {
    id: string
    content: string
    commentatorInfo: {
        userId: string
        userLogin: string
    }
    createdAt: string
}

export type CommentInputModel = {
    content: string
}

export type CommentatorInfo = {
    userId: string
    userLogin: string
}

export type RawComment = {
    content: string
    commentatorInfo: {
        userId: string
        userLogin: string
    }
    createdAt: string
    postId: string
}

export enum CommentSortAttributes {
    id = 'id',
    content = 'content',
    createdAt = 'createdAt'
}

export type PaginationCommentQuery = paginatedInput<CommentSortAttributes>