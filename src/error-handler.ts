import { type FastifyInstance } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { ZodError } from 'zod'
import { Prisma } from './generated/prisma'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = async (
  error,
  request,
  reply
) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Invalid Input',
      details: error.validation,
    })
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Invalid Input',
      details: error,
    })
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return reply.status(409).send({
        message: 'this field are already in use.',
        ...error.meta,
      })
    }

    if (error.code === 'P2025') {
      return reply.status(404).send({
        message: `${error.meta?.modelName} not found.`,
        ...error.meta,
      })
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return reply
      .status(500)
      .send({ message: 'Prisma Internal Error', details: error })
  }

  return reply
    .status(error.statusCode ?? 500)
    .send({ message: error.message ?? 'Internal Server Error', details: error })
}
