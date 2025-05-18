import bcrypt from 'bcrypt'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from '../../env'

export type Payload = {
  userId: string
}

export const getTokenRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/login/:userId',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Create a cookie with a token and redirect to the web app',
        description: 'Create a cookie with a token and redirect to the web app',
        params: z.object({
          userId: z.string(),
        }),
        querystring: z.object({
          key: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { userId } = request.params

      const { key } = request.query

      console.log('key', key)

      if (!key || !bcrypt.compareSync(env.SECRET_KEY, key)) {
        return reply.status(401).send({ message: 'Unauthorized action.' })
      }

      const payload: Payload = {
        userId,
      }

      const token = jwt.sign(payload, env.SECRET_KEY, {
        expiresIn: '7d',
      })

      const webRedirectUrl = new URL(env.WEB_URL)

      return reply
        .setCookie('@token', token, {
          path: '/',
          httpOnly: true,
          signed: true,
          maxAge: 1000 * 60 * 60 * 24 * 7,
          secure: true,
        })
        .redirect(webRedirectUrl.toString(), 302)
    }
  )
}
