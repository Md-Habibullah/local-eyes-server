# Checklist & Sample Requests

This file contains a concise checklist to reach full marks and copy-pasteable curl examples for core flows.

Checklist (to get 30/30)

1. Fix and confirm critical runtime/security issues
   - Use `config.express_session_secret` in `src/app.ts` instead of a hardcoded secret.
   - Add production cookie settings: `cookie: { secure: NODE_ENV==='production', sameSite: 'lax' }`.
   - Ensure CORS origins are configurable via `config.frontend_url`.
   - Confirm `.env` is not committed (rotate secrets if published).

2. Validation and routes
   - Re-enable or add request validation (`validateRequest`) for `bookings`, `listings` and `auth` where appropriate.
   - Ensure `BookingValidation` accepts common date formats (ISO and YYYY-MM-DD).

3. Testing & documentation
   - Provide integration tests (Jest + Supertest) for: register/login, create listing (guide), create booking (tourist), payment init.
   - Add Postman collection (provided) and README (this repo) showing steps to reproduce flows.

4. Deliverables
   - Start server locally and provide screenshots or a short demo recording of: register/login, guide creates listing, tourist books & pays (or payment init), guide verification via OTP.

Sample curl requests

Adjust `base` and `TOKEN` before running.

BASE=http://localhost:5000/api/v1
TOKEN=<replace-with-jwt>

# Register (tourist)
curl -X POST $BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{"user": {"email":"tourist@example.com","role":"TOURIST"},"password":"password123","name":"Test"}'

# Login
curl -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tourist@example.com","password":"password123"}'

# Create booking (tourist)
curl -X POST $BASE/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"tourId":"<tour-uuid>","date":"2025-12-31","numberOfPeople":2}'

# Init payment (tourist)
curl -X POST $BASE/payments/booking/<bookingId> \
  -H "Authorization: Bearer $TOKEN"

# Send guide OTP
curl -X POST $BASE/guides/verify/send-otp \
  -H "Authorization: Bearer $TOKEN"

Notes
- Replace `<tour-uuid>`, `<bookingId>`, and `$TOKEN` with actual values returned from API calls.
- If your app uses cookies rather than Authorization header, extract `accessToken` cookie instead.
