import { WithId } from "mongodb"
import { paginatedInput } from "../../core/pagination/paginationTypes"
import { LikeStatus, RawLike } from "../../likes/models/likes-types"

export type CommentOutputModel = {
    id: string
    content: string
    commentatorInfo: {
        userId: string
        userLogin: string
    }
    createdAt: string
    likesInfo: {
        likesCount: number
        dislikesCount: number
        myStatus: LikeStatus
    }
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
    likesInfo: {
        likesCount: number
        dislikesCount: number
    }
}

export enum CommentSortAttributes {
    id = 'id',
    content = 'content',
    createdAt = 'createdAt'
}

export type PaginationCommentQuery = paginatedInput<CommentSortAttributes>