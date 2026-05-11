import { body } from "express-validator";

export const newPasswordValidation = 
    body('newPassword')
    .isString().withMessage('Password must be a string')
    .trim()
    .notEmpty().withMessage('Password should not be empty')
    .isLength({min: 6, max: 20}).withMessage('Password length must be between 6 and 20')