import { body } from "express-validator";

const titleValidation = 
    body('title')
    .isString().withMessage('Title must be a string')
    .trim()
    .notEmpty().withMessage('Title should not be empty')
    .isLength({max: 30}).withMessage('Title length must not be greater than 30')

const descValidation = 
    body('shortDescription')
    .isString().withMessage('Description must be a string')
    .trim()
    .notEmpty().withMessage('Description should not be empty')
    .isLength({max: 100}).withMessage('Description length must not be greater than 100')

const contentValidation = 
    body('content')
    .isString().withMessage('Content must be a string')
    .trim()
    .notEmpty().withMessage('Content should not be empty string')
    .isLength({max: 1000}).withMessage('Content length must not be greater than 1000')

const blogIdValidation = 
    body('blogId')
    .optional()
    .isString().withMessage('ID must be a string')
    .trim()
    .isMongoId().withMessage('Invalid format of ID')
    

export const postDtoValidationMiddleware = [
    titleValidation,
    descValidation,
    contentValidation,
    blogIdValidation
]