export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  console.log('New request: ' + getRequestURL(event))
  console.log('Nuser: ', JSON.stringify(user))
  // if (!user) {
  //   await sendRedirect(event, '/login', 302)
  // }
})