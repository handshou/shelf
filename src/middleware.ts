import pkg from '@tinacms/auth'

export async function onRequest(context, next) {
  const { isUserAuthorized } = pkg
  const api_key = process.env.TINA_PUBLIC_CLIENT_ID || ""
  const token = process.env.TINA_CONTENT_TOKEN || ""
  const auth = await isUserAuthorized({ clientID: api_key, token: token })
  context.auth = auth
  console.log('auth', auth)

  return next()
}
