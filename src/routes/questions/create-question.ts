import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { QuestionType } from '../../generated/prisma'
import { prisma } from '../../lib/prismaClient'
import { AuthValidationMiddelware } from '../../middlewares/AuthValidation'
import {
  responseBadRequestSchema,
  responseConflictSchema,
  responseCreatedQuestionSchema,
  responseInternalServerErrorSchema,
  responseUnauthorizedSchema,
} from '../../schemas/response-status'

export const createQuestionRoute: FastifyPluginAsyncZod = async (app) => {
  app
    .addHook(
      'onRequest',
      app.auth([AuthValidationMiddelware], { run: 'all', relation: 'and' })
    )
    .post(
      '/questions',
      {
        schema: {
          tags: ['Questions'],
          summary: 'Create a new question',
          description: 'Create a new question',
          security: [{ cookie: ['@token'] }],
          body: z
            .object({
              title: z.string(),
              type: z
                .enum([
                  QuestionType.OPEN,
                  QuestionType.MULTIPLE,
                  QuestionType.TRUEORFALSE,
                ])
                .default(QuestionType.MULTIPLE),
              options: z.array(z.string()).default([]),
              response: z.string().optional(),
            })
            .refine(
              (data) =>
                data.type === 'MULTIPLE' || data.type === 'TRUEORFALSE'
                  ? data.options.length >= 2
                  : true,
              {
                message:
                  'The length of options greater than or equal to 2 when type is MULTIPLE or TRUEORFALSE',
                path: ['options'],
              }
            )
            .refine(
              (data) => {
                if (data.type === 'OPEN') return true

                if (data.response === undefined) return false

                if (data.response === null) return false

                if (data.response.length === 0) return false

                return data.options.includes(data.response)
              },
              {
                message: 'The response must be one of the options',
                path: ['response'],
              }
            ),
          response: {
            201: responseCreatedQuestionSchema,
            400: responseBadRequestSchema,
            401: responseUnauthorizedSchema,
            409: responseConflictSchema,
            500: responseInternalServerErrorSchema,
          },
        },
      },
      async (request, reply) => {
        const { title, type, options, response } = request.body

        const createdQuestion = await prisma.question.create({
          data: {
            title,
            type,
            options,
            response,
            author_id: request.user.id,
          },
          select: {
            id: true,
            title: true,
            type: true,
            author_id: true,
            options: true,
            response: true,
            created_at: true,
            updated_at: true,
          },
        })

        return reply.status(201).send(createdQuestion)
      }
    )
}
