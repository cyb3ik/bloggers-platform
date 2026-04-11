import { body } from "express-validator";

const contentValidation = 
    body('content')
    .isString().withMessage('Content must be a string')
    .trim()
    .notEmpty().withMessage('Content should not be empty')
    .isLength({min: 20, max: 300}).withMessage('Content length must be between 20 an 300')

export const commentDtoValidationMiddleware = [
    contentValidation
]