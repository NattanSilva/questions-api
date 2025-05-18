import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prismaClient'

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
          200: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string().email(),
            created_at: z.date(),
            updated_at: z.date(),
          }),
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
