import { query } from "express-validator";
import { paginatedInput, SortDirection } from "../../pagination/paginationTypes";

const DEFAULT_PAGE_NUMBER = 1
const DEFAULT_PAGE_SIZE = 10
const DEFAULT_SORT_BY = 'createdAt'
const DEFAULT_SORT_DIRECTION = SortDirection.desc

export const defaultPaginationParameters: paginatedInput<string> = {
    pageNumber: DEFAULT_PAGE_NUMBER,
    pageSize: DEFAULT_PAGE_SIZE,
    sortBy: DEFAULT_SORT_BY,
    sortDirection: DEFAULT_SORT_DIRECTION
}

export function paginationAndSortingValidation<T extends string>(
  sortFields: Record<string, T>,
) {
  const allowedSortFields = Object.values(sortFields);

  return [
    query('pageNumber')
      .default(DEFAULT_PAGE_NUMBER)
      .isInt({ min: 1 })
      .withMessage('Page number must be a positive integer')
      .toInt(),

    query('pageSize')
      .default(DEFAULT_PAGE_SIZE)
      .isInt({ min: 1, max: 100 })
      .withMessage('Page size must be between 1 and 100')
      .toInt(),

    query('sortBy')
      .default('createdAt')
      .isIn(allowedSortFields)
      .withMessage(
        `Invalid sort field. Allowed values: ${allowedSortFields.join(', ')}`,
      ),

    query('sortDirection')
      .default(DEFAULT_SORT_DIRECTION)
      .isIn(Object.values(SortDirection))
      .withMessage(
        `Sort direction must be one of: ${Object.values(SortDirection).join(', ')}`,
      ),
    query('searchNameTerm')
      .optional()
      .isString()
      .withMessage('Search name term must be a string'),
    query('searchLoginTerm')
      .optional()
      .isString()
      .withMessage('Search login term must be a string'),
    query('searchEmailTerm')
      .optional()
      .isString()
      .withMessage('Search email term must be a string')
  ];
}