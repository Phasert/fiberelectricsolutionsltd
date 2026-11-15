# Homepage hero management

The homepage has three fixed hero slides. They are edited under **Admin → Site Content → Homepage**, not in Media & Projects.

## Editing workflow

1. Open **Site Content**, then select **Homepage**.
2. Choose Slide 1, Slide 2 or Slide 3.
3. Edit the headline and supporting description.
4. Keep the approved original image, or choose a Ready image from the shared Media Library.
5. Adjust the horizontal and vertical focus point using the live preview.
6. Select **Save to live site** to publish all Homepage changes together.

The editor does not expose per-slide CTA controls. Existing global homepage actions remain managed separately through Calls to Action.

## Approved defaults and persistence

Each slide record contains the client-approved original image path, alt text, headline, description and focus point. An optional Media Library ID overrides the original image. **Restore approved original image** clears only that override, so the original remains immediately available without another upload.

The three records are part of `siteContent/homepage-v1`. Saving Homepage content writes them to both the draft and published content snapshots through the authenticated Site Content route. Older Homepage documents that predate the field receive the approved defaults during schema parsing and will persist them on their next authorized save.

## Public behavior

- The homepage reads only the published Homepage content snapshot.
- A valid Ready Media Library replacement is used when configured; otherwise the approved local image is used.
- The first image is prioritized and later slides load progressively.
- Image and copy transition together, with accessible previous/next, dot and pause controls.
- Motion pauses for interaction and respects `prefers-reduced-motion`.

Legacy slideshow metadata on old media records is retained for reference safety but no longer drives the public homepage or appears as a CMS workflow. No production records are deleted by this change.
