# AtelierProject2_Iteration2_Ganlin_Du

An adaptive habitat prototype based on komo2075/Atelier3_Project2.

## Local development in Visual Studio Code

Install Node.js if needed. Open `AtelierProject2_Iteration2_Ganlin_Du.code-workspace` in Visual Studio Code.

Run `npm run dev`, then open http://127.0.0.1:4173/ . Refresh after editing.
Run `npm run build` or press Ctrl+Shift+B to produce the static site in `dist/`.
The app uses the existing Three.js CDN import map and requires an internet connection.

## Applications

Each environment starts in `01 / EXTERIOR`: a wide camera view with all interior objects hidden.
`02 / INTERIOR` moves the camera closer, reveals the furnished interior and opens the foreground envelope as an explanatory cutaway.
Changing environments resets the view to EXTERIOR.

- ROOFTOP: complete source dome and the supplied living-room model.
- WINTER: enclosed shell and insulated lining with the shared LIVING interior.
- PARK: A-frame shelter with the shared LIVING interior.
- HIGHWAY: wheeled cabin with the shared LIVING interior.

All four environments reuse the same source model, furniture layout and materials as `01 EXPERIENCE > LIVING`. The complete interior is uniformly scaled to fit each envelope; no separate placeholder furniture is substituted. Imported wall signage is rendered as a plain decorative panel in both views so the website remains English-only.

Envelope dimensions are centralized in `src/scene-sizing.js`. Interior scaling tests sampled source vertices against the dome, tent or cabin profile, with clearance and a fit margin. Tent and mobile-cabin footprints provide enough space to avoid miniature furniture. Cameras fit the complete envelope in EXTERIOR and frame the actual furniture bounds in INTERIOR, with extra vertical room for taller shells.

## Materials and source assets

The supplied Blender module reference is included as `source/AtelierProject2_Iteration2_Ganlin_Du.blend`. This preserves the supplied source assembly; the new environment forms and interactive layers are implemented in the website code. The original upload was not overwritten.
`source-dome.glb` contains the complete Dome_Panels and Dome_Frame objects.
`single-module.glb` contains the independent module parts:

| Source object | Role |
| --- | --- |
| Dome_Frame.009 | Structural metal frame |
| Dome_Frame.010 | Glass panel |
| Dome_Frame.012 | Transparent inner component |

Glass roughness, transmission and IOR are preserved. A fixed per-panel green, blue and teal palette matches the reference image; these color variations are a presentation adjustment, not additional materials found in the original Blender file. The palette stays consistent across environments. Reflections use Blender's Forest environment with AgX tone mapping.

The Forest HDRI is CC0 by Greg Zaal / Poly Haven. See `public/environments/LICENSE.txt`.

## Source files

- `src/main.js`: scene, cameras, environment and navigation.
- `src/adaptive-system.js`: module layers, habitat forms and application views.
- `src/panel-materials.js`: reference palette and per-panel color assignment.
- `src/application-interiors.js`: environment-specific interior furnishings.
- `src/scene-sizing.js`: shared envelope dimensions and interior clearance fitting.
- `src/style.css`: desktop and mobile layouts.
- `.vscode/tasks.json`: preview and build tasks.

This is a conceptual form and construction study. Thermal, structural and vehicle performance are not engineering-validated. Changes are local and have not been pushed to GitHub.

## Package layout

- `src/`: website logic and styles.
- `public/`: runtime models, lighting and asset licenses.
- `scripts/`: local preview and static build.
- `source/`: the renamed Blender source reference.
- `previews/`: the final exterior and interior screenshots.
- `AtelierProject2_Iteration2_Ganlin_Du.code-workspace`: open this file in VS Code.

Temporary downloads, transfer helpers, logs, inspection scripts and intermediate screenshots are excluded from this package.
