export async function onRequest(context, next) {
  console.log(context.request.headers)
	context.locals.host = await context.request.headers?.get('host')
	context.locals.referer = await context.request.headers?.get('referer')

	return next()
}
