import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prismaClient'
import { responseOkUserSchema } from '../../schemas/response-status'

export const getAllUsersRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/users',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get all users',
        description: 'Get all users',
        response: {
          200: z.array(responseOkUserSchema),
        },
      },
    },
    async (_, reply) => {
      const users = await prisma.user.findMany()

      return reply.status(200).send(users)
    }
  )
}
