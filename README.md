# Nida al-Quran

This project is ready for deployment on Vercel as a Vite frontend plus serverless API.

## Deployment steps

1. Push this repository to GitHub.
2. Import the project in Vercel.
3. Set the build command to `npm run build`.
4. Set the output directory to `dist`.
5. Add the environment variables from [.env.example](.env.example).

## Vercel notes

- The frontend is served from the Vite build output.
- API routes are handled by the serverless function in [api/index.js](api/index.js).
- For production, set `VITE_API_URL=/api` so the frontend calls the same-origin Vercel API routes.

## Local development

- Frontend: `npm run dev`
- Build: `npm run build`
