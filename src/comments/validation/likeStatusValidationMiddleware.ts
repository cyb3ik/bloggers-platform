import { body } from "express-validator";
import { LikeStatus } from "../../likes/models/likes-types";

const allowedValues = Object.values(LikeStatus)

export const likeStatusValidation = 
    body('likeStatus')
    .isIn(allowedValues)
    .withMessage(`Invalid likeStatus field. Allowed values: ${allowedValues.join(', ')}`)

