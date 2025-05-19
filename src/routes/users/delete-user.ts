import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prismaClient'
import { AuthValidationMiddelware } from '../../middlewares/AuthValidation'
import { AwnerValidationMiddelware } from '../../middlewares/AwnerValidation'
import {
  responseBadRequestSchema,
  responseNoContentSchema,
  responseNotFoundSchema,
  responseUnauthorizedSchema,
} from '../../schemas/response-status'

export const deleteUserRoute: FastifyPluginAsyncZod = async (app) => {
  app
    .addHook(
      'onRequest',
      app.auth([AuthValidationMiddelware, AwnerValidationMiddelware], {
        run: 'all',
        relation: 'and',
      })
    )
    .delete(
      '/users/:id',
      {
        schema: {
          tags: ['Users'],
          summary: 'Delete a user',
          description: 'Delete a user',
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            400: responseBadRequestSchema,
            401: responseUnauthorizedSchema,
            404: responseNotFoundSchema,
            204: responseNoContentSchema,
          },
          security: [
            {
              cookie: ['@token'],
            },
          ],
        },
      },
      async (request, reply) => {
        const { id } = request.params

        await prisma.user.delete({
          where: {
            id,
          },
        })

        return reply.status(204)
      }
    )
}
