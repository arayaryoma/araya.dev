export async function handleRequest(request: Request): Promise<Response> {
  const response = await fetch(request)
  const newResponse = new Response(response.body, response)
  newResponse.headers.set('x-araya-debug', 'true')
  return newResponse
}
