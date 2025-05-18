import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prismaClient'

export const updateUserRoute: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    '/users/:id',
    {
      schema: {
        tags: ['Users'],
        summary: 'Update a user',
        description: 'Update a user',
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
          name: z.string().min(3).optional(),
          email: z.string().email().optional(),
          password: z.string().min(8).optional(),
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

      const { name, email, password } = request.body

      const updatedUser = await prisma.user.update({
        where: {
          id,
        },
        data: {
          name,
          email,
          password,
        },
      })

      return reply.status(200).send(updatedUser)
    }
  )
}
