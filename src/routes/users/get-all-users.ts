import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prismaClient'

export const getAllUsersRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/users',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get all users',
        description: 'Get all users',
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string().email(),
              created_at: z.date(),
              updated_at: z.date(),
            })
          ),
        },
      },
    },
    async (_, reply) => {
      const users = await prisma.user.findMany()

      return reply.status(200).send(users)
    }
  )
}
