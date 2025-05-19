import type { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

export const AwnerValidationMiddelware = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const { id } = request.user

  const parmsSchema = z.object({
    id: z.string().uuid(),
  })

  const { id: paramsUserId } = parmsSchema.parse(request.params)

  console.log(id, paramsUserId)

  if (paramsUserId !== id) {
    return reply.status(401).send({
      message: 'Unauthorized action.',
      details: 'You are not the owner.',
    })
  }
}
