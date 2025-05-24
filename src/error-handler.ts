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
      details: error.validation.map(
        (err) =>
          `${err.instancePath.replaceAll('/', '')}: ${err.message}`
      ),
    })
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Invalid Input',
      details: [error.message],
    })
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return reply.status(409).send({
        message: `These fields are already in use.`,
        details: error.meta?.target,
      })
    }

    if (error.code === 'P2025') {
      console.log(error.meta)
      return reply.status(404).send({
        message: `${error.meta?.modelName} not found.`,
        details: error.meta?.cause?.toString,
      })
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return reply
      .status(500)
      .send({ message: 'Prisma Internal Error', details: error })
  }

  if (error.statusCode === 400) {
    return reply
      .status(error.statusCode ?? 400)
      .send({ message: 'Bad Request', details: [error.message] })
  }

  console.log(error)

  return reply
    .status(500)
    .send({ message: 'Internal Server Error', details: error })
}
