import z from 'zod'

// 200
const responseOkUserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    created_at: z.date(),
    updated_at: z.date(),
  })
  .describe('Successful')

const responseOkLoginSchema = z
  .object({
    loginRedirectUrl: z.string().url(),
  })
  .describe('Successful')

const responseOkQuestionSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    author_id: z.string().uuid(),
    options: z.array(z.string()),
    response: z.string().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
  })
  .describe('Successful')

// 201
const responseCreateUserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    created_at: z.date(),
    updated_at: z.date(),
  })
  .describe('Created')

const responseCreatedQuestionSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    author_id: z.string().uuid(),
    options: z.array(z.string()),
    response: z.string().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
  })
  .describe('Created')

// 204
const responseNoContentSchema = z.null().describe('Deleted')

// 400
const responseBadRequestSchema = z
  .object({
    message: z.string(),
    details: z.array(z.string()), 
  })
  .describe('Bad request')

// 401
const responseUnauthorizedSchema = z
  .object({
    message: z.string(),
    details: z.string(),
  })
  .describe('Unauthorized action')

// 404
const responseNotFoundSchema = z
  .object({
    message: z.string(),
    details: z.string(),
  })
  .describe('Not found')

// 409
const responseConflictSchema = z
  .object({
    message: z.string(),
    details: z.array(z.string()),
  })
  .describe('Conflict')

// 500
const responseInternalServerErrorSchema = z
  .object({
    message: z.string(),
    details: z.any(),
  })
  .describe('Internal server error')

export {
  responseBadRequestSchema,
  responseConflictSchema,
  responseCreatedQuestionSchema,
  responseCreateUserSchema,
  responseInternalServerErrorSchema,
  responseNoContentSchema,
  responseNotFoundSchema,
  responseOkLoginSchema,
  responseOkQuestionSchema,
  responseOkUserSchema,
  responseUnauthorizedSchema,
}
