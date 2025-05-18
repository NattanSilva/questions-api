import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prismaClient'

export const deleteUserRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    '/users/:id',
    {
      schema: {
        tags: ['Users'],
        summary: 'Delete a user',
        description: 'Delete a user',
        params: z.object({
          id: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params

      await prisma.user.delete({
        where: {
          id,
        },
      })

      return reply.status(204).send({})
    }
  )
}
