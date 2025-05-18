import { fastifyCors } from '@fastify/cors'
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
import { createUserRoute } from './routes/users/create-user'
import { deleteUserRoute } from './routes/users/delete-user'
import { getAllUsersRoute } from './routes/users/get-all-users'
import { getUserRoute } from './routes/users/get-user'
import { updateUserRoute } from './routes/users/update-user'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)
app.setErrorHandler(errorHandler)

app.register(fastifyCors, {
  origin: true,
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Questions API',
      version: '0.0.1',
    },
  },
  transform: jsonSchemaTransform,
})
app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.get('/', async () => {
  return { hello: 'world' }
})

app.register(createUserRoute)
app.register(getUserRoute)
app.register(getAllUsersRoute)
app.register(updateUserRoute)
app.register(deleteUserRoute)

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
