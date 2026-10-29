# Eight&Eight – Geordnete Referenzen und scrollgesteuertes Fotolicht

Diese ZIP enthält 56 Dateien einschließlich dieser Anleitung und CNAME. Für GitHub Pages alle Dateien aus dem enthaltenen Ordner in das bestehende Website-Verzeichnis übernehmen; die Fotos und Materialkarten gehören dazu.

## Einmaliges Einrücken und Ringabstände

Inhaltstexte rücken beim ersten Herunterscrollen um bis zu 32 CSS-Pixel von unten an ihre unveränderte Endposition. Der Weg folgt dem Scrollfortschritt. Beim Zurückscrollen wird er nicht zurückgespult; erreichte Endpositionen bleiben dauerhaft erhalten, auch bei Größenwechseln. Rahmen und Bilder werden dabei nicht verschoben. Reduzierte Bewegung zeigt sofort die Endposition.

Alle 15 Timecodebänder erhalten denselben positiven radialen Zwischenraum. Als Maß dient der kleine radiale Kantenabstand zwischen benachbarten Punktreihen im unveränderten Timecode-Muster, wie einzeln gelb im Screenshot markiert. Die drei vorhandenen radialen Abstände betragen 2,30 / 1,80 / 2,00 SVG-Einheiten; ihr Mittelwert 2,0333 wird am vordersten Ring skaliert. Der vorher verwendete größere Abstand entlang einer Punktreihe wird dadurch ersetzt. Dieser gemeinsame Abstand skaliert mit der gesamten Ringgruppe auch im Querformat. Die sieben inneren Bänder behalten ihre invertierte Größenfolge und zugehörigen Sichtbarkeiten.

## Aktuelle Größenkorrektur der Referenzen

Ausgehend von der vorherigen Fassung sind Porsche, Microsoft und Vodafone proportional um 8 Prozent verkleinert; Holiday Inn, Best Western, Design Offices und Cupra sind proportional um 8 Prozent vergrößert. Die Anpassung erfolgt um die jeweilige Bildmitte, sodass Raster und Zentrierung erhalten bleiben. Vodafone hat damit gegenüber der früheren Standardgröße den Faktor 1,20 × 0,92 = 1,104.

## Sky-Referenz

Das gelieferte Skylogo ersetzt Jägermeister an dessen bisheriger Position. Die transparente Originaldatei bleibt bytegenau unverändert und wird proportional in der vorhandenen zentrierten Logofläche dargestellt.

## Work / Customers & Cooperators

Alle 26 Felder richten ihr Logo ausdrücklich waagerecht und senkrecht mittig aus. Netflix ist um den überflüssigen unteren Bildbereich beschnitten, ohne den Schriftzug zu skalieren oder verlustbehaftet neu zu komprimieren. Bei Vodafone wurde nur der SVG-Sichtbereich enger gefasst; sämtliche Vektorpfade und Farben bleiben unverändert. Dadurch nimmt die sichtbare Wortmarke etwa 30 Prozent mehr Breite ein und entspricht in der Darstellung der Breite von Siemens. Zusätzlich ist Vodafone auf Wunsch um weitere 20 Prozent vergrößert: maximal 240 × 168 statt 200 × 140 CSS-Pixel, weiterhin mittig und proportional. Die übrigen Logogrößen und die Branchenfolge bleiben erhalten.

Die Referenzliste beginnt mit AVE Audio Visual Equipment, Neumann&Müller und NEO eventservice. Danach folgt die bisherige Reihenfolge der übrigen 23 Referenzen.

Alle Logos verwenden dieselbe zentrierte Darstellungsfläche von maximal 200 × 140 CSS-Pixeln. Schmale Bildschirme begrenzen deren Breite automatisch. Die Originalproportionen bleiben erhalten. Vollständig transparente Außenränder wurden verlustfrei entfernt, damit die tatsächlichen Motive statt unterschiedlich großer Dateiränder eingepasst werden. Farben, Zeichnung und alle sichtbaren Bildpixel bleiben erhalten. Das vorhandene Raster mit einer, zwei oder drei Spalten und seinen Trennlinien bleibt bestehen.

Die zehn zusätzlichen Referenzen BMW, Porsche, Microsoft, Hilton, Siemens, ZDF, Vans, Zoo York, Sky und EastWest sind enthalten.

## Detailliertes Licht auf allen drei Fotos

- Uhrwerk, Schach und Goldlogo erhalten jeweils acht diffuse, außerhalb des Bildes liegende Lichtquellen mit unterschiedlichen Wegen und Gewichtungen. Ihre Richtungen folgen ausschließlich dem lokalen Scrollfortschritt. Zurückscrollen ergibt dieselbe Beleuchtung an derselben Position; im Stillstand läuft keine zusätzliche Fotoanimation.
- Vorhandene Oberflächenkarten in voller Auflösung richten die Reflexionen an den Rundungen, Kanten und Metallflächen aus. Die fotografierten Bearbeitungsspuren und feinen Strukturen beeinflussen die Reflexion zusätzlich. Hintergrund und Sand erhalten nur eine zurückhaltende diffuse Änderung. Es gibt keine sichtbaren Sonnen, Strahlen, Linsenreflexe oder Bewegungen der Motive.
- Die drei Originalfotos bleiben unverändert als native Bilder sichtbar: jeweils 1536 × 1024 Pixel, identische PNG-Dateien und vollständige Details. Das Licht liegt als transparente Soft-Light-Ebene darüber. Es ersetzt, verkleinert, komprimiert oder verwischt die Fotos nicht.
- Die detaillierten Beleuchtungsfelder sind vorab in Originalauflösung berechnet und werden nacheinander in freien Browserzeiten dekodiert. Zwischen ihnen wird kontinuierlich interpoliert. Die bestehende Animationssteuerung verändert nur die Mischgewichte sichtbarer Fotos, wenn sich ihre Scrollposition ändert. Während des Scrollens gibt es keine Berechnung einzelner Bildpixel, keine Layoutmessung, keine neuen Texturen und keine zusätzliche Animationsschleife.
- Die vorhandenen runden Fotokanten begrenzen auch die Lichtebene. Die Darstellung benötigt kein WebGL. Bei nicht geladenen Beleuchtungsfeldern oder reduzierter Bewegung bleibt das vollständige Originalbild sichtbar. Doppelte Randpixel verhindern, dass benachbarte Beleuchtungsfelder an den runden Fotoecken durchscheinen.

## Aktuelle Startsequenz: acht abwechselnde Tempodurchgänge

Die acht Durchgänge verwenden abwechselnd 8,8888888 rpm (1, 3, 5, 7) und 33,333333 rpm (2, 4, 6, 8). Die Dauer je Tempoabschnitt beträgt wie bei den bisherigen Tempophasen acht Sekunden. Jeder Tempoübergang dauert 0,8 Sekunden, einschließlich des anfänglichen Anlaufens. Es gibt keine 45-rpm-Stufe und keine Zwischenstopps zwischen diesen acht Tempoabschnitten.

Die Hauptlogos starten im ersten Durchgang wie das Startlogo synchron ohne Fächer. Die Ringe behalten dort ihren bisherigen Versatz von 0,18 Sekunden pro Ebene. Ab dem zweiten Durchgang bleibt die bisherige Folge erhalten: im zweiten 0, im dritten 0,08, im vierten 0,16, im fünften 0,24, im sechsten 0,32, im siebten 0,40 und im achten 0,48 Sekunden. Beim Wechsel werden die Fächerzeiten während des 0,8-Sekunden-Übergangs verbunden, sodass die Winkel nicht springen oder rückwärtslaufen. In der zweiten Tempophase drehen nach diesem Übergang alle Logos und Ringe exakt gemeinsam. Die Ringe behalten ihre bisherigen Phasen, auch während des ersten nun synchronen Hauptlogo-Durchgangs.

Nur am Ende des achten Durchgangs erfolgt die schnelle Schlussbeschleunigung: in 1,8 Sekunden von 33,333333 auf 888 rpm, danach direkt aufrechter Stopp. Die gemeinsame achtsekündige Pause beginnt, wenn auch die letzte verzögerte Ebene aufrecht steht. Danach wiederholt sich die Sequenz. Die Scrollstaffelung und die Ringgeometrie bleiben unverändert.

## Wiederherstellung der ursprünglichen Ringstaffelung

Die Radien und Ebenenzuordnungen aller 15 Ringbänder werden wieder aus der Fassung vor der Änderung vom 29. Oktober abgeleitet. Die ursprünglich angepassten drei innersten Außenringe und die sieben invertierten Innenringe behalten exakt ihre ursprünglichen Mittenradien. Die schmalen Zwischenräume entstehen ausschließlich durch passende Bandbreiten, ohne die ursprüngliche Größenstaffelung radial zu verschieben. Jeder Ring übernimmt Winkel und Sichtbarkeit seiner ursprünglichen Logoebene. Der Scrollfächer folgt den ursprünglichen Zeitkurven; die Startstaffelung ist durchgangsweise wie oben beschrieben angepasst.

## Exakte gemeinsame Mitte und gestaffelte Timecode-Phase

Die Hauptlogos und alle Ringbänder verwenden in jedem Bild exakt denselben Drehpunkt. Nach dem anfänglichen Tapetenübergang liegt er unmittelbar in der Mitte des sichtbaren Bereichs zwischen Bannerunterkante und sichtbarem unteren Viewportrand, ohne nachlaufende Mittelpunktglättung. Die Startgrafik behält ihren zentrierten, unveränderten SVG-Drehpunkt.

Die zeitliche Fächerstaffelung ist wiederhergestellt: Im ersten Durchgang laufen Startlogo und Hauptlogos gemeinsam; nur die Ringe behalten ihre 0,18 Sekunden Abstand je Ebene. Die sieben späteren Durchgänge verwenden die oben aufgeführten Versätze. Jede Ebene durchläuft dieselbe analytisch berechnete Tempokurve zu ihrem versetzten Zeitpunkt. Ab dem zweiten Durchgang dreht jeder äußere und innere Timecodering wieder exakt mit seiner zugehörigen Logoebene, sodass der Fächer auch beim Scrollen wieder sichtbar bleibt. Die bestehende Scrollstaffelung mit 80 Millisekunden Abstand je Ebene und ihrer späteren Rückführung bleibt erhalten. Aufrechte Stopps und scrollgesteuerte Startrückkehr bleiben erhalten.

## Banner und Animation

Die Abdeckung für Text und Referenzlogos endet exakt am gemessenen unteren Außenrand des Banners beziehungsweise der geöffneten Navigation, einschließlich gebrochener CSS-Pixel. Beide Tapetenbanner besitzen ihre Randlinien an allen vier Seiten und schließen bündig mit den Außenkanten ab. Der untere Banner bleibt das letzte Seitenelement. Der Browserfarbton bleibt Cremeweiß #fdfcfa.

Die flüssigere Logoanimation bleibt enthalten: kontinuierliche Scrollwinkel, wiederverwendete Konturen und Ringtexturen, gemeinsamer Szenenzustand für Banner und Hauptfläche sowie eine gemeinsame Mitte unter dem oberen Banner. Sieben zusätzliche Ringbänder laufen nach innen weiter. Größen, Sichtbarkeiten, Staffelung und die bisherige Querformat-Skalierung bleiben erhalten.

Der Logoregen behält die halbierte Maximalgröße, die halbierte maximale Geschwindigkeit (mindestens zwei bis acht Sekunden pro Fall) sowie die Erhöhung der maximalen Anzahl um 10 Prozent in allen Modi.

Beim Abbruch einer laufenden Startrotation am Seitenanfang dreht der Scrollweg zuerst das Startlogo, alle acht Hauptlogos und die Ringe in ihre jeweilige Ausgangsposition. Erst nach dem vollständig aufrechten Bild bewegt sich die Seite normal weiter. Mausrad, Touch und Tastatur sowie explizite Menü-Navigation bleiben berücksichtigt. Die Schlussbeschleunigung am Ende des achten Durchgangs dauert 1,8 Sekunden von 33,333333 auf 888 rpm und endet direkt aufrecht.

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
