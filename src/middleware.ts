import pkg from '@tinacms/auth'

export async function onRequest(context, next) {
  const { isUserAuthorized } = pkg
  const api_key = process.env.TINA_PUBLIC_CLIENT_ID || ""
  console.log(context.request.headers)
  // const auth = await isUserAuthorized({ clientID: api_key, token: token })

  return next()
}
