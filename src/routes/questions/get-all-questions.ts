import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prismaClient'
import {
  responseInternalServerErrorSchema,
  responseOkQuestionSchema,
} from '../../schemas/response-status'

export const getAllQuestionsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/questions',
    {
      schema: {
        tags: ['Questions'],
        summary: 'Get all questions',
        description: 'Get all questions',
        response: {
          200: z.array(responseOkQuestionSchema),
          500: responseInternalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const createdQuestion = await prisma.question.findMany({
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

      return reply.status(200).send(createdQuestion)
    }
  )
}
