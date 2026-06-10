---
name: Upload Performance
overview: Improve image/video upload performance by first fixing frontend batching/progress/cancel behavior and backend synchronous bottlenecks, then moving toward direct-to-storage uploads and async media processing for the largest gains.
todos:
  - id: fix-fe-batch
    content: Fix frontend batch mapping, progress, cancel, and disabled-state handling.
    status: completed
  - id: share-validation
    content: Unify upload validation between guest and owner upload flows.
    status: completed
  - id: optimize-editor-export
    content: Change edited image export to lower-memory blob export with size and format controls.
    status: completed
  - id: backend-queue-hotpath
    content: Verify and improve Laravel async moderation, storage failure handling, and upload authorization queries.
    status: cancelled
  - id: direct-storage-design
    content: Design and implement presigned direct-to-S3 uploads plus async media derivatives.
    status: cancelled
isProject: false
---

# Upload Performance Plan

## Current Bottlenecks

- Frontend uploads are single-file requests through `[frontend/src/store/modules/EventModule.ts](frontend/src/store/modules/EventModule.ts)`, using `POST events/{id}/upload` or `POST events/{id}/auth/upload` with a single `file` field.
- Owner batch uploads in `[frontend/src/components/library/inputs/UploadMedia.vue](frontend/src/components/library/inputs/UploadMedia.vue)` run sequentially, have no real per-file byte progress, and cancel only clears UI state while the request continues.
- Guest uploads in `[frontend/src/views/EventUploadsView.vue](frontend/src/views/EventUploadsView.vue)` lack the same client-side size validation used by owner uploads.
- Edited images in `[frontend/src/components/event/MediaEditorModal.vue](frontend/src/components/event/MediaEditorModal.vue)` are exported as full-resolution PNG via `toDataURL`, which can greatly inflate upload size and memory use.
- Laravel upload handling is in the sibling backend project `[../SnapShare/app/Services/Events/EventService.php](../SnapShare/app/Services/Events/EventService.php)`. It receives multipart uploads through PHP, stores the file synchronously, creates the DB asset row, and may run moderation inline if the queue is configured as `sync`.

## Phase 1: Quick Performance And Correctness Fixes

- Fix batch upload correctness in `[frontend/src/components/library/inputs/UploadMedia.vue](frontend/src/components/library/inputs/UploadMedia.vue)` by storing the validated `File` object with each upload item instead of indexing back into the original `FileList`.
- Add shared frontend upload validation for max size, MIME family, and video-enabled checks, then use it from both `[frontend/src/views/EventUploadsView.vue](frontend/src/views/EventUploadsView.vue)` and `[frontend/src/components/library/inputs/UploadMedia.vue](frontend/src/components/library/inputs/UploadMedia.vue)`.
- Add real byte progress for owner batch uploads by passing `onUploadProgress` into `event/uploadFile` per file and rendering each row from loaded/total bytes.
- Add abort support in `[frontend/src/store/modules/EventModule.ts](frontend/src/store/modules/EventModule.ts)` using `AbortController` or axios signal support, and wire `cancelUpload()` to abort the active upload and stop the remaining queue.
- Enforce disabled upload state in `UploadMedia.vue` handlers so inactive events cannot still trigger upload work.

## Phase 2: Reduce Frontend Payload Size

- Change edited image export in `[frontend/src/components/event/MediaEditorModal.vue](frontend/src/components/event/MediaEditorModal.vue)` away from always-full PNG. Prefer JPEG/WebP for photos with a quality setting, while preserving PNG only when needed for transparency.
- Cap edited image export dimensions to a reasonable maximum, such as 2048 or 2560 px on the long edge, unless the product explicitly requires full camera resolution.
- Avoid `toDataURL` where possible and use `canvas.toBlob` to reduce memory pressure during image export.
- Keep original video files unchanged on the client for now; browser-side video compression is usually slow, battery-heavy, and inconsistent.

## Phase 3: Backend Hot Path Improvements

- Confirm production Laravel uses an async queue driver, not `QUEUE_CONNECTION=sync`, and that a worker is running for moderation jobs from `[../SnapShare/app/Jobs/ModerateEventAssetJob.php](../SnapShare/app/Jobs/ModerateEventAssetJob.php)`.
- In `[../SnapShare/app/Services/Events/EventService.php](../SnapShare/app/Services/Events/EventService.php)`, ensure upload moderation dispatch happens after the asset DB row commits, and fail fast if storage fails instead of saving an empty path.
- Eager-load event config/order/subscription data used by upload authorization to reduce repeated queries.
- Consider caching or denormalizing per-event asset counts if quota checks become expensive under burst uploads.

## Phase 4: Larger Architecture Win

- Add a direct-to-S3 upload flow in Laravel: API returns a presigned upload target after validation, browser uploads bytes directly to S3, then API finalizes the `event_assets` row.
- Keep the current multipart endpoint as a compatibility path until the new flow is stable.
- Add async derivative generation after upload: image thumbnails/WebP variants and video poster frames, so gallery views do not load full originals.
- Update the frontend upload service to support both current multipart uploads and the new direct-to-storage flow behind one interface.

## Validation

- Test guest image upload, guest video upload, owner multi-file upload with valid and invalid files, cancel during upload, and video-disabled events.
- Verify Laravel queue behavior by timing image upload responses with moderation enabled.
- Compare before/after payload size for edited photos and before/after wall-clock time for multi-file owner uploads.