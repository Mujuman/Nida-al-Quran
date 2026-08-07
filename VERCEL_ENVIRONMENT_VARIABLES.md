# Vercel Environment Variables

Add these values in Vercel → Project Settings → Environment Variables.

## Frontend variables

These are used by the Vite app:

- `VITE_API_URL=https://api-nida.vercel.app`

## Backend variables

These are used by the API/serverless backend:

- `JWT_SECRET=muju4899mm`
- `PORT=5000`
- `NODE_ENV=production`
- `MONGO_URI=mongodb+srv://mujahid2muju_db_user:rPIRIat3oCTFNHkh@cluster0.kdczffj.mongodb.net/`
- `MONGODB_URL=mongodb+srv://mujahid2muju_db_user:rPIRIat3oCTFNHkh@cluster0.kdczffj.mongodb.net/`

## Admin bootstrap

- `MAIN_ADMIN_EMAIL=teyuteyba@gmail.com`
- `MAIN_ADMIN_USERNAME=Teyba`
- `MAIN_ADMIN_PASSWORD=teyu123@`
- `MAIN_ADMIN_FULLNAME=Teyba Kindnew`
- `MAIN_ADMIN_PHONE=0974155756`

## Email settings

- `EMAIL_USER=your_smtp_email`
- `EMAIL_PASS=your_smtp_password`
- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_PORT=587`
- `EMAIL_SECURE=false`
- `EMAIL_FROM=support@nidaalquran.com`

## Deployment notes

- Set these for Production and Preview.
- If you want local parity, also add them for Development.
- After saving the values, redeploy the project from Vercel.
