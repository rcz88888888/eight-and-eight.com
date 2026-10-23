# Videomedien v215

Die drei fertigen Videos und ihre Poster liegen neben index.html:

| Datei | Inhalt |
|---|---|
| clockwork-scroll-v215.mp4 | Gegensinnig drehende Räder und schwingende Unruh unter festen Brücken |
| chess-scroll-v215.mp4 | Perspektivischer Springerzug (1, 2) mit Vordergrundüberdeckung |
| gold-scroll-v215.mp4 | Wandernde Reflexionen auf dem ruhenden Goldlogo |
| clockwork-poster-v215.jpg | Erstes Bild des Uhrwerkvideos |
| chess-poster-v215.jpg | Erstes Bild des Schachvideos |
| gold-poster-v215.jpg | Erstes Bild des Goldlogovideos |

Alle MP4s: 1152 × 768 Pixel, H.264, 24 fps, 96 I-Frames, 4 s, ohne Ton,
faststart. Der Browser ordnet den Scrollfortschritt unmittelbar den 96 Frames zu.
Die Videodateidauer ist deshalb nicht die reale Vorbeiscrollzeit; das Nutzertempo
bestimmt, wie schnell die Sequenz durchlaufen wird.

## Erzeugung

Die integrierte Bildgenerierung erzeugte die Freisteller und Masken. Daraus
wurden mit einer feststehenden virtuellen Kamera, lokaler Mechanikbewegung,
Oberflächennormalen und einer gemeinsamen wandernden Sonne einzelne Frames
gerendert und mit FFmpeg in MP4-Dateien kodiert. Es wurde kein generatives
Bild-zu-Video-Modell eingesetzt. Der eigentliche Seitenhintergrund benötigt
weiterhin seine bisherigen Canvas-Animationen; die Fotovideos selbst verwenden
im Browser kein WebGL.

Die Oberflächentönung orientiert sich am Champagnerhellgold des Bannermusters.
Die finale gemeinsame Farbgewichtung verwendet einen Luminanzmultiplikator
(1.09, 1.012, 0.83); die ausgegebene Helligkeit wird anschließend um 8 % erhöht.
Die Lichtquelle bleibt außerhalb des Ausschnitts; es werden keine Sonnenscheiben
oder direkten Strahlen in die Filme gelegt.

## Präzisierungen in v215

- Hauptrad: 1,30 statt 5,20 Radiant über die Sequenz (75 % weniger).
  Zweites Rad: entgegengesetzt im bisherigen Übersetzungsverhältnis 60/72.
  Unruh: ±0,045 statt ±0,18 Radiant; vier statt zehn Schwingungen.
- Springer: Mittelpunkt der Standflächenellipse im Freisteller (728, 854),
  auf die perspektivischen Feldmitten abgebildet. Die Zentren werden in den
  Frames 15, 37, 58 und 80 erreicht. Drei einzelne, weich verlaufende
  Ein-Feld-Abschnitte bilden den legalen L-Zug. Keine zusätzliche Hubbewegung.
  Die Figur skaliert mit der lokalen Perspektive des Bretts.
- Licht: derselbe Satz von 18 seitlich wandernden Sonnenpositionen wird für
  alle drei Filme verwendet und zwischen den Positionen interpoliert.
  Genau eine Lichtquelle wird pro Frame ausgewertet. Bild-Y der Normalmaps
  wird vor der Reflexionsberechnung in Kamera-Y umgerechnet. GGX-Reflexionen,
  Fresnel, Materialrauheit und eine weiche Tonwertschulter ersetzen den zu
  schwachen bisherigen Verlauf. Die Lichtquelle selbst bleibt unsichtbar.
- Separater Lichttest: alle 18 Positionen bei eingefrorener Mechanik und
  unverändertem Springerstand. Damit ist die Lichtänderung bei Schach und
  Gold unabhängig von einer Objektbewegung geprüft.

## Verwendete Bildprompts

### clock-background

Use case: precise-object-edit. Edit target: provided watch macro photo. Produce exact 1536x1024 same camera locked, same geometry/positions/frame. Animation clean background plate: remove ONLY the three large moving wheels: main brass gear centred about (560,460) radius260x195; rear brass gear centred (970,220) radius240x170; right gold balance wheel and spiral spring centred (1205,530) radius280x215. Remove their rims/spokes/springs completely, fill recesses naturally with dark recessed watch mechanism below, no empty white holes. KEEP ALL stationary bridges, metal plates, screws, ruby bearings, posts, case ring at their original pixels, including bridges that span the removed wheels. Preserve their shapes exactly. Light pale champagne gold and warm platinum, matching cream-white sand-gold baroque wallpaper. No orange brass, no visible sun, no beams/flares. Soft natural ambient illumination, photo-real. This will sit behind separately animated wheels.

### gear-main

Use case: background-extraction / animation asset. Reference photo: watch materials and main centre brass wheel. Create ONE COMPLETE circular gold watch gear seen perfectly orthographically from directly above, centred (512,512) on 1024x1024 transparent RGBA canvas, outer radius440px. It is the six-spoke wheel corresponding to the large central watch gear, complete reconstruction of the parts hidden by bridges. Fine precise regular meshing teeth, six radial spokes, open transparent gaps between spokes, small open axle hole. No ruby bearing, no bridges, no screws, no case, no other gears, no surface below. Actual transparency everywhere outside metal and in the spoke gaps. Thin machined light CHAMPAGNE GOLD, soft ambient neutral light, fine brushed scratches, elegant pale gold similar to warm platinum, not orange. High-end real watchmaking photo detail, no sun/starbursts/flare. Circle must be geometrically round, flat top-down without perspective; intended to rotate and be projected onto an ellipse in a fixed watch photo.

### gear-rear

Use case: background-extraction / animation asset. Reference photo: watch materials and rear upper brass gear. ONE COMPLETE circular eight-spoke machined watch gear seen perfectly orthographically directly from above, centred (512,512) on 1024x1024 transparent RGBA canvas, outer radius440px. Complete regular small meshing teeth, eight narrow radial spokes, centre axle hole, open TRANSPARENT gaps between spokes. No ruby bearing, no bridges, no screws, no case or other objects. Real light PALE CHAMPAGNE GOLD / warm platinum-brass, reduced yellow/orange, subtle authentic machining, softly lit neutral ambient metal reflections. Actual alpha transparency outside and in openings. No contact shadow, no sun/rays, no flare. Precisely round top-down asset for mechanical rotation inside a photographed watch.

### balance

Use case: background-extraction / animation asset. Reference photo: right watch balance wheel and coiled hairspring. ONE COMPLETE circular balance-wheel assembly viewed orthographically from DIRECTLY ABOVE, centre (512,512) on 1024x1024 transparent RGBA canvas, outer radius440px. Delicate pale CHAMPAGNE GOLD outer rim, few slim radial spokes and a dark warm-platinum concentric tightly wound fine hairspring inside. Small axle hole at exact centre. No ruby bearing, no fixed bridge across it, no screws/plates/case/background, all gaps are truly transparent. Realistic expert Swiss watchmaking macro detail, thin machined metal and fine coiled spring, neutral soft ambient light. No sun/beams/flares. Geometrically round top-down asset intended to oscillate under a stationary bridge in a watch photograph.

### Finale stationäre Uhrwerkmaske

Precise binary foreground occlusion mask for this exact watch photograph, 1536x1024. WHITE filled silhouettes ONLY of the TOP SILVER BRIDGE PLATES, their fixed ruby-bearing mounts and fixed screws that sit ON those plates. The outer metal case rim can be white. All other pixels BLACK, especially ALL recessed areas UNDER the top bridges, EVERY small wheel or gear/spoke/spring visible below and their rims, toothed edges and axles. NO line-art tracing, NO white outlines around mechanical cavities. Entire recessed areas must be solid BLACK, not white wheel outlines. The silver bridges are broad SOLID WHITE shapes, including their screws and ruby centres all filled white. Do not draw outlines of screws or jewels, fill them white. Pixel-exact locations/camera/frame as input; top silver parts unchanged. This is a white mask to hide rotating wheels under STATIC SILVER PLATES, not a drawing of the watch.

### Schach-Vordergrundmaske

Technical monochrome foreground occlusion mask derived from this fixed chess photo, exactly 1536x1024 and pixel aligned. PURE WHITE for ONLY the TWO LARGE BLURRED FOREGROUND PAWNS: left pawn partly cut off at x0..215,y640..1024, and lower middle/right pawn at x975..1245,y570..1024. Include each pawn's full head, neck, collar, base silhouette and cropped edge, with a narrow naturally soft 3-6px alpha/grey feather because these two pawns are out of focus. EVERYTHING ELSE pure BLACK, including board, all other pieces, shadows and reflections. Do not move/rescale/reconstruct the objects. This mask is used to overlay the original stationary foreground pawns in front of a separately moving knight, preserving proper depth occlusion. Absolutely no photographic material/colour, only white pawn silhouettes on black.
