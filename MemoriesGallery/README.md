# Memories Gallery

A mobile travel gallery made with HTML, CSS, and JavaScript. No build step or package installation is needed.

## Run

Open this folder in Visual Studio Code. Use Live Server to open index.html, or open index.html directly for desktop preview. Use the mouse or arrow keys in desktop mode.

On a phone, open the published HTTPS website and select Enable motion. Hold the phone comfortably during calibration. HTTP addresses on a local network generally cannot access motion sensors.

## Controls

- Tilt the phone to move the light.
- Stay on Enter Gallery for 2 seconds to enter the world.
- Stay on Asia for 2 seconds to enter China.
- Stay on a glowing point, or its labeled chip below the map, for 2 seconds to enter its album.
- Move over the photo wall to erase the dark cover. Revealed areas remain visible during this visit.
- Move near the left or right screen edge to pan through more photos.
- Stay at the top center for 2 seconds to return to China.

The four destinations are Jiangxi, Anhui, Shaanxi, and Guangdong. Returning to an album resets its cover. Portrait orientation works best. Returning from another app recalibrates the neutral phone position.

## Where to put your photos

Place your real travel pictures in the corresponding folder:

| Destination | Folder |
| --- | --- |
| Shangrao | photos/jiangxi/shangrao/ |
| Nanchang | photos/jiangxi/nanchang/ |
| Wuyuan | photos/jiangxi/wuyuan/ |
| Pingxiang | photos/jiangxi/pingxiang/ |
| Jingdezhen | photos/jiangxi/jingdezhen/ |
| Huangshan | photos/anhui/huangshan/ |
| Weinan | photos/shaanxi/weinan/ |
| Shangluo | photos/shaanxi/shangluo/ |
| Shenzhen | photos/guangdong/shenzhen/ |
| Guangzhou | photos/guangdong/guangzhou/ |

Then open photos.js and add the exact filenames to the matching files array.

Example: put 01.jpg and 02.jpg in photos/jiangxi/shangrao/ and edit the Shangrao entry:

```js
{ city: 'Shangrao', folder: 'jiangxi/shangrao', files: ['01.jpg', '02.jpg'] },
```

Repeat for the other locations. Photos appear in the order listed. Match capital letters and extensions exactly: 01.JPG and 01.jpg are different names on GitHub Pages. JPG, PNG, and WebP are suitable. Convert HEIC pictures to JPG first. Compress large originals to around 1600 pixels on the longest edge for a smoother mobile experience.

The browser cannot automatically list files in a static website folder, so both steps are necessary: copy the images, then list their filenames in photos.js. No real travel photos have been supplied yet. An empty province uses clearly labeled sample landscapes. Missing configured images show a sample with a Photo not found caption after that area is revealed.

The optional photo picker on the start screen adds pictures only for the current browsing session. It does not save pictures to the website or upload them. For permanent photos, use the folders and photos.js.

## Map

assets/china-provinces.png is the reference image supplied for this project. It is displayed in grayscale through CSS, with one light point for each of the four travel provinces. Light points follow approximate positions on this reference image. Province chips below the map provide larger selection areas on small screens. Province artwork and labels remain readable without contacting a map provider.

## Files

- index.html: English page and motion permission setup.
- style.css: layout, grayscale map, province glow, light cursor.
- sketch.js: motion input, dwell selection, scene navigation, reveal canvas.
- photos.js: the editable photo filename list.
- photos/: your permanent travel images.
- assets/: local map image.

## GitHub Pages

Commit and push this entire folder, including photos.js, assets, and any travel images. If the repository root is published with GitHub Pages, the URL for this subfolder ends in /MemoriesGallery/. Use the actual repository Pages address as the prefix. HTTPS is required for phone motion access. This update does not commit or push changes.

## Verification

JavaScript syntax, English source strings, asset references, photo-folder layout, and photo-library loading are checked locally. Full visual testing and sensor behavior still need verification on a phone using HTTPS.

## Photo quantity and mobile performance

There is no tested universal photo-count limit. File size, image dimensions, phone memory, and the width of the reveal canvas all matter. Start with around 30 resized photos and test on the intended phone before adding larger batches. The gallery defers offscreen image loading, but it is not designed as an unlimited archive. Keep original full-resolution photos outside this website and put web-sized copies here.
