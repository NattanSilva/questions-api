import bcrypt from 'bcrypt'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { randomInt } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '../../lib/prismaClient'
import {
  responseBadRequestSchema,
  responseConflictSchema,
  responseCreateUserSchema,
  responseInternalServerErrorSchema,
} from '../../schemas/response-status'

export const createUserRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/users',
    {
      schema: {
        tags: ['Users'],
        summary: 'Create a new user',
        description: 'Create a new user',
        body: z.object({
          name: z.string().min(3),
          email: z.string().email(),
          password: z.string().min(8),
        }),
        response: {
          201: responseCreateUserSchema,
          400: responseBadRequestSchema,
          409: responseConflictSchema,
          500: responseInternalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, name, password } = request.body

      const randomSalt = randomInt(10, 16)

      const hashedPassword = bcrypt.hashSync(password, randomSalt)

      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      })

      return reply.status(201).send(user)
    }
  )
}
