import type { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../lib/prismaClient'

export const AuthValidationMiddelware = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const cookie = request.cookies['@token']

  if (!cookie) {
    return reply
      .status(401)
      .send({ message: 'Unauthorized action.', details: 'Cookie not found.' })
  }

  const unsigned = request.unsignCookie(cookie)

  if (!unsigned.valid) {
    return reply.status(401).send({
      message: 'Unauthorized action.',
      details: 'cookie signature is invalid.',
    })
  }

  request.headers.authorization = `Bearer ${unsigned.value}`

  const decoded: { userId: string } = await request.jwtVerify()

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.userId,
    },
    select: {
      id: true,
    },
  })

  if (!user) {
    return reply
      .status(401)
      .send({ message: 'Unauthorized action.', details: 'User not found.' })
  }

  request.user = { id: user.id }
}
