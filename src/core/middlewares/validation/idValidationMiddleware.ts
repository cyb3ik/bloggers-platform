import { param } from 'express-validator'
 
export const idValidation = param('id')
  .exists().withMessage('ID is required')

  .isString().withMessage('ID must be a string')
  
  .isMongoId().withMessage('Invalid format of ID')