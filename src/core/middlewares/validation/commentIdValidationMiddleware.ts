import { param } from 'express-validator'
 
export const commentIdValidation = 
    param('commentId')
      .exists().withMessage('ID is required')

      .isString().withMessage('ID must be a string')
    
      .isMongoId().withMessage('Invalid format of ID')