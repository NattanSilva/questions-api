import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prismaClient'
import { AccountOwnerValidationMiddelware } from '../../middlewares/AccountOwnerValidation'
import { AuthValidationMiddelware } from '../../middlewares/AuthValidation'
import {
  responseBadRequestSchema,
  responseConflictSchema,
  responseInternalServerErrorSchema,
  responseNotFoundSchema,
  responseOkUserSchema,
  responseUnauthorizedSchema,
} from '../../schemas/response-status'

export const updateUserRoute: FastifyPluginAsyncZod = async (app) => {
  app
    .addHook(
      'onRequest',
      app.auth([AuthValidationMiddelware, AccountOwnerValidationMiddelware], {
        run: 'all',
      })
    )
    .patch(
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
            200: responseOkUserSchema,
            400: responseBadRequestSchema,
            401: responseUnauthorizedSchema,
            404: responseNotFoundSchema,
            409: responseConflictSchema,
            500: responseInternalServerErrorSchema,
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
