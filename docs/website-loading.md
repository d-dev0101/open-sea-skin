# Website ocean loading

The product website uses a separate loading shell. Installed browser extensions,
the DSH plugin and static installer still use their existing skin shell and the
same unchanged ocean renderer.

## First paint and loading order

- `website/ocean-preview.jpg` is a 117 KiB capture of our actual renderer at sea
  56 / daylight 55. It is preloaded at high priority and remains behind the iframe.
- The website iframe preloads the local three.js module graph. Its boot script
  signals **the first rendered frame**, not just a successful module download.
- Only the outer iframe fades in (600 ms), avoiding two stacked fade-ins.
- Six recording placements initially use small JPEG captures. Full GIFs load
  only after the ocean settles and the corresponding placement is visible.
  The hidden hero theme does not download its recording. Images are decoded
  before replacement; a download failure preserves the still preview.
- Reduced-motion visitors keep the recording stills. JavaScript-disabled
  visitors retain the static ocean and install links.

The two former eager hero GIF requests totaled roughly 16 MB. They no longer
compete with the first ocean frame. The original four recordings remain in the
gallery; their original files and the GitHub README are unchanged.

## Failure behavior

At 8 seconds the status explains that rendering is still preparing. At 45
seconds, or on a module import failure, it offers a retry while preserving the
preview. A late first frame still replaces the preview, even after the timeout.
Messages are restricted to the current same-origin iframe and attempt. Pending
slider changes are sent when the frame becomes ready. No full-page blocking
overlay or simulated progress percentage is used.

## Verification

```bash
npm run check
OSS_HEADLESS=1 npm run test:website
```

Set `OSS_WEBSITE_SCREENSHOTS` to a local output directory to save loading,
ready, mobile-fallback and JavaScript-disabled screenshots. The loading suite
holds the renderer for 13 seconds, checks that no GIF is requested, then tests
late readiness, timeout recovery, retry, blocked recordings, message validation
and reduced-motion behavior. Existing website acceptance covers daylight,
transparency, both themes, language switching, gallery and mobile overflow.

A local cold-cache Chrome measurement with 150 ms latency and 750,000 bytes/s
download throughput on 2026-09-12 showed the preview resource finished at 545 ms
and first rendered frame at 2,380 ms, with zero GIF requests before the first
frame. These are one controlled run, not a promised production load time;
GitHub Pages routing, device GPU and browser caches change the result.
