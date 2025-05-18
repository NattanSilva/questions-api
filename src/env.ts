import z from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().min(1),
  SECRET_KEY: z.string().min(1),
  WEB_URL: z.string().min(1),
})

export const env = envSchema.parse(process.env)
