# CORS Error Fix Guide

## Error Description
```
Access to fetch at 'https://nida-al-quran-api.vercel.app/api/users/resend-otp' 
from origin 'https://nida-al-quran.vercel.app' 
has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
It does not have HTTP ok status.
```

## Root Causes & Solutions

### ✅ Issue 1: Backend Server is Down/Unreachable
**Symptoms:**
- `Failed to load resource: net::ERR_FAILED`
- Preflight OPTIONS request fails
- Connection refused

**Solutions:**
1. **Check if backend is running:**
   ```bash
   curl https://nida-al-quran-api.vercel.app/health
   ```
   Should return: `{"status":"OK",...}`

2. **Check Vercel deployment:**
   - Visit: https://vercel.com/dashboard
   - Check deployment logs
   - Restart deployment if needed

3. **Local development:**
   ```bash
   npm run dev
   # Should see: Server running on port 5000
   ```

### ✅ Issue 2: CORS Headers Missing in Response

**Before (Incorrect):**
```javascript
app.use(cors(corsOptions));
app.use(express.json());
// ❌ Missing explicit OPTIONS handling
```

**After (Fixed):**
```javascript
// FIRST: Apply CORS middleware before routes
app.use(cors(corsOptions));

// THEN: Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// THEN: Parse JSON
app.use(express.json());

// THEN: Add manual CORS headers as backup
app.use((req, res, next) => {
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

### ✅ Issue 3: Wrong Middleware Order

**Incorrect (❌):**
```javascript
app.use(express.json());        // ❌ BEFORE cors
app.use(cors(corsOptions));      // ❌ Wrong order
app.use('/api', routes);
```

**Correct (✅):**
```javascript
app.use(cors(corsOptions));      // ✅ FIRST
app.options('*', cors());        // ✅ Handle preflight
app.use(express.json());         // ✅ Parse JSON
app.use('/api', routes);
```

### ✅ Issue 4: Origin Not in Allowlist

**Check server.js:**
```javascript
const allowedOrigins = [
  'https://nida-al-quran.vercel.app',           // ✅ Client app
  'https://nida-al-quran-admin.vercel.app',     // ✅ Admin app
  'http://localhost:5173',                      // ✅ Local dev
  'http://localhost:5174',                      // ✅ Local dev
  'http://localhost:3000',                      // ✅ Local dev
];
```

**If your origin is missing:**
1. Add your domain to `allowedOrigins` array
2. Redeploy backend
3. Wait 1-2 minutes for Vercel to update

### ✅ Issue 5: Environment Variables Not Set

**For Vercel deployment:**
1. Go to: https://vercel.com → Project Settings → Environment Variables
2. Add environment variables:
   ```
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_password
   ```
3. Redeploy

---

## Troubleshooting Steps

### Step 1: Check Backend Health
```bash
curl -v https://nida-al-quran-api.vercel.app/health
```

**Expected response:**
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://nida-al-quran.vercel.app
Access-Control-Allow-Credentials: true
Content-Type: application/json

{"status":"OK","message":"Backend API is running",...}
```

**If it fails:**
- Backend is down
- Check Vercel logs
- Restart deployment

### Step 2: Test Preflight Request
```bash
curl -X OPTIONS -v https://nida-al-quran-api.vercel.app/api/users/resend-otp \
  -H "Origin: https://nida-al-quran.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```

**Expected response:**
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://nida-al-quran.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, ...
```

**If it fails:**
- CORS not configured correctly
- Check server.js middleware order
- Redeploy

### Step 3: Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for log: `🌐 API URL configured as: https://nida-al-quran-api.vercel.app`
4. Click the resend button
5. Watch for logs:
   - `📧 Sending resend OTP request for: [email]`
   - `✅ Resend OTP successful` (success)
   - `❌ Resend OTP error:` (failure)

### Step 4: Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Click resend button
4. Look for `resend-otp` request
5. Check response status:
   - **200**: Success ✅
   - **400-499**: Client error (check request body)
   - **500-599**: Server error (check backend logs)
   - **CORS error**: CORS headers missing

---

## Server.js CORS Configuration

**Current Configuration (Fixed):**

```javascript
// 1. Define allowed origins
const allowedOrigins = [
  'https://nida-al-quran.vercel.app',
  'https://nida-al-quran-admin.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

// 2. Configure CORS options
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Origin',
    'X-Requested-With',
    'Accept',
  ],
  maxAge: 86400, // 24 hours
};

// 3. Apply CORS middleware FIRST (before routes)
app.use(cors(corsOptions));

// 4. Handle preflight requests
app.options('*', cors(corsOptions));

// 5. Parse JSON
app.use(express.json());

// 6. Manual CORS backup (shouldn't be needed)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, ...');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 7. Routes (AFTER middleware)
app.use('/api/users', userRoutes);
// ... other routes
```

---

## Client-Side Error Handling

**Improved apiService.js:**

```javascript
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

console.log(`🌐 API URL configured as: ${API_URL}`);

export const apiService = {
  resendOtp: async (email) => {
    try {
      console.log(`📧 Sending resend OTP request for: ${email}`);
      
      const response = await fetch(`${API_URL}/api/users/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || `HTTP ${response.status}`);
      }
      
      console.log('✅ Resend OTP successful');
      return response.json();
    } catch (error) {
      console.error('❌ Resend OTP error:', error.message);
      throw error;
    }
  },
  // ... other methods
};
```

---

## Environment Variables Checklist

### Production (Vercel)
- [ ] `MONGO_URI` set in Vercel environment
- [ ] `JWT_SECRET` set in Vercel environment
- [ ] `EMAIL_USER` set in Vercel environment
- [ ] `EMAIL_PASS` set in Vercel environment
- [ ] Backend deployed successfully
- [ ] Domain added to `allowedOrigins` in server.js
- [ ] Backend redeployed after changes

### Development (Local)
- [ ] `.env` file created with all variables
- [ ] `npm install` run in server directory
- [ ] `npm run dev` running on port 5000
- [ ] Client configured to use `http://localhost:5000`
- [ ] CORS working for localhost

---

## Quick Fix Checklist

- [ ] **Backend running?**
  ```bash
  curl https://nida-al-quran-api.vercel.app/health
  ```

- [ ] **CORS middleware in correct order?**
  Check: `cors → options → json → routes`

- [ ] **Origin in allowlist?**
  Check: `allowedOrigins` array in server.js

- [ ] **OPTIONS method handled?**
  Check: `app.options('*', cors())`

- [ ] **Environment variables set?**
  Check Vercel settings or `.env` file

- [ ] **Preflight request working?**
  ```bash
  curl -X OPTIONS -v [API_URL]/api/users/resend-otp
  ```

- [ ] **Network status code?**
  Check browser Network tab

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `CORS policy blocked` | Origin not in allowlist | Add to `allowedOrigins` |
| `ERR_FAILED` | Backend down | Restart backend/Vercel |
| `Preflight failed` | OPTIONS not handled | Check middleware order |
| `HTTP 500` | Backend error | Check server logs |
| `HTTP 404` | Route not found | Check route definition |
| `HTTP 403` | Access denied | Check auth token |

---

## Testing

### Test 1: Direct API Call
```bash
curl -X POST https://nida-al-quran-api.vercel.app/api/users/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test 2: Preflight Request
```bash
curl -X OPTIONS https://nida-al-quran-api.vercel.app/api/users/resend-otp \
  -H "Origin: https://nida-al-quran.vercel.app" \
  -H "Access-Control-Request-Method: POST"
```

### Test 3: Browser Console
```javascript
// In browser console
fetch('https://nida-al-quran-api.vercel.app/api/users/resend-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com' })
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e))
```

---

## Support Resources

For more information:
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Middleware](https://github.com/expressjs/cors)
- [Vercel Deployment Docs](https://vercel.com/docs)

---

## Files Modified

✅ `server/server.js` - Enhanced CORS configuration
✅ `client/src/services/apiService.js` - Added error logging

---

**All CORS issues should be resolved! 🎉**
