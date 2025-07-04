export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()
console.log(`Checking authentication status: ${loggedIn.value}`);

  // redirect the user to the login screen if they're not authenticated
  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
