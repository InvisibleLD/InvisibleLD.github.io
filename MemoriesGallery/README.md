# Memories Gallery

A mobile travel gallery made with HTML, CSS, and JavaScript. No build step or package installation is needed.

## Run

Open this folder in Visual Studio Code. Use Live Server to open index.html, or open index.html directly for desktop preview. Mouse movement and arrow keys work automatically on a computer. There is no device-selection screen.

On a phone, open the published HTTPS website. Motion is detected from actual sensor readings. If your browser requires permission, tap Enter Gallery once to allow motion and enter the world. Hold the phone comfortably during calibration. HTTP addresses on a local network generally cannot access motion sensors.

## Controls

- Tilt the phone to move the light.
- Stay on Enter Gallery for 1 second to enter the world, or tap it once when motion permission is required.
- Stay on Asia for 1 second to enter China.
- Stay on a glowing point on the map, for 1 second to enter its album.
- Move over the photo wall to erase the dark cover. Revealed areas remain visible during this visit.
- Move near the left or right screen edge to pan through more photos.
- Stay at the top center for 1 second to return to China.

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

The visitor interface has no photo uploads. Configure permanent travel images through photos.js.

## Map

assets/china-provinces.png is the reference image supplied for this project. It is displayed in grayscale through CSS, with one light point for each of the four travel provinces. Light points follow approximate positions on this reference image. Jiangxi has a larger light point for easier selection. There are no destination buttons below the map. Province artwork and labels remain readable without contacting a map provider.

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

## Jiangxi city map

Selecting Jiangxi on the China map now opens a local city map with five lights: Nanchang, Shangrao, Wuyuan, Pingxiang, and Jingdezhen. Stay on a light for 1 second to open only that destination's photos. Wuyuan is a county within Shangrao, presented as a separate travel stop. Map markers use approximate positions on the supplied reference. The reference is displayed in grayscale, with English labels covering the original image labels. At the top of the Jiangxi map or any gallery, stay for 1 second to return directly to China. Other province galleries retain their existing behavior.
