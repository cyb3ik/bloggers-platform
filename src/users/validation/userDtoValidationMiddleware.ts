import { body } from "express-validator";

const loginValidation = 
    body('login')
    .isString().withMessage('Login must be a string')
    .trim()
    .notEmpty().withMessage('Login should not be empty')
    .isLength({min: 3, max: 10}).withMessage('Login length must be between 3 an 10')
    .matches(/^[a-zA-Z0-9_-]*$/).withMessage('Login must contain only english letters, digits and this special signs: - or _')

const passwordValidation = 
    body('password')
    .isString().withMessage('Password must be a string')
    .trim()
    .notEmpty().withMessage('Password should not be empty')
    .isLength({min: 6, max: 20}).withMessage('Password length must be between 6 and 20')

const emailValidation = 
    body('email')
    .isString().withMessage('Email must be a string')
    .trim()
    .notEmpty().withMessage('Email should not be empty string')
    .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/).withMessage('Email must be a valid email address')

export const userDtoValidationMiddleware = [
    loginValidation,
    passwordValidation,
    emailValidation
]