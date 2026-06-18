# Security Specification

## Data Invariants
1. A user can only access their own user profile to write. (Admins to be determined if any).
2. A user can read another user's profile to see matching information.
3. A slot can only be created by an authenticated user who is a masjid. The `masjidId` must match `request.auth.uid`.
4. Only the masjid who created a slot can update or delete it.
5. Any authenticated user can read `slots`.
6. An application can only be created by the user applying (if `khateebId == request.auth.uid` and type is 'application') OR if `masjidId == request.auth.uid` and type is 'invitation'.
7. A user can only read their own applications or those requested to them.
8. Messages can only be read/written by their `senderId` or `receiverId`.

## The Dirty Dozen Payloads
- TBD

## The Test Runner
- TBD
