---
name: Homepage Image Gallery
overview: Replace the current homepage video section with a polished, responsive image gallery that uses the files in `frontend/src/assets/home_gallery`. Keep the existing section context (title/background elements) while improving visual design and mobile behavior.
todos:
  - id: remove-video-logic
    content: Remove video markup/state/methods from howItLooks.vue
    status: completed
  - id: wire-gallery-assets
    content: Add imports/data model for images in src/assets/home_gallery
    status: completed
  - id: build-gallery-ui
    content: Implement responsive, styled gallery template and SCSS
    status: completed
  - id: validate-homepage
    content: Verify HomeView integration and section spacing
    status: completed
  - id: lint-check
    content: Run lints on edited files and fix new issues
    status: completed
isProject: false
---

# Replace Home Video With Gallery

## Scope

Swap the video block in the home "How it looks" section with an image gallery sourced from the existing files in `frontend/src/assets/home_gallery`.

Key files:

- [c:/xampp/htdocs/LiveAlbums/frontend/src/components/home/howItLooks.vue](c:/xampp/htdocs/LiveAlbums/frontend/src/components/home/howItLooks.vue)
- [c:/xampp/htdocs/LiveAlbums/frontend/src/views/HomeView.vue](c:/xampp/htdocs/LiveAlbums/frontend/src/views/HomeView.vue) (only if section wiring/order adjustments are needed)

Assets to use:

- `event_album.jpeg`
- `event_assets_manager.jpeg`
- `event_info.jpeg`
- `event_qr.jpeg`
- `profile.jpeg`
- `upload page.jpeg`

## Implementation Approach

1. Remove the video-specific logic/UI from `howItLooks.vue`:
  - Delete the `<video>` element, overlay/play button, and playback state handling.
  - Remove lazy-video state/methods (`IntersectionObserver`, `togglePlayback`, video event callbacks).
2. Add a gallery data source in the component:
  - Define a typed image list containing `src` (imported from `@/assets/home_gallery/...`) and optional display labels.
  - Keep this local to the component for easy future extension.
3. Build a refined gallery layout in the template:
  - Create a responsive masonry/grid style wrapper with 2 columns on mobile and 3 on desktop.
  - Add subtle card treatment: rounded corners, drop shadow, hover lift/scale, and soft gradient overlay for polish.
  - Preserve existing section title and decorative cubes/lines so design language remains consistent.
4. Update section styles for responsiveness and consistency:
  - Replace `.video-wrapper`, `.video-el`, `.video-overlay`, `.play-icon` styles with `.gallery-wrapper`, `.gallery-item`, and image styles.
  - Ensure `object-fit`, fixed aspect ratios, and mobile-safe spacing so the gallery never overflows.
5. Verify integration on the homepage:
  - Confirm `HomeView.vue` still renders `<HowItLooks />` correctly.
  - Check no regressions in spacing/stacking against adjacent sections (`Features`, `Clients`).
6. Run lint checks for edited files and resolve any new issues.

## Validation

- Homepage section displays all 6 images from `home_gallery`.
- No video controls/player remain.
- Layout is visually polished on desktop and mobile.
- No new lint errors in edited files.

