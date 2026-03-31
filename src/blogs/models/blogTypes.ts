import { paginatedInput } from "../../core/pagination/paginationTypes"

export type BlogOutputModel = {
    id: string
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export type BlogInputModel = {
    name: string
    description: string
    websiteUrl: string
}

export type RawBlog = {
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export type BlogPostInputModel = {
    title: string
    shortDescription: string
    content: string
}

export enum BlogSortAttributes {
    id = 'id',
    name = 'name',
    description = 'description',
    websiteUrl ='websiteUrl',
    createdAt = 'createdAt',
    isMembership = 'isMembership'
}

export type PaginationBlogQuery = paginatedInput<BlogSortAttributes> & Partial<{searchNameTerm: string}>