---
applyTo: "**"
---

For Next.js projects, please refer to the [Next.js documentation](https://nextjs.org/docs) for detailed instructions on setup, configuration, and deployment.

User File with file-conventions: https://nextjs.org/docs/app/api-reference/file-conventions -

- `error.tsx`: A file named `error.tsx` is used to create a custom error page that will be displayed when an error occurs in the application. This file should export a React component that represents the error page.
- `layout.tsx`: A file named `layout.tsx` is used to define the layout of the application. This file should export a React component that wraps around the pages of the application and provides a consistent layout.
- `loading.tsx`: A file named `loading.tsx` is used to create a custom loading indicator that will be displayed while the application is loading. This file should export a React component that represents the loading indicator.
- `not-found.tsx`: A file named `not-found.tsx` is used to create a custom 404 page that will be displayed when a user navigates to a non-existent route. This file should export a React component that represents the 404 page.
- `page.tsx`: A file named `page.tsx` is used to define a page in the application. This file should export a React component that represents the content of the page.
- `template.tsx`: A file named `template.tsx` is used to define a template for the application. This file should export a React component that provides a consistent structure for the pages of the application.
- `route.ts`: A file named `route.ts` is used to define API routes in the application. This file should export functions that handle HTTP requests and responses for the specified route.
- `forbidden.tsx`: A file named `forbidden.tsx` is used to create a custom 403 page that will be displayed when a user tries to access a forbidden resource. This file should export a React component that represents the 403 page.

_Note_: The above files are part of the Next.js framework and are used to create a structured and organized application. Each file serves a specific purpose and helps to improve the overall user experience of the application. And these file consider the parent directory as a route segment and can be nested within other directories to create a hierarchical structure for the application and manage complex routing scenarios.
