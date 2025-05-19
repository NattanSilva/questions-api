import bcrypt from 'bcrypt'
import { randomInt } from 'crypto'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { env } from '../../env'
import { prisma } from '../../lib/prismaClient'
import {
  responseConflictSchema,
  responseNotFoundSchema,
  responseOkLoginSchema,
} from '../../schemas/response-status'

export type Payload = {
  userId: string
}

export const createTokenLinkRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Create a login redirect link',
        description: 'Create a login redirect link',
        body: z.object({
          email: z.string().email(),
          password: z.string().min(8),
        }),
        response: {
          200: responseOkLoginSchema,
          401: responseConflictSchema,
          404: responseNotFoundSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const user = await prisma.user.findUniqueOrThrow({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
          password: true,
        },
      })

      if (!bcrypt.compareSync(password, user.password)) {
        return reply.status(401).send({
          message: 'Unauthorized action.',
          details: 'Invalid email or password.',
        })
      }

      const loginUrl = new URL(`http://localhost:3333/login/${user.id}`)

      loginUrl.searchParams.set(
        'key',
        bcrypt.hashSync(env.SECRET_KEY, randomInt(10, 18))
      )

      return reply.status(200).send({
        loginRedirectUrl: loginUrl.toString(),
      })
    }
  )
}
