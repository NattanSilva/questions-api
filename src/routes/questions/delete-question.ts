import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prismaClient'
import { AuthValidationMiddelware } from '../../middlewares/AuthValidation'
import {
  responseBadRequestSchema,
  responseInternalServerErrorSchema,
  responseNoContentSchema,
  responseNotFoundSchema,
} from '../../schemas/response-status'

export const deleteQuestionRoute: FastifyPluginAsyncZod = async (app) => {
  app
    .addHook(
      'onRequest',
      app.auth([AuthValidationMiddelware], { run: 'all', relation: 'and' })
    )
    .delete(
      '/questions/:id',
      {
        schema: {
          tags: ['Questions'],
          summary: 'Get one question',
          description: 'Get one question',
          security: [{ cookie: ['@token'] }],
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            204: responseNoContentSchema,
            400: responseBadRequestSchema,
            404: responseNotFoundSchema,
            500: responseInternalServerErrorSchema,
          },
        },
      },
      async (request, reply) => {
        const { id } = request.params

        await prisma.question.findUniqueOrThrow({
          where: {
            id,
          },
        })

        await prisma.question.delete({
          where: {
            id,
          },
        })

        return reply.status(204)
      }
    )
}
