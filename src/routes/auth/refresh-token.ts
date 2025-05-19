import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import jwt from 'jsonwebtoken'
import z from 'zod'
import { env } from '../../env'
import { prisma } from '../../lib/prismaClient'
import { responseUnauthorizedSchema } from '../../schemas/response-status'
import type { Payload } from './create-token-link'

export const refreshTokenRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Refresh token expires date and redirect to the web app',
        description: 'Refresh token expires date and redirect to the web app',
        response: {
          401: responseUnauthorizedSchema,
          302: z.null(),
        },
      },
    },
    async (request, reply) => {
      const cookie = request.cookies['@token']

      if (!cookie) {
        return reply
          .status(401)
          .send({ message: 'Invalid Token', details: 'Cookie not found' })
      }

      const cookieUnsigned = request.unsignCookie(cookie)

      if (!cookieUnsigned.value) {
        return reply.status(401).send({
          message: 'Invalid Token',
          details: 'Cookie signature is invalid',
        })
      }

      const payload = jwt.decode(cookieUnsigned.value) as Payload

      await prisma.user.findUniqueOrThrow({
        where: {
          id: payload.userId,
        },
      })

      const refreshedToken = jwt.sign(
        { userId: payload.userId },
        env.SECRET_KEY,
        {
          expiresIn: '10d',
        }
      )

      reply.clearCookie('@token')

      reply.setCookie('@token', refreshedToken, {
        path: '/',
        httpOnly: true,
        signed: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: true,
      })

      const webRedirectUrl = new URL(env.WEB_URL)

      return reply.redirect(webRedirectUrl.toString(), 302)
    }
  )
}
