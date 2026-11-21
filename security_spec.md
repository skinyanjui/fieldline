# Fieldline Firestore Security Specification

## 1. Data Invariants
1. **PII Isolation**: Private account metadata (`email`) lives strictly in `/users/{userId}` and is readable/writable only by `request.auth.uid == userId`. Public profiles in `/profiles/{userId}` never store emails, phone numbers, or addresses.
2. **Verified Authorship**: All write operations require `request.auth != null && request.auth.token.email_verified == true`. Author/owner IDs (`uid`, `userId`, `authorId`, `hostId`) must match `request.auth.uid` on create and remain immutable on update.
3. **Referential Integrity**:
   - Creating a `/postLikes/{likeId}` requires the parent `/posts/{postId}` to exist and deterministic ID `likeId == request.auth.uid + '_' + postId`.
   - Creating a `/postComments/{commentId}` requires the parent `/posts/{postId}` to exist.
   - Creating a `/memberships/{membershipId}` requires deterministic ID `membershipId == request.auth.uid + '_' + orgId`.
   - Creating an `/rsvps/{rsvpId}` requires deterministic ID `rsvpId == request.auth.uid + '_' + outingId`.
4. **Temporal & Volumetric Integrity**: All `createdAt` and `updatedAt` fields must equal `request.time`; `createdAt` is immutable. Every string field is strictly length-bounded to match `firebase-blueprint.json`, and `disciplines` array is bounded to `<= 6` strings.
5. **Query Security**: Every `allow list` rule explicitly evaluates `resource.data.visibility == 'public'` without `get()`/`exists()` calls, and `/users` disallows `list` completely.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **PII Snooping (`GET /users/victimUid`)**: Signed-in non-owner tries to read another user's private `/users` doc -> `PERMISSION_DENIED`.
2. **PII Scraping (`LIST /users`)**: Authenticated user attempts collection scan of `/users` -> `PERMISSION_DENIED`.
3. **Shadow Field Injection (`CREATE /profiles/uid` with `isAdmin: true`)**: Extra ghost key rejected by `keys().hasOnly(...)` -> `PERMISSION_DENIED`.
4. **Author Spoofing (`CREATE /posts/post1` with `authorId: "otherUid"`)**: Mismatched `authorId != request.auth.uid` -> `PERMISSION_DENIED`.
5. **Timestamp Forgery (`CREATE /posts/post1` with client-supplied past `createdAt`)**: `createdAt != request.time` -> `PERMISSION_DENIED`.
6. **Unverified Email Write (`CREATE /organizations/org1` with `email_verified: false`)**: Rejected by `isVerifiedUser()` -> `PERMISSION_DENIED`.
7. **Orphaned Like (`CREATE /postLikes/uid_ghostPost`)**: Non-existent parent post rejected by `exists(...)` -> `PERMISSION_DENIED`.
8. **Orphaned Comment (`CREATE /postComments/c1` referencing missing `postId`)**: Rejected by `exists(...)` -> `PERMISSION_DENIED`.
9. **ID Poisoning (`CREATE /organizations/<200-char-invalid-id>`)**: Rejected by `isValidId(orgId)` -> `PERMISSION_DENIED`.
10. **Value Poisoning on Update (`UPDATE /posts/post1` setting `body` to 2000 chars or boolean)**: Rejected by `isValidFieldPost(incoming())` -> `PERMISSION_DENIED`.
11. **Immutable Field Tampering (`UPDATE /posts/post1` changing `authorId` or `createdAt`)**: Rejected by `affectedKeys().hasOnly(...)` and immutability checks -> `PERMISSION_DENIED`.
12. **Array Overflow (`CREATE /profiles/uid` with 12 items in `disciplines`)**: Rejected by `data.disciplines.size() <= 6` -> `PERMISSION_DENIED`.
