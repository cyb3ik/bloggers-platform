import { body } from "express-validator";

export const emailValidation = 
    body('email')
    .isString().withMessage('Email must be a string')
    .trim()
    .notEmpty().withMessage('Email should not be empty string')
    .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/).withMessage('Email must be a valid email address')