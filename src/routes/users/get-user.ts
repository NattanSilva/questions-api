import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prismaClient'
import {
  responseNotFoundSchema,
  responseOkUserSchema,
} from '../../schemas/response-status'

export const getUserRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/users/:id',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get a user by id',
        description: 'Get a user by id',
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: responseOkUserSchema,
          404: responseNotFoundSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const currentUser = await prisma.user.findUniqueOrThrow({
        where: {
          id,
        },
      })

      return reply.status(200).send(currentUser)
    }
  )
}
