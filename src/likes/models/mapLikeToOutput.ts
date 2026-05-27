import { LikeViewModel, RawLike } from "../../likes/models/likes-types"

export const mapLikeToOutput = (dto: RawLike): LikeViewModel => {
    return {
        addedAt: dto.addedAt,
        userId: dto.userId,
        login: dto.login
    }
}