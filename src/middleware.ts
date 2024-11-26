import pkg from '@tinacms/auth'

export async function onRequest(context, next) {
  const { isUserAuthorized } = pkg
  const api_key = process.env.TINA_PUBLIC_CLIENT_ID || ""
  context.locals.token = context.request.headers

  return next()
}
