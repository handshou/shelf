import pkg from '@tinacms/auth'

export async function onRequest(context, next) {
  const { isUserAuthorized } = pkg
  const api_key = process.env.TINA_PUBLIC_CLIENT_ID || ""
  context.locals.host = context.request.headers?.get('x-forwarded-host')
  context.locals.referer = context.request.headers?.get('referer')

  return next()
}
