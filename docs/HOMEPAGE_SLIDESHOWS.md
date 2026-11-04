# Homepage slideshow management

The homepage hero, Electrical card and Fiber Optic card use approved images from the existing Firebase-backed Media Library. No separate bucket or browser-readable Firebase collection is used.

## Publishing workflow

1. Open **Admin → Media Library** and upload an approved JPG, PNG or WebP image.
2. Apply a crop. The private original is retained while responsive WebP derivatives are generated.
3. In **Homepage slideshows**, add a Ready image to Hero, Electrical services or Fiber optic services.
4. Add concise alt text and adjust the horizontal and vertical focal point using the live preview.
5. Use the arrow controls to set slide order.
6. Keep the slide as a draft during review, then select **Publish** when approved.

Each placement accepts up to four images. Removing a slide clears only its slideshow assignment; it does not delete its Media Library record or stored files. Assigned slideshow images are protected from Media Library deletion.

## Public behavior

- Only Ready media with a published slideshow assignment is returned to the homepage.
- The first hero image is prioritized for LCP; later slides load progressively shortly before display.
- Slides advance every six seconds and pause during hover, keyboard focus or manual pause.
- Previous, next, slide-selection and play/pause controls are keyboard accessible.
- Automatic transitions and Ken Burns motion stop when `prefers-reduced-motion` is enabled.
- Existing graphical SVG placeholders remain when a placement has no published photography.

The existing deny-by-default Firestore and Storage rules remain unchanged. Admin writes still pass through authenticated server routes, and public derivative delivery checks publication eligibility before serving a file.
