import { defaultPaginationParameters } from "../middlewares/validation/queryPaginationValidationMiddleware";
import { paginatedInput } from "./paginationTypes";

export const paginationSetDefaults = <S>(query: Partial<paginatedInput<S>>): paginatedInput<S> => {
    return {
        ...defaultPaginationParameters,
        ...query,
        sortBy: (query.sortBy ?? defaultPaginationParameters.sortBy) as S
    }
}