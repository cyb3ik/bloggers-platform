import { param } from 'express-validator'
 
export const postIdValidation = 
    param('postId')
      .exists().withMessage('Post ID is required')

      .isString().withMessage('Post ID must be a string')
    
      .isMongoId().withMessage('Invalid format of Post ID')