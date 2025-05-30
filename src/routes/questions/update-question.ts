import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { QuestionType } from '../../generated/prisma'
import { prisma } from '../../lib/prismaClient'
import { AuthValidationMiddelware } from '../../middlewares/AuthValidation'
import {
  responseBadRequestSchema,
  responseInternalServerErrorSchema,
  responseNotFoundSchema,
  responseOkQuestionSchema,
} from '../../schemas/response-status'

export const updateQuestionRoute: FastifyPluginAsyncZod = async (app) => {
  app
    .addHook(
      'onRequest',
      app.auth([AuthValidationMiddelware], { run: 'all', relation: 'and' })
    )
    .patch(
      '/questions/:id',
      {
        schema: {
          tags: ['Questions'],
          summary: 'Update a question',
          description: 'Update a question',
          security: [{ cookie: ['@token'] }],
          params: z.object({
            id: z.string().uuid(),
          }),
          body: z
            .object({
              title: z.string().optional(),
              type: z
                .enum([
                  QuestionType.OPEN,
                  QuestionType.MULTIPLE,
                  QuestionType.TRUEORFALSE,
                ])
                .default(QuestionType.MULTIPLE)
                .optional(),
              options: z.array(z.string()).optional(),
              response: z.string().optional(),
            })
            .refine(
              (data) => {
                if (data.options) {
                  return (
                    data.response !== undefined &&
                    data.response !== null &&
                    data.response !== '' &&
                    data.options.includes(data.response)
                  )
                }

                return true
              },
              {
                path: ['response'],
                message: 'response must be in options',
              }
            ),
          response: {
            200: responseOkQuestionSchema,
            400: responseBadRequestSchema,
            404: responseNotFoundSchema,
            500: responseInternalServerErrorSchema,
          },
        },
      },
      async (request, reply) => {
        const { id } = request.params
        const { title, type, options, response } = request.body

        const currentQuestion = await prisma.question.findUniqueOrThrow({
          where: {
            id,
          },
        })

        if (type === 'MULTIPLE' || type === 'TRUEORFALSE') {
          if (currentQuestion.options.length < 2) {
            return reply.status(400).send({
              message: 'Invalid Input',
              details: ['options: You must have at least 2 options'],
            })
          }
        }

        const updatedQuestion = await prisma.question.update({
          where: {
            id,
          },
          data: {
            title,
            type,
            options: type === 'OPEN' ? [] : options,
            response: type === 'OPEN' ? null : response,
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

        return reply.status(200).send(updatedQuestion)
      }
    )
}
