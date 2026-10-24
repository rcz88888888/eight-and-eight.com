# Videomedien v217

| Datei | Inhalt |
|---|---|
| clockwork-scroll-v217.mp4 | Lokale Mechanikbewegung unter feststehenden Brücken |
| chess-scroll-v217.mp4 | Springer von Feldmitte zu Feldmitte auf einem legalen L-Weg |
| gold-scroll-v217.mp4 | Fotografisches Goldlogo im Sand mit wandernden Reflexionen |
| clockwork-poster-v217.png | Verlustfreies erstes Renderbild des Uhrwerks |
| chess-poster-v217.png | Verlustfreies erstes Renderbild des Schachmotivs |
| gold-poster-v217.png | Verlustfreies erstes Renderbild des Goldlogos |

Alle Clips: 1536 × 1024, H.264 High Level 4.2, yuv420p, CRF 8, slow,
48 fps, 192 Frames, vier Sekunden, ohne Ton, faststart, keine B-Frames,
Schlüsselbild alle acht Frames. Die Konvertierung und die Metadaten verwenden
BT.709 mit TV-Pegeln. Das Quell-RGB ist voll ausgesteuert. Die PNGs sind
verlustfrei; die MP4s verwenden hochwertige Videokompression.

Die Browsersteuerung ordnet den Scrollfortschritt unmittelbar den 192 Frames
zu. Sie verwendet weder Autoplay noch eine unabhängige Abspieluhr. Die lokale
Mechanik, der perspektivische Springerzug und die Lichtwanderung werden im
Vorfeld mit einer feststehenden virtuellen Kamera gerendert. Die Fotoflächen
benötigen beim Betrachter keine WebGL-Neuberechnung. Die Hintergrundlogos der
Website verwenden weiterhin ihre bisherigen Canvasflächen.

## Detail- und Lichtberechnung

Die Lichtberechnung greift auf die ursprünglichen Fototexturen in voller
Auflösung zu. Ein GGX-/Fresnel-Modell liefert die Änderung relativ zur
Beleuchtung des Ausgangsfotos. Dieser relative Faktor moduliert die vorhandene
Fotografie. Es werden keine flachen weißen Reflexionsflächen auf die
Metalltexturen addiert und keine zusätzliche graue Entsättigung darübergelegt.
Die feinsten Texturdetails bleiben durch diesen Ansatz räumlich erhalten.
Der 8-%-Helligkeitsschritt und eine weiche Begrenzung ausschließlich der
Spitzlichter bleiben aktiv.
Die Belichtung der separat freigestellten Räder ist an das fotografierte
Uhrwerk angeglichen; ihre Materialantwort streut breiter als polierte Brücken,
damit die feinen Schliffspuren in der Reflexion nicht überstrahlen.

Für alle drei Motive werden dieselben 18 seitlich wandernden Positionen einer
Sonne ausgewertet. Die Positionen werden kontinuierlich interpoliert. Die
Quelle bleibt außerhalb des Bildes. Der Normalen-Y-Anteil ist an die
Kamerakoordinaten angepasst. Ein gesonderter Test hält die Objektbewegung fest
und prüft die Lichtänderung an allen 18 Positionen unabhängig davon.

## Mechanik und Schach

Das Hauptrad dreht weiterhin 1,30 Radiant über den gesamten Scrollweg; das
zweite Rad dreht im Verhältnis 60/72 entgegen. Die Unruh schwingt mit
±0,045 Radiant und vier Schwingungen. Damit bleibt die reduzierte Bewegung
aus v215 erhalten.

Der Mittelpunkt der Standflächenellipse des Springers wird aus dem
Freistellerpunkt (728, 854) in die Brettgeometrie abgebildet. In den Frames
30, 74, 117 und 161 steht er jeweils exakt auf den vier Feldmitten des
L-Wegs. Die Bewegung hat drei einzelne weiche Abschnitte, keine zusätzliche
Hubbewegung und eine an das Brett angepasste Perspektivskalierung.

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
