import type { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { prisma } from '../lib/prismaClient'

const parmsSchema = z.object({
  id: z.string().uuid(),
})

export const QuestionAuthorValidationMiddelware = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const { id: userId } = request.user

  const { id: questionId } = parmsSchema.parse(request.params)

  const { author_id } = await prisma.question.findUniqueOrThrow({
    where: {
      id: questionId,
    },
    select: {
      author_id: true,
    },
  })

  if (author_id !== userId) {
    return reply.status(401).send({
      message: 'Unauthorized action.',
      details: 'You are not the owner of this question.',
    })
  }
}
