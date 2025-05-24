import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prismaClient'
import {
  responseBadRequestSchema,
  responseInternalServerErrorSchema,
  responseNotFoundSchema,
  responseOkQuestionSchema,
} from '../../schemas/response-status'

export const getQuestionRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/questions/:id',
    {
      schema: {
        tags: ['Questions'],
        summary: 'Get one question',
        description: 'Get one question',
        params: z.object({
          id: z.string().uuid(),
        }),
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
      const question = await prisma.question.findUniqueOrThrow({
        where: {
          id,
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

      return reply.status(200).send(question)
    }
  )
}
