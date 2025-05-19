import fastifyAuth from '@fastify/auth'
import cookie, { type FastifyCookieOptions } from '@fastify/cookie'
import { fastifyCors } from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from './env'
import { errorHandler } from './error-handler'
import { createTokenLinkRoute } from './routes/auth/create-token-link'
import { getTokenRoute } from './routes/auth/get-token'
import { refreshTokenRoute } from './routes/auth/refresh-token'
import { createUserRoute } from './routes/users/create-user'
import { deleteUserRoute } from './routes/users/delete-user'
import { getAllUsersRoute } from './routes/users/get-all-users'
import { getUserRoute } from './routes/users/get-user'
import { updateUserRoute } from './routes/users/update-user'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)
app.setErrorHandler(errorHandler)

app.register(cookie, {
  secret: env.SECRET_KEY,
  parseOptions: {
    httpOnly: true,
    signed: true,
  },
} as FastifyCookieOptions)

app.register(fastifyJwt, {
  secret: env.SECRET_KEY,
})

app.register(fastifyAuth, {
  defaultRelation: 'and',
})

app.register(fastifyCors, {
  origin: true,
  credentials: true,
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Questions API',
      version: '0.0.1',
      description: 'API for Questions',
    },
    components: {
      securitySchemes: {
        cookie: {
          type: 'apiKey',
          in: 'cookie',
          name: '@token',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    persistAuthorization: true,
  },
})

app.get('/', async () => {
  return { hello: 'world' }
})

app.register(createUserRoute)
app.register(getUserRoute)
app.register(getAllUsersRoute)
app.register(updateUserRoute)
app.register(deleteUserRoute)
app.register(createTokenLinkRoute)
app.register(getTokenRoute)
app.register(refreshTokenRoute)

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log(`HTTP server running on http://localhost:${env.PORT}`)
  })
  .catch((err) => {
    console.error(err)
  })
