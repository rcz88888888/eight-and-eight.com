# Eight&Eight – Geordnete Referenzen und scrollgesteuertes Fotolicht

Diese ZIP enthält 55 Dateien einschließlich dieser Anleitung und CNAME. Für GitHub Pages alle Dateien aus dem enthaltenen Ordner in das bestehende Website-Verzeichnis übernehmen; die Fotos und Materialkarten gehören dazu.

## Work / Customers & Cooperators

Alle 26 Felder richten ihr Logo ausdrücklich waagerecht und senkrecht mittig aus. Netflix ist um den überflüssigen unteren Bildbereich beschnitten, ohne den Schriftzug zu skalieren oder verlustbehaftet neu zu komprimieren. Bei Vodafone wurde nur der SVG-Sichtbereich enger gefasst; sämtliche Vektorpfade und Farben bleiben unverändert. Dadurch nimmt die sichtbare Wortmarke etwa 30 Prozent mehr Breite ein und entspricht in der Darstellung der Breite von Siemens. Die übrigen Logogrößen und die Branchenfolge bleiben erhalten.

26 Referenzen stehen nach Unternehmensarten zusammen: Fahrzeuge, Technik und Telekommunikation, Veranstaltungen und Arbeitsräume, Hotels, Film und Fernsehen, Musik und Audio sowie Lifestyle.

Alle Logos verwenden dieselbe zentrierte Darstellungsfläche von maximal 200 × 140 CSS-Pixeln. Schmale Bildschirme begrenzen deren Breite automatisch. Die Originalproportionen bleiben erhalten. Vollständig transparente Außenränder wurden verlustfrei entfernt, damit die tatsächlichen Motive statt unterschiedlich großer Dateiränder eingepasst werden. Farben, Zeichnung und alle sichtbaren Bildpixel bleiben erhalten. Das vorhandene Raster mit einer, zwei oder drei Spalten und seinen Trennlinien bleibt bestehen.

Die zehn zusätzlichen Referenzen BMW, Porsche, Microsoft, Hilton, Siemens, ZDF, Vans, Zoo York, Jägermeister und EastWest sind enthalten.

## Detailliertes Licht auf allen drei Fotos

- Uhrwerk, Schach und Goldlogo erhalten jeweils acht diffuse, außerhalb des Bildes liegende Lichtquellen mit unterschiedlichen Wegen und Gewichtungen. Ihre Richtungen folgen ausschließlich dem lokalen Scrollfortschritt. Zurückscrollen ergibt dieselbe Beleuchtung an derselben Position; im Stillstand läuft keine zusätzliche Fotoanimation.
- Vorhandene Oberflächenkarten in voller Auflösung richten die Reflexionen an den Rundungen, Kanten und Metallflächen aus. Die fotografierten Bearbeitungsspuren und feinen Strukturen beeinflussen die Reflexion zusätzlich. Hintergrund und Sand erhalten nur eine zurückhaltende diffuse Änderung. Es gibt keine sichtbaren Sonnen, Strahlen, Linsenreflexe oder Bewegungen der Motive.
- Die drei Originalfotos bleiben unverändert als native Bilder sichtbar: jeweils 1536 × 1024 Pixel, identische PNG-Dateien und vollständige Details. Das Licht liegt als transparente Soft-Light-Ebene darüber. Es ersetzt, verkleinert, komprimiert oder verwischt die Fotos nicht.
- Die detaillierten Beleuchtungsfelder sind vorab in Originalauflösung berechnet und werden nacheinander in freien Browserzeiten dekodiert. Zwischen ihnen wird kontinuierlich interpoliert. Die bestehende Animationssteuerung verändert nur die Mischgewichte sichtbarer Fotos, wenn sich ihre Scrollposition ändert. Während des Scrollens gibt es keine Berechnung einzelner Bildpixel, keine Layoutmessung, keine neuen Texturen und keine zusätzliche Animationsschleife.
- Die vorhandenen runden Fotokanten begrenzen auch die Lichtebene. Die Darstellung benötigt kein WebGL. Bei nicht geladenen Beleuchtungsfeldern oder reduzierter Bewegung bleibt das vollständige Originalbild sichtbar. Doppelte Randpixel verhindern, dass benachbarte Beleuchtungsfelder an den runden Fotoecken durchscheinen.

## Banner und Animation

Die Abdeckung für Text und Referenzlogos endet exakt am gemessenen unteren Außenrand des Banners beziehungsweise der geöffneten Navigation, einschließlich gebrochener CSS-Pixel. Beide Tapetenbanner besitzen ihre Randlinien an allen vier Seiten und schließen bündig mit den Außenkanten ab. Der untere Banner bleibt das letzte Seitenelement. Der Browserfarbton bleibt Cremeweiß #fdfcfa.

Die flüssigere Logoanimation bleibt enthalten: kontinuierliche Scrollwinkel, wiederverwendete Konturen und Ringtexturen, gemeinsamer Szenenzustand für Banner und Hauptfläche sowie eine gemeinsame Mitte unter dem oberen Banner. Sieben zusätzliche Ringbänder laufen nach innen weiter. Größen, Sichtbarkeiten, Staffelung und die bisherige Querformat-Skalierung bleiben erhalten.

Der Logoregen behält die halbierte Maximalgröße, die halbierte maximale Geschwindigkeit (mindestens zwei bis acht Sekunden pro Fall) sowie die Erhöhung der maximalen Anzahl um 10 Prozent in allen Modi.

Beim Abbruch einer laufenden Startrotation am Seitenanfang dreht der Scrollweg zuerst das Startlogo, alle acht Hauptlogos und die Ringe in ihre jeweilige Ausgangsposition. Erst nach dem vollständig aufrechten Bild bewegt sich die Seite normal weiter. Mausrad, Touch und Tastatur sowie explizite Menü-Navigation bleiben berücksichtigt. Die Schlussbeschleunigung dauert 1,8 Sekunden von 45 auf 888 rpm und endet direkt aufrecht; die späteren Stopps bleiben ebenfalls aufrecht.

## Prüfung

Lokale Dateiverweise, natürliche Bildproportionen, verlustfreie Logo-Zuschnitte und unveränderte Fotodateien werden geprüft. Die Vorschau prüft die responsiven Raster, die Bannerkante und die Lichtfelder und deren kontinuierliche Überblendung. Ein direkter Test auf einem echten iPhone mit Safari ist hier nicht verfügbar.

## Bildbearbeitung – historische Originalprompts

Diese Prompts dokumentieren die frühere Erstellung der unverändert verwendeten Fotodateien. Die zusätzliche scrollgesteuerte Foto-Beleuchtung ist inzwischen entfernt. Verwendet wurde das integrierte Bildbearbeitungswerkzeug.

### partnership-strategy-chess-eight-lights.png

Use case: lighting-weather. Edit target: the brass and silver chessboard photograph. REMOVE the visible upper-left sun/glowing hotspot, all sun rays, lens flare polygon chain, starburst sparkles and sun discs. Replace that background with a calm softly blurred warm neutral studio backdrop. Keep the exact chess-piece arrangement, foreground knight, all board geometry, framing, camera angle, materials and scratches. Create a final premium photorealistic website photo, full 1536x1024 resolution, retain microscopic realistic texture and depth. Relight with exactly EIGHT separate large diffused area lights outside the camera view: upper-left soft key, upper-right soft fill, left broad strip, right broad strip, overhead diffusion, back-left rim, back-right rim, low front soft bounce. All eight contribute soft subtle broad material reflections. Warm PALE CHAMPAGNE GOLD and warm platinum, restrained exposure, natural contrast. Light sources themselves completely invisible. Only diffuse illumination and soft realistic reflections in the existing metal. NO sun, NO light disc, NO visible lamp, NO starburst, NO beams, NO flare circles/polygons, NO added objects, NO text. Keep subject fixed, precise composition and detailed photographic realism. This is the actual single photo asset, not a collage or a website mockup.

### concept-clockwork-eight-lights.png

Use case: lighting-weather. Edit target: the mechanical watch movement photograph. Keep every gear, bridge, screw, ruby, hairspring, crop and camera angle unchanged; no mechanical motion. Create a final premium photorealistic website photo, full 1536x1024 resolution, retain microscopic realistic texture and depth. Relight with exactly EIGHT separate large diffused area lights outside the camera view: upper-left soft key, upper-right soft fill, left broad strip, right broad strip, overhead diffusion, back-left rim, back-right rim, low front soft bounce. All eight contribute soft subtle broad material reflections. Warm PALE CHAMPAGNE GOLD and warm platinum, restrained exposure, natural contrast. Light sources themselves completely invisible. Only diffuse illumination and soft realistic reflections in the existing metal. NO sun, NO light disc, NO visible lamp, NO starburst, NO beams, NO flare circles/polygons, NO added objects, NO text. Keep subject fixed, precise composition and detailed photographic realism. This is the actual single photo asset, not a collage or a website mockup.

### contact-gold-eight-lights.png

Use case: lighting-weather. Edit target: the solid gold Eight and Eight emblem lying on sand. Preserve the exact emblem geometry, all small gold discs, their number and positions, the sand texture, framing and camera angle. Do not change or add any part of the logo. Create a final premium photorealistic website photo, full 1536x1024 resolution, retain microscopic realistic texture and depth. Relight with exactly EIGHT separate large diffused area lights outside the camera view: upper-left soft key, upper-right soft fill, left broad strip, right broad strip, overhead diffusion, back-left rim, back-right rim, low front soft bounce. All eight contribute soft subtle broad material reflections. Warm PALE CHAMPAGNE GOLD and warm platinum, restrained exposure, natural contrast. Light sources themselves completely invisible. Only diffuse illumination and soft realistic reflections in the existing metal. NO sun, NO light disc, NO visible lamp, NO starburst, NO beams, NO flare circles/polygons, NO added objects, NO text. Keep subject fixed, precise composition and detailed photographic realism. This is the actual single photo asset, not a collage or a website mockup.
