

# Face Verification for Secrets

Add a face-recognition gate so a secret can only be opened by the person whose face the sender registered. This stacks on top of the existing location verification.

## What the user will get

**For the sender (CreateSecret page)**
- New "Face Verification" section with a toggle to enable it.
- When enabled: capture receiver's face via webcam OR upload a reference photo.
- Live preview, retake button, and a confirmation that a face was detected before saving.
- The face descriptor (a 128-number array, not the photo itself) is stored with the secret.

**For the receiver (ViewSecret page)**
- After location passes (or instead of it, if location is disabled), a Face Verification step appears.
- Webcam preview with overlay, "Verifying…" status, and clear success/error messaging.
- Up to **3 attempts**. After 3 failed attempts, face verification is locked.
- **OTP fallback**: a "Can't verify? Use email OTP" link sends a 6-digit code to the sender's registered email-on-file for the secret; entering it grants access.
- On success → existing decrypt + display flow runs.

## Technical approach

**Library**: `face-api.js` (TinyFaceDetector + FaceLandmark68Net + FaceRecognitionNet models, loaded from `/public/models/`).

**Flow**:
```text
Sender                          Receiver
------                          --------
capture face                    location verified ✓
   ↓                                ↓
detect + extract                activate webcam
128-d descriptor                    ↓
   ↓                            detect + extract
store as JSONB                  128-d descriptor
on secret row                       ↓
                                euclidean distance
                                vs stored descriptor
                                   ↓
                                < 0.5 → allow
                                ≥ 0.5 → deny (retry, max 3)
```

**Database changes** (migration):
- Add `face_descriptor jsonb` (nullable) to `secrets` — stores the 128-float array.
- Add `face_verification_enabled boolean default false` to `secrets`.
- Add `face_attempts integer default 0` to `secrets` — tracks failed attempts per secret.
- Add `otp_code text`, `otp_expires_at timestamptz` to `secrets` for fallback.

**Edge function changes**:
- Update `verify-location` → return `face_descriptor` and `face_verification_enabled` so the client can run comparison locally (descriptors are not sensitive PII like raw photos, and on-device comparison avoids sending biometric images to the server).
- New `verify-face` edge function: receives the receiver's computed descriptor + secretId, increments `face_attempts`, and on success returns the decrypted content (mirrors current `verify-location` response shape).
- New `send-face-otp` edge function: generates 6-digit code, stores hash + 10-min expiry, emails it to the secret owner via Resend (will require `RESEND_API_KEY` secret).
- New `verify-face-otp` edge function: validates the OTP and returns the decrypted content.

**Frontend changes**:
- New `src/components/FaceCapture.tsx` — reusable webcam + face-api.js wrapper (used by both sender and receiver).
- `src/pages/CreateSecret.tsx` — add face-enrollment section.
- `src/pages/ViewSecret.tsx` — add face-verification step after location, attempt counter, OTP fallback UI.
- Models placed in `public/models/` (downloaded from face-api.js weights repo at build-time via a small script, or committed directly).

**Security notes**:
- Only the 128-d descriptor is stored, never the photo. Descriptors cannot be reversed into a recognizable image.
- Comparison runs client-side; the server only validates the secret-id + descriptor match server-side using the stored descriptor (the `verify-face` function recomputes distance to prevent client tampering).
- 3-attempt lock is enforced server-side via the `face_attempts` column.
- OTP is hashed (sha256) before storage.

## Open questions before I build

1. **OTP destination**: should the OTP go to the **secret owner's email** (sender) so they read it out to the receiver, or should the sender enter a **receiver email** when creating the secret and OTP goes there?
2. **Email provider**: Resend is the simplest. OK to add `RESEND_API_KEY` as a new secret, or do you want to skip OTP fallback for v1?

If you don't answer, I will default to: OTP sent to the secret owner's email, using Resend.

