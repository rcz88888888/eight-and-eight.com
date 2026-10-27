# Eight&Eight – Scroll-Rückdrehung vor der Seitennavigation

Diese ZIP enthält 41 Dateien einschließlich dieser Anleitung und CNAME.

## Abbruch der Startanimation durch Scrollen

- Wird die laufende Startrotation am Seitenanfang durch Scrollen unterbrochen, bleibt der Seiteninhalt zunächst am Start. Der Scrollweg dreht das Startlogo, alle acht Hauptlogos und die daran gebundenen Ringe gemeinsam in ihre jeweilige Ausgangsausrichtung zurück.
- Die Rückdrehung verwendet die tatsächlich sichtbaren, auch zeitversetzten Winkel. Jede Ebene kehrt auf dem kürzesten Drehweg zurück. Ohne weitere Scrollbewegung bleibt die Rückdrehung stehen; es gibt keine automatische 600-ms-Rückdrehung während gleichzeitigem Seitenscrollen.
- Erst nachdem alle Logos vollständig aufrecht gezeichnet wurden, wird das normale Seitenscrollen freigegeben. Derselbe Touch-Wisch kann nach dieser Freigabe weiter nach unten navigieren. Mausrad und Scrolltasten werden ebenfalls berücksichtigt.
- Die Sperre gilt nur für das Unterbrechen einer verdrehten Startanimation am Seitenanfang. Bei bereits aufrechten Logos, weiter unten auf der Seite, im geöffneten Menü und bei reduzierter Bewegung wird der normale Scrollweg nicht abgefangen. Explizite Menü-Navigation bleibt verfügbar.

## Zufälliger Logoregen

- Die maximale Breite und Höhe der Regenlogos ist halbiert: maximal 22 % statt 44 % der bestehenden Regen-Größenreferenz. Die kleinsten Logos behalten ihre bisherige Größe.
- Der schnellste vollständige Fall dauert mindestens zwei statt einer Sekunde. Die maximale normierte Fallgeschwindigkeit ist damit halbiert. Die langsame Grenze von acht Sekunden bleibt erhalten.
- In allen Modi wird die bisherige maximale Anzahl gleichzeitig fallender Logos um 10 % erhöht und auf volle Logos aufgerundet. Die bisherige Hochformat-Reduzierung wird vor dieser Erhöhung angewendet.
- Zufällige Positionen, Größenverteilung, Sichtbarkeiten und fortlaufendes Nachfallen bleiben erhalten. Startlogo, Hauptlogos und Timecoderinge verwenden ihre bisherigen Größen und Geschwindigkeiten.

## Weitere Referenzen

- Warner Music Group und Vodafone sind unter Work / Customers & Cooperators ergänzt. Das Raster enthält jetzt 16 Referenzlogos.
- Beide Logos verwenden die hochgeladenen Originalmotive und Originalfarben. Beim Warner-PNG wurden ausschließlich transparente Außenränder verlustfrei entfernt. Das Vodafone-Logo bleibt eine Vektordatei; dessen Zeichenfläche ist im Seitenverhältnis des vorhandenen viewBox angegeben.

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
- Beide Tapetenbanner sind an allen vier Kanten eingerahmt: oben, unten und beidseitig links und rechts. Alle gegenüberliegenden Randlinien verwenden dieselbe Farbe und Stärke: 1,5 CSS-Pixel im Hochformat, 0,8 CSS-Pixel im Querformat.
- Die Randlinien der Banner werden direkt als native Außenrahmen gezeichnet. Die bisherige doppelte Konstruktion aus transparentem Außenrahmen und nach innen versetzter Rahmenmaske ist für beide Banner entfernt. Dadurch gibt es außen neben den Randlinien keine schmalen cremeweißen Zwischenstreifen. Andere Inhaltsrahmen behalten ihre vorhandene Darstellung.
- Die iOS-Animationsebene erhält ihre Höhe aus dem tatsächlichen Website-Inhalt. Ihre Canvasflächen können keinen zusätzlichen Scrollbereich hinter dem Banner erzeugen.
- Der obere Browserbereich erhält dieselbe Cremeweiß-Vorgabe #fdfcfa wie der Website-Hintergrund. Zusätzlich zu theme-color sowie html/body-Hintergrund enthält die Seite am oberen Rand eine leere, textbeschnittene Farbfläche für Safaris Farbübernahme. Sie liefert die Cremefarbe, ohne einen sichtbaren Streifen, zusätzliche Abstände oder eine Abdeckung des Tapetenmusters zu zeichnen. Native Browserleisten bleiben vom Browser gesteuert; ein direkter iPhone-Safari-Test ist hier nicht verfügbar.

## Runde Fotoecken und sieben Innenringe

- Alle drei Fotos werden an einer einheitlichen runden Schnittkante begrenzt. Die Rundung gilt für die Fotodatei selbst und für sämtliche darüberliegenden Darstellungsebenen. Es gibt keine abweichenden rechteckigen Fotoecken.
- Sieben zusätzliche Timecode-Ringbänder setzen die vorhandenen Ringe nach innen fort. Ihre radialen Grenzen folgen dem Kehrwert der Größenstaffelung der sieben weiteren Hauptlogos.
- Die Sichtbarkeiten werden von denselben sieben Hauptlogoebenen übernommen und nehmen nach innen ab. Drehwinkel und zeitliche Staffelung folgen diesen Ebenen; der Mittelpunkt bleibt gemeinsam.
- Die vier Punktreihen jedes neuen Ringbandes reichen bis zu den gemeinsamen radialen Grenzen. Eine kleine Überlappung verhindert freie Zwischenringe. Kreispunkte bleiben rund.
- Die Ringtexturen werden nur bei relevanten Größenänderungen zwischengespeichert. Es gibt keine zusätzliche Animationsschleife und keine sieben zusätzlichen Hauptlogos.

## Schlussphase der Startanimation

- Die Schlussphase dauert insgesamt 1,8 Sekunden: Beschleunigung von 45 auf 888 rpm, unmittelbar danach Stop in Ausgangsposition.
- Die bisher zusätzlich anschließende 2,8-Sekunden-Abbremsphase ist entfernt.
- Eine kleine, weich verteilte Winkelkorrektur innerhalb der Schlussbeschleunigung schließt die Sequenz bei genau 23 vollen Umdrehungen ab. Die Geschwindigkeit an Anfang und Ende bleibt exakt 45 beziehungsweise 888 rpm; die Korrektur verschwindet dort ohne zusätzlichen Geschwindigkeitssprung. Die Beschleunigung bleibt durchgehend vorwärts gerichtet.
- Jeder anschließende Stop liegt ebenfalls in der aufrechten Ausgangsposition. Die sieben einzelnen vollen Umdrehungen und spätere Wiederholungen übernehmen keinen Restwinkel. Es gibt weder ein nachträgliches Zurückspringen noch eine zusätzliche Abbremsphase.
- Die anschließende Pause, die sieben einzelnen Umdrehungen bei 8 rpm und die Staffelung der Hintergrundebenen bleiben erhalten.

## Ruhigere Rotation und stabiler Mittelpunkt

- Die sichtbare Logoform einschließlich der kleinen Punkte wurde in allen neun SVGs um ihren vollständigen Begrenzungsrahmen zentriert. Dadurch sitzt dieselbe Motivmitte auf der Drehachse des Startlogos und der acht Hauptlogos.
- Alle acht Hauptlogos und ihre Punktringe verwenden nun denselben Mittelpunkt. Die bisherigen unterschiedlichen Rotationswinkel und Größen bleiben erhalten; die Ebenen erhalten keine voneinander abweichenden seitlichen oder vertikalen Umlaufbahnen mehr.
- Der Startmittelpunkt wird am ungedrehten Startbereich gemessen, nicht am jeweils gedrehten SVG-Rechteck. Während die Tapete in den Hauptlogos ausblendet, geht die gemeinsame Drehmitte weich von dieser Startposition zur Mitte des sichtbaren Bereichs unter dem oberen Banner über.
- Sobald die Tapete vollständig verschwunden ist, bleiben Hauptlogos und alle äußeren und inneren Ringe auf dieser gemeinsamen Mitte. Es gibt keine weitere Verschiebung über die restliche Scrollstrecke. Die vorhandenen Drehwinkel und die Staffelung beim Scrollen bleiben erhalten.
- Im Hoch- und Querformat wird die Achse zwischen tatsächlichem Bannerende und sichtbarem Fensterrand berechnet. Mobile Browserleisten werden über VisualViewport berücksichtigt, mit innerHeight als Rückfall. Die Logogrößen bleiben bei mobilen Leistenänderungen stabil. Beim Orientierungswechsel wird die Größenreferenz neu gemessen; beim Zoomen bleibt die Achse auf die Layoutmitte bezogen.
- Beim ersten Scrollimpuls während der Startrotation wird zunächst die oben beschriebene scrollgesteuerte Rückdrehung ausgeführt. Erst anschließend bewegt sich der Seiteninhalt. Weiter unten bleibt die vorhandene Winkelstaffelung beim Scrollen erhalten.
- Die zusätzlichen Foto-Lichtüberlagerungen sind anschließend auf Wunsch vollständig entfernt worden.
- Die Tempostufen und Wartezeiten der Startsequenz, die aktuelle Querformat-Skalierung, die verlustfreien Fotodateien und der untere Banner bleiben erhalten.

Die Fotoecken, sieben Innenringe, unveränderten Fotodateien und das Entfernen der zusätzlichen Foto-Lichtüberlagerungen aus der vorigen Fassung bleiben erhalten.

## Prüfung

Geprüft: aufrechte Stopps der Startsequenz und aller sieben Folgeumdrehungen einschließlich gestaffelter Ebenen, kontinuierliche Winkelkorrektur mit 1,8 Sekunden und 45/888-rpm-Grenzen, gemeinsame Drehpunkte vor/nach dem Tapetenübergang, alle vier Randlinien an beiden Bannern, lokale Dateiverweise, JavaScript-Syntax und ZIP-Integrität. Die Fotos und Ringstaffelung bleiben unverändert.
Ein Test auf einem echten iPhone mit Safari war nicht möglich. Die Vorschau enthält keine nativen Safari-Browserleisten.

## Bildbearbeitung – historische Originalprompts

Diese Prompts dokumentieren die frühere Erstellung der unverändert verwendeten Fotodateien. Die zusätzliche scrollgesteuerte Foto-Beleuchtung ist inzwischen entfernt. Verwendet wurde das integrierte Bildbearbeitungswerkzeug.

### partnership-strategy-chess-eight-lights.png

Use case: lighting-weather. Edit target: the brass and silver chessboard photograph. REMOVE the visible upper-left sun/glowing hotspot, all sun rays, lens flare polygon chain, starburst sparkles and sun discs. Replace that background with a calm softly blurred warm neutral studio backdrop. Keep the exact chess-piece arrangement, foreground knight, all board geometry, framing, camera angle, materials and scratches. Create a final premium photorealistic website photo, full 1536x1024 resolution, retain microscopic realistic texture and depth. Relight with exactly EIGHT separate large diffused area lights outside the camera view: upper-left soft key, upper-right soft fill, left broad strip, right broad strip, overhead diffusion, back-left rim, back-right rim, low front soft bounce. All eight contribute soft subtle broad material reflections. Warm PALE CHAMPAGNE GOLD and warm platinum, restrained exposure, natural contrast. Light sources themselves completely invisible. Only diffuse illumination and soft realistic reflections in the existing metal. NO sun, NO light disc, NO visible lamp, NO starburst, NO beams, NO flare circles/polygons, NO added objects, NO text. Keep subject fixed, precise composition and detailed photographic realism. This is the actual single photo asset, not a collage or a website mockup.

### concept-clockwork-eight-lights.png

Use case: lighting-weather. Edit target: the mechanical watch movement photograph. Keep every gear, bridge, screw, ruby, hairspring, crop and camera angle unchanged; no mechanical motion. Create a final premium photorealistic website photo, full 1536x1024 resolution, retain microscopic realistic texture and depth. Relight with exactly EIGHT separate large diffused area lights outside the camera view: upper-left soft key, upper-right soft fill, left broad strip, right broad strip, overhead diffusion, back-left rim, back-right rim, low front soft bounce. All eight contribute soft subtle broad material reflections. Warm PALE CHAMPAGNE GOLD and warm platinum, restrained exposure, natural contrast. Light sources themselves completely invisible. Only diffuse illumination and soft realistic reflections in the existing metal. NO sun, NO light disc, NO visible lamp, NO starburst, NO beams, NO flare circles/polygons, NO added objects, NO text. Keep subject fixed, precise composition and detailed photographic realism. This is the actual single photo asset, not a collage or a website mockup.

### contact-gold-eight-lights.png

Use case: lighting-weather. Edit target: the solid gold Eight and Eight emblem lying on sand. Preserve the exact emblem geometry, all small gold discs, their number and positions, the sand texture, framing and camera angle. Do not change or add any part of the logo. Create a final premium photorealistic website photo, full 1536x1024 resolution, retain microscopic realistic texture and depth. Relight with exactly EIGHT separate large diffused area lights outside the camera view: upper-left soft key, upper-right soft fill, left broad strip, right broad strip, overhead diffusion, back-left rim, back-right rim, low front soft bounce. All eight contribute soft subtle broad material reflections. Warm PALE CHAMPAGNE GOLD and warm platinum, restrained exposure, natural contrast. Light sources themselves completely invisible. Only diffuse illumination and soft realistic reflections in the existing metal. NO sun, NO light disc, NO visible lamp, NO starburst, NO beams, NO flare circles/polygons, NO added objects, NO text. Keep subject fixed, precise composition and detailed photographic realism. This is the actual single photo asset, not a collage or a website mockup.
