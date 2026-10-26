# Eight&Eight – Runde Fotoecken und sieben Innenringe

Diese ZIP enthält 39 Dateien einschließlich dieser Anleitung und CNAME.

## Website hochladen

1. ZIP entpacken.
2. Den Inhalt von eight-and-eight.com-main in die Hauptebene des bestehenden Website-Repositorys hochladen. index.html muss direkt neben CNAME liegen.
3. Vorhandene Dateien ersetzen und die Änderung committen.

Ein ZIP-Upload löscht bereits im GitHub-Repository vorhandene Altdateien nicht.
Die ZIP selbst wird von GitHub Pages nicht automatisch entpackt.

## Fotos ohne zusätzliche Lichtüberlagerungen

- Alle zusätzlichen Foto-Lichtverläufe und Reflexionsüberlagerungen sind entfernt. Die Fotos bleiben beim Scrollen statisch.
- Das bisherige Foto-Lichtskript, seine Einbindung und die dazugehörigen CSS-Ebenen sind aus dem Paket entfernt.
- Die vorhandene natürliche Beleuchtung in den Fotodateien bleibt erhalten. Die Fotos selbst wurden nicht verändert, verkleinert oder nachkomprimiert.
- Die drei Fotos sind weiterhin verlustfreie PNGs mit 1536 × 1024 Pixeln.
- Alle vier Ecken jedes Fotos sind identisch rund und zusätzlich durch eine runde Schnittkante gesichert.

## Querformat

- Startlogo und alle acht Hauptlogos sind gegenüber der vorherigen Version um genau 18 % verkleinert: Breite 0,663216 statt 0,8088 und Höhe 0,984 statt 1,2 der stabilisierten Viewporthöhe. Alle acht Timecode-/Punktringe sind im Querformat zusätzlich um 100 % gegenüber der vorherigen Version vergrößert, also im Durchmesser verdoppelt. Die Logos behalten die um 18 % verkleinerte Größe. Die gemeinsame Drehmitte, Staffelung und Winkelbewegung der Ringe bleiben erhalten. Im Hochformat bleiben die Ringe unverändert.
- Zwischen sichtbarer Logoform und oberem Banner bleiben 2,5 % der Fensterbreite frei, begrenzt auf 12–40 CSS-Pixel. Das entspricht dem Abstand von etwa 38 Pixeln im 1536 Pixel breiten Referenz-Screenshot.
- Derselbe Abstand liegt zwischen sichtbarer Logoform und der nächsten Feldlinie. Der Startbereich wird dafür aus der sichtbaren Höhe der zentrierten Logoform und zweimal diesem Abstand berechnet. Transparente Ränder der SVG zählen nicht als Motivabstand.
- Die Referenz für die Regenlogos und ihre bisherige Größenverteilung bleiben erhalten.
- Die Tapetenkachel bleibt 220 CSS-Pixel groß; sie wächst beim Vergrößern der Logos nicht mit.
- Die Hochformat-Regeln sind unverändert.

## Unterer Banner

- Der Tapetenbanner ist das letzte Element des Seiteninhalts, ohne nachfolgenden Abstand und mit zusätzlicher Berücksichtigung des unteren Safe-Area-Inset.
- Die iOS-Animationsebene erhält ihre Höhe aus dem tatsächlichen Website-Inhalt. Ihre Canvasflächen können keinen zusätzlichen Scrollbereich hinter dem Banner erzeugen.
- Die Browser-Farbvorgabe bleibt Cremeweiß. Native Browserleisten werden weiterhin vom Browser selbst gezeichnet.

## Runde Fotoecken und sieben Innenringe

- Alle drei Fotos werden an einer einheitlichen runden Schnittkante begrenzt. Die Rundung gilt für die Fotodatei selbst und für sämtliche darüberliegenden Darstellungsebenen. Es gibt keine abweichenden rechteckigen Fotoecken.
- Sieben zusätzliche Timecode-Ringbänder setzen die vorhandenen Ringe nach innen fort. Ihre radialen Grenzen folgen dem Kehrwert der Größenstaffelung der sieben weiteren Hauptlogos.
- Die Sichtbarkeiten werden von denselben sieben Hauptlogoebenen übernommen und nehmen nach innen ab. Drehwinkel und zeitliche Staffelung folgen diesen Ebenen; der Mittelpunkt bleibt gemeinsam.
- Die vier Punktreihen jedes neuen Ringbandes reichen bis zu den gemeinsamen radialen Grenzen. Eine kleine Überlappung verhindert freie Zwischenringe. Kreispunkte bleiben rund.
- Die Ringtexturen werden nur bei relevanten Größenänderungen zwischengespeichert. Es gibt keine zusätzliche Animationsschleife und keine sieben zusätzlichen Hauptlogos.

## Schlussphase der Startanimation

- Die Schlussphase dauert insgesamt 1,8 Sekunden: lineare Beschleunigung von 45 auf 888 rpm, unmittelbar danach Stop.
- Die bisher zusätzlich anschließende 2,8-Sekunden-Abbremsphase ist entfernt.
- Beim Stop bleibt die exakt erreichte Winkelposition stehen. Es gibt keinen Sprung auf eine volle Umdrehung. Diese Position wird auch über die nachfolgenden Pausen und Wiederholungen hinweg fortgeführt.
- Die anschließende Pause, die sieben einzelnen Umdrehungen bei 8 rpm und die Staffelung der Hintergrundebenen bleiben erhalten.

## Ruhigere Rotation und stabiler Mittelpunkt

- Die sichtbare Logoform einschließlich der kleinen Punkte wurde in allen neun SVGs um ihren vollständigen Begrenzungsrahmen zentriert. Dadurch sitzt dieselbe Motivmitte auf der Drehachse des Startlogos und der acht Hauptlogos.
- Alle acht Hauptlogos und ihre Punktringe verwenden nun denselben Mittelpunkt. Die bisherigen unterschiedlichen Rotationswinkel und Größen bleiben erhalten; die Ebenen erhalten keine voneinander abweichenden seitlichen oder vertikalen Umlaufbahnen mehr.
- Der Mittelpunkt wird am ungedrehten Startbereich gemessen, nicht am jeweils gedrehten SVG-Rechteck. Die stabilisierte Viewporthöhe hält die Hintergrundachse bei Änderungen mobiler Browserleisten fest.
- Der erste Scrollimpuls wird während der Startrotation nicht mehr für eine Rückstellpause blockiert und die Seite wird nicht mehr auf den Seitenanfang zurückgesetzt. Die vorhandene weiche Winkelübergabe übernimmt beim Scrollen.
- Die zusätzlichen Foto-Lichtüberlagerungen sind anschließend auf Wunsch vollständig entfernt worden.
- Die Tempostufen und Wartezeiten der Startsequenz, die aktuelle Querformat-Skalierung, die verlustfreien Fotodateien und der untere Banner bleiben erhalten.

Prüfung der Rotationskorrektur: gemeinsame Canvas-Drehpunkte an sieben Scrollpositionen, neun ausgerichtete SVGs, identische Drehmitte im Hoch- und Querformat sowie im Desktopformat, keine Scrollblockade und kein erzwungener Rücksprung zum Seitenanfang. Die Foto-Lichtüberlagerungen wurden später vollständig entfernt. Ein direkter iPhone-Safari-Test steht weiter aus.

## Prüfung

Geprüft: sieben neue Innenringbänder, fallende inverse Größen und zugehörige Sichtbarkeiten, radiale Anschlüsse ohne freie Zwischenringe, Textur-Cache ohne erneute Berechnung pro Animationsbild, einheitliche Rundung aller Fotos, Entfernen sämtlicher zusätzlicher Foto-Lichtebenen, unveränderte Bilddateien, lokale Dateiverweise, JavaScript-Syntax und ZIP-Integrität. Die erste Fassung wurde vor der anschließenden Entfernung der Foto-Lichter in der Vorschau mit aktiven Lichtverläufen geprüft.
Ein Test auf einem echten iPhone mit Safari war nicht möglich. Die Vorschau enthält keine nativen Safari-Browserleisten.

## Bildbearbeitung – historische Originalprompts

Diese Prompts dokumentieren die frühere Erstellung der unverändert verwendeten Fotodateien. Die zusätzliche scrollgesteuerte Foto-Beleuchtung ist inzwischen entfernt. Verwendet wurde das integrierte Bildbearbeitungswerkzeug.

### partnership-strategy-chess-eight-lights.png

Use case: lighting-weather. Edit target: the brass and silver chessboard photograph. REMOVE the visible upper-left sun/glowing hotspot, all sun rays, lens flare polygon chain, starburst sparkles and sun discs. Replace that background with a calm softly blurred warm neutral studio backdrop. Keep the exact chess-piece arrangement, foreground knight, all board geometry, framing, camera angle, materials and scratches. Create a final premium photorealistic website photo, full 1536x1024 resolution, retain microscopic realistic texture and depth. Relight with exactly EIGHT separate large diffused area lights outside the camera view: upper-left soft key, upper-right soft fill, left broad strip, right broad strip, overhead diffusion, back-left rim, back-right rim, low front soft bounce. All eight contribute soft subtle broad material reflections. Warm PALE CHAMPAGNE GOLD and warm platinum, restrained exposure, natural contrast. Light sources themselves completely invisible. Only diffuse illumination and soft realistic reflections in the existing metal. NO sun, NO light disc, NO visible lamp, NO starburst, NO beams, NO flare circles/polygons, NO added objects, NO text. Keep subject fixed, precise composition and detailed photographic realism. This is the actual single photo asset, not a collage or a website mockup.

### concept-clockwork-eight-lights.png

Use case: lighting-weather. Edit target: the mechanical watch movement photograph. Keep every gear, bridge, screw, ruby, hairspring, crop and camera angle unchanged; no mechanical motion. Create a final premium photorealistic website photo, full 1536x1024 resolution, retain microscopic realistic texture and depth. Relight with exactly EIGHT separate large diffused area lights outside the camera view: upper-left soft key, upper-right soft fill, left broad strip, right broad strip, overhead diffusion, back-left rim, back-right rim, low front soft bounce. All eight contribute soft subtle broad material reflections. Warm PALE CHAMPAGNE GOLD and warm platinum, restrained exposure, natural contrast. Light sources themselves completely invisible. Only diffuse illumination and soft realistic reflections in the existing metal. NO sun, NO light disc, NO visible lamp, NO starburst, NO beams, NO flare circles/polygons, NO added objects, NO text. Keep subject fixed, precise composition and detailed photographic realism. This is the actual single photo asset, not a collage or a website mockup.

### contact-gold-eight-lights.png

Use case: lighting-weather. Edit target: the solid gold Eight and Eight emblem lying on sand. Preserve the exact emblem geometry, all small gold discs, their number and positions, the sand texture, framing and camera angle. Do not change or add any part of the logo. Create a final premium photorealistic website photo, full 1536x1024 resolution, retain microscopic realistic texture and depth. Relight with exactly EIGHT separate large diffused area lights outside the camera view: upper-left soft key, upper-right soft fill, left broad strip, right broad strip, overhead diffusion, back-left rim, back-right rim, low front soft bounce. All eight contribute soft subtle broad material reflections. Warm PALE CHAMPAGNE GOLD and warm platinum, restrained exposure, natural contrast. Light sources themselves completely invisible. Only diffuse illumination and soft realistic reflections in the existing metal. NO sun, NO light disc, NO visible lamp, NO starburst, NO beams, NO flare circles/polygons, NO added objects, NO text. Keep subject fixed, precise composition and detailed photographic realism. This is the actual single photo asset, not a collage or a website mockup.
