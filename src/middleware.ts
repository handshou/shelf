export async function onRequest(context, next) {
  context.locals.host = await context.request.headers?.get('x-forwarded-host')
  context.locals.referer = await context.request.headers?.get('referer')

  return next()
}
