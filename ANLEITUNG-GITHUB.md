# Eight&Eight – Website, acht diffuse Lichtquellen

Diese ZIP enthält 40 Dateien einschließlich dieser Anleitung und CNAME.

## Website hochladen

1. ZIP entpacken.
2. Den Inhalt von eight-and-eight.com-main in die Hauptebene des bestehenden Website-Repositorys hochladen. index.html muss direkt neben CNAME liegen.
3. Vorhandene Dateien ersetzen und die Änderung committen.

Ein ZIP-Upload löscht bereits im GitHub-Repository vorhandene Altdateien nicht.
Die ZIP selbst wird von GitHub Pages nicht automatisch entpackt.

## Fotos und Licht

- Schachfoto ohne sichtbare Sonne, Strahlen, Sternreflexe oder polygonale Lens Flares; weiches Licht und Metallreflexionen.
- Alle drei Fotos wurden mit dem integrierten Bildbearbeitungswerkzeug bearbeitet, mit acht außerhalb des Bildes liegenden diffusen Flächenlichtern als Vorgabe.
- Acht getrennte weiche Lichtverläufe pro Foto wandern beim Scrollen von links über die Mitte nach rechts. Jeder Verlauf hat eine eigene Richtung und einen versetzten Durchlauf. Beim Zurückscrollen laufen dieselben Lichtverläufe exakt rückwärts; die Fotomotive bleiben unbewegt.
- Jede Reflexion verwendet die unveränderte Fototextur und eine mit dem Scrollfortschritt wandernde, breit gefiederte Lichtmaske. Keine weißen Kreise oder sichtbaren Lichtquellen im Bild.
- Die drei neuen Fotos sind verlustfreie PNGs mit 1536 × 1024 Pixeln. Sie wurden nach der Bildbearbeitung weder verkleinert noch verlustbehaftet nachkomprimiert.
- Bei reduzierter Bewegung bleiben die neu ausgeleuchteten Fotos statisch.
- Nicht mehr benötigte alte Foto- und Beleuchtungsdateien sind entfernt.

## Querformat

- Startlogo: Breite von 0,5392 auf 0,8088 der stabilen Viewporthöhe; Höhe von 0,8 auf 1,2. Dies entspricht jeweils +50 %.
- Die acht Hintergrund-Hauptlogos werden wie bisher aus der Größe des Startlogos abgeleitet und wachsen deshalb ebenfalls um 50 %. Ihre Punktringe folgen derselben gemeinsamen Skalierung.
- Der Startbereich reserviert jetzt 1,5 Viewporthöhen plus 48 Pixel. Das lässt auch der Drehhülle des Startlogos Platz zwischen oberem Banner und erster Inhaltslinie. Bei kleinen Querformat-Displays ist dieser größere Bereich scrollbar.
- Die Referenz für die Regenlogos und ihre bisherige Größenverteilung bleiben erhalten.
- Die Tapetenkachel bleibt 220 CSS-Pixel groß; sie wächst beim Vergrößern der Logos nicht mit.

## Unterer Banner

- Der Tapetenbanner ist das letzte Element des Seiteninhalts, ohne nachfolgenden Abstand und mit zusätzlicher Berücksichtigung des unteren Safe-Area-Inset.
- Die iOS-Animationsebene erhält ihre Höhe aus dem tatsächlichen Website-Inhalt. Ihre Canvasflächen können keinen zusätzlichen Scrollbereich hinter dem Banner erzeugen.
- Die Browser-Farbvorgabe bleibt Cremeweiß. Native Browserleisten werden weiterhin vom Browser selbst gezeichnet.

## Prüfung

Geprüft: Darstellung in Chromium bei 896 × 414, 393 × 852 und 1280 × 800 CSS-Pixeln; acht Reflexionsanteile in jedem der drei Fotos; acht scrollabhängig wandernde Lichtmasken, Rückwärtslauf und unveränderte Fotogeometrie; PNG-Auflösung; Platz im Startbereich; Übereinstimmung von Bannerende und Dokumentende; lokale Dateiverweise; JavaScript-Syntax und ZIP-Integrität.
Ein Test auf einem echten iPhone mit Safari war nicht möglich. Die Vorschau enthält keine nativen Safari-Browserleisten.

## Bildbearbeitung – Originalprompts

Verwendet wurde das integrierte Bildbearbeitungswerkzeug, nicht ein nachträglicher Python-Bildfilter. Nachstehend stehen die vollständigen Bildbearbeitungsaufträge.

### partnership-strategy-chess-eight-lights.png

Use case: lighting-weather. Edit target: the brass and silver chessboard photograph. REMOVE the visible upper-left sun/glowing hotspot, all sun rays, lens flare polygon chain, starburst sparkles and sun discs. Replace that background with a calm softly blurred warm neutral studio backdrop. Keep the exact chess-piece arrangement, foreground knight, all board geometry, framing, camera angle, materials and scratches. Create a final premium photorealistic website photo, full 1536x1024 resolution, retain microscopic realistic texture and depth. Relight with exactly EIGHT separate large diffused area lights outside the camera view: upper-left soft key, upper-right soft fill, left broad strip, right broad strip, overhead diffusion, back-left rim, back-right rim, low front soft bounce. All eight contribute soft subtle broad material reflections. Warm PALE CHAMPAGNE GOLD and warm platinum, restrained exposure, natural contrast. Light sources themselves completely invisible. Only diffuse illumination and soft realistic reflections in the existing metal. NO sun, NO light disc, NO visible lamp, NO starburst, NO beams, NO flare circles/polygons, NO added objects, NO text. Keep subject fixed, precise composition and detailed photographic realism. This is the actual single photo asset, not a collage or a website mockup.

### concept-clockwork-eight-lights.png

Use case: lighting-weather. Edit target: the mechanical watch movement photograph. Keep every gear, bridge, screw, ruby, hairspring, crop and camera angle unchanged; no mechanical motion. Create a final premium photorealistic website photo, full 1536x1024 resolution, retain microscopic realistic texture and depth. Relight with exactly EIGHT separate large diffused area lights outside the camera view: upper-left soft key, upper-right soft fill, left broad strip, right broad strip, overhead diffusion, back-left rim, back-right rim, low front soft bounce. All eight contribute soft subtle broad material reflections. Warm PALE CHAMPAGNE GOLD and warm platinum, restrained exposure, natural contrast. Light sources themselves completely invisible. Only diffuse illumination and soft realistic reflections in the existing metal. NO sun, NO light disc, NO visible lamp, NO starburst, NO beams, NO flare circles/polygons, NO added objects, NO text. Keep subject fixed, precise composition and detailed photographic realism. This is the actual single photo asset, not a collage or a website mockup.

### contact-gold-eight-lights.png

Use case: lighting-weather. Edit target: the solid gold Eight and Eight emblem lying on sand. Preserve the exact emblem geometry, all small gold discs, their number and positions, the sand texture, framing and camera angle. Do not change or add any part of the logo. Create a final premium photorealistic website photo, full 1536x1024 resolution, retain microscopic realistic texture and depth. Relight with exactly EIGHT separate large diffused area lights outside the camera view: upper-left soft key, upper-right soft fill, left broad strip, right broad strip, overhead diffusion, back-left rim, back-right rim, low front soft bounce. All eight contribute soft subtle broad material reflections. Warm PALE CHAMPAGNE GOLD and warm platinum, restrained exposure, natural contrast. Light sources themselves completely invisible. Only diffuse illumination and soft realistic reflections in the existing metal. NO sun, NO light disc, NO visible lamp, NO starburst, NO beams, NO flare circles/polygons, NO added objects, NO text. Keep subject fixed, precise composition and detailed photographic realism. This is the actual single photo asset, not a collage or a website mockup.
