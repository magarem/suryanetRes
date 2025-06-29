// composables/useTheme.js
export const useTheme = () => {
  // Use a cookie to remember the user's theme preference. Default to 'light'.
  const theme = useCookie('theme', { default: () => 'light' });

  // Function to toggle the theme
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  };

  // Watch for changes in the theme cookie and apply/remove the 'dark' class
  // This needs to run on the client-side.
  if (import.meta.client) {
    watch(theme, (newTheme) => {
      const htmlEl = document.documentElement;
      if (newTheme === 'dark') {
        htmlEl.classList.add('dark');
      } else {
        htmlEl.classList.remove('dark');
      }
    }, { immediate: true }); // `immediate: true` applies the theme on initial load
  }

  // Return the reactive theme and the toggle function
  return {
    theme,
    toggleTheme,
  };
};