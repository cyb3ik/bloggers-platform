export type LikeInputModel = {
    likeStatus: LikeStatus
}

export type RawLike = {
    createdAt: string
    status: LikeStatus
    userId: string
    entityId: string
}

export type LikeViewModel = {
    likesCount: number
    dislikesCount: number
    myStatus: LikeStatus
}

export enum LikeStatus {
    None = 'None',
    Like = 'Like',
    Dislike = 'Dislike'
}