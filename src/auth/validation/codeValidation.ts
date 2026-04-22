import { body } from "express-validator";

export const codeValidation = 
    body('code')
    .isString().withMessage('Code must be a string')
    .trim()
    .notEmpty().withMessage('Code field must not be empty')
    .isUUID().withMessage('Code must have a UUID format')