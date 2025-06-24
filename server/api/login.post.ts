import { z } from 'zod'

const bodySchema = z.object({
  email: z.string(),
  password: z.string()
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse)


  console.log('Login attempt with email:', email)
  console.log('password attempt with email:', password)
  
  ;
  
  if (email === 'a' && password === 'a') {
    // set the user session in the cookie
    // this server util is auto-imported by the auth-utils module
    await setUserSession(event, {
      user: {
        name: 'Fidelis'
      }
    })
    return {}
  }
  throw createError({
    statusCode: 401,
    message: 'Bad credentials'
  })
})
