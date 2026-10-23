# Bildassets v213

Die folgenden Projektassets wurden mit der integrierten Bildgenerierung bearbeitet. Die Webseitenanimation setzt die fertigen Rasterbilder als Texturen ein. Alle Bilder liegen im selben Ordner wie index.html.

| Asset | Verwendung |
|---|---|
| photo-clockwork-champagne-v213.jpg | Uhrwerk in hellem Champagnergold |
| photo-gold-champagne-v213.jpg | Goldlogo in hellem Champagnergold |
| photo-chess-board-champagne-v213.jpg | Schachbrett ohne bewegliche Vordergrundfigur |
| photo-knight-champagne-v213.png | Transparente bewegliche Pferdefigur |
| photo-chess-board-normals-v213.png | Oberflächennormalen des festen Schachbretts |

Die transparente Pferdefigur wird beim Anzeigen auf die ursprüngliche Position und Größe kalibriert. Ihre Farb- und Normalentexturen werden gemeinsam bewegt. Die statische Ersatzansicht setzt dasselbe freigestellte Bild darüber.

## Verwendete Prompts

### clockwork-champagne

Use case: lighting-weather. EDIT TARGET: provided watch movement photo. Preserve exactly every component, position, camera perspective, crop and geometry, 1536x1024. Change only colour/material grading to refined LIGHT PALE CHAMPAGNE GOLD to harmonise with a cream-white and sand-gold luxury website. Existing golden brass becomes elegant pale champagne gold rather than orange/yellow. Steel remains softly warm platinum/champagne. Keep fine scratches, metal machining, jewels and natural photorealistic contrast. Soft natural ambient light, light source outside photo, no sun disc, no beams or starbursts, no new flare circles. Do not increase exposure: website separately applies precisely 8 percent brightness. No other changes.

### gold-champagne

Use case: lighting-weather. EDIT TARGET: provided solid-gold logo on sand. Preserve exact logo geometry, all circular dots, positions, bevels, photo angle, sand and framing, 1536x1024. Change metal colour only to sophisticated LIGHT PALE CHAMPAGNE GOLD matching a cream-white/sand-gold luxury agency website. Less yellow/orange, brighter pale cool champagne material, still unmistakably solid gold bars. Preserve fine realistic scratches and machining, no wallpaper pattern. Sand subtly pale warm champagne ivory. Soft ambient natural light from outside frame, no sun discs, rays or artificial flare circles. Keep original exposure because website adds exactly 8 percent brightness. No other changes.

### chess-clean-champagne

Use case: precise-object-edit. EDIT TARGET: chess photograph. Preserve entire original 1536x1024 framing/camera, all board tile corners and ALL OTHER chess pieces exactly in place. REMOVE ONLY the large gold KNIGHT (horse) in the front centre at x430..700,y320..780 including its cast shadow and its reflected horse image on the board immediately below. Invisibly reconstruct the now-empty square with its original metal chessboard chequer pattern and perspective lines, seamless polished surface; leave no duplicate horse, ghost, pedestal or cutout seam. The empty square is necessary for moving that knight as a separate animation layer. Keep other pieces perfectly fixed. Also grade golden brass to refined LIGHT PALE CHAMPAGNE GOLD and silver to warm platinum to suit cream-white sand-gold agency branding. Light remains soft ambient offscreen natural light, no visible sun, no direct beams, no starbursts, no flare discs. Keep fine metal textures and original exposure; code separately adds precisely 8 percent brightness.

### knight-cutout

Use case: background-extraction. EDIT TARGET: chess photo. Produce transparent RGBA 1536x1024 canvas with ONLY the large foreground central GOLD KNIGHT (horse) at its EXACT original pixel position, silhouette, camera angle, scale and design (roughly x430..700, y320..780). The complete knight includes its round stepped base, no board, no reflected horse, no cast shadow, no other chess pieces, no background. Everything outside that one horse is genuinely transparent. Do not recenter or enlarge the horse. Preserve crisp fine silhouette and subtle realistic machining. Grade this horse's brass to refined LIGHT PALE CHAMPAGNE GOLD, photoreal pale gold not orange, matching original geometry exactly. Keep natural soft ambient reflections, no sun or artificial highlights. Original exposure unchanged; website adds 8 percent brightness.

### chess-clean-normals

Technical camera-space RGB normal map EDIT. Preserve exact framing and EVERY other piece and board grid in this 1536x1024 normal map. REMOVE only the large foreground centre knight at x430..700,y320..780. Replace that removed knight area with seamless camera-space normals of the flat chessboard plane behind it. No pedestal or ghost outline. Keep background pure BLACK(0,0,0). Keep all other piece normals geometrically identical. Normal convention: red screen-right, green screen-up, blue towards viewer; map -1..1 to 0..255; front-facing normal is (128,128,255). No lighting/photographic colour. Board stays continuous with original normal gradient and grid. This is the background normal map for separately animating the removed horse.
