export type LikeInputModel = {
    likeStatus: LikeStatus
}

export type RawLike = {
    addedAt: string
    status: LikeStatus
    userId: string
    login: string
    entityId: string
}

export type LikeViewModel = {
    addedAt: string
    userId: string
    login: string
}

export enum LikeStatus {
    None = 'None',
    Like = 'Like',
    Dislike = 'Dislike'
}