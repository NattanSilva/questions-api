import z from 'zod'

// 200
const responseOkUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  created_at: z.date(),
  updated_at: z.date(),
})

const responseOkLoginSchema = z.object({
  loginRedirectUrl: z.string().url(),
})

// 201
const responseCreateUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  created_at: z.date(),
  updated_at: z.date(),
})

// 204
const responseNoContentSchema = z.null()

// 400
const responseBadRequestSchema = z.object({
  message: z.string(),
  details: z.string(),
})

// 401
const responseUnauthorizedSchema = z.object({
  message: z.string(),
  details: z.string(),
})

// 404
const responseNotFoundSchema = z.object({
  message: z.string(),
  details: z.array(
    z.object({
      keyword: z.string(),
      instancePath: z.string(),
      schemaPath: z.string(),
      params: z.object({
        issue: z.object({
          code: z.string(),
          expected: z.string(),
          received: z.string(),
          path: z.array(z.string()),
          message: z.string(),
        }),
      }),
      message: z.string(),
    })
  ),
})

// 409
const responseConflictSchema = z.object({
  message: z.string(),
  details: z.string(),
})

export {
  responseBadRequestSchema,
  responseConflictSchema,
  responseCreateUserSchema,
  responseNoContentSchema,
  responseNotFoundSchema,
  responseOkLoginSchema,
  responseOkUserSchema,
  responseUnauthorizedSchema,
}
