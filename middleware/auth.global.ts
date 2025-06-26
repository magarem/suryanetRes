// Create this file at: middleware/auth.global.ts
// The `.global` suffix makes it run on every route change automatically.

export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip middleware for server-side assets or API calls
    if (import.meta.server && (to.path.startsWith('/api/') || to.path.includes('.'))) {
        return;
    }

    console.log(`Checking access for ${to.path} from ${from.path}`);

    const { user } = useUserSession();
    console.log(`User session: ${user.value ? JSON.stringify(user.value) : 'not logged in'}`);


    // --- 1. Fetch Required Roles for the Destination Page ---
    // We use `useFetch` which works on both client and server.
    // It calls a dedicated API endpoint to get the required roles from the database.
    const { data: requiredRoles } = await useFetch('/api/page-roles', { 
        // Pass the path we are trying to visit to the API.
        params: { path: to.path.split('/')[1] || '' },
        // Use a key to prevent re-fetching the same permissions multiple times.
        key: `page-roles-${to.path.split('/')[1]}`
    });

    console.log(`Required roles for ${to.path.split('/')[1]}:`, requiredRoles.value);
    
    // --- 2. Check if Page is Public ---
    // If the API returns no roles, the page is not protected, so we allow access.
    if (!requiredRoles.value || requiredRoles.value.length === 0) {
        return;
    }

    // --- 3. Check User Session ---
    // `useUserSession` is a composable that safely accesses the user's session cookie.
    
    
    // If the page is protected but the user is not logged in, redirect them to the login page.
    if (!user.value) {
        return navigateTo('/login');
    }

    // --- 4. Validate User Roles ---
    // Get the user's roles from their session (which were added at login).
    const userRoles = user.value.roles || [];
    
    // Check if the user has at least one of the required roles.
    const hasAccess = requiredRoles.value.some(requiredRole => userRoles.includes(requiredRole));

    // If the user does not have access, redirect them to an "unauthorized" page.
    if (!hasAccess) {
        // `replace: true` is used to prevent the user from going "back" to the unauthorized page.
        return navigateTo('/unauthorized', { replace: true });
    }

    // --- 5. Grant Access ---
    // If all checks pass, do nothing and allow Nuxt to complete the navigation.
});
