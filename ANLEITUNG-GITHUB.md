## Waldfoto im Abschnitt Strategy

Das Waldfoto steht direkt nach „Common Ground — We establish the strategic foundations of brands, products and ventures.“ und vor der ersten Feldlinie des anschließenden Leistungsrasters. Es verwendet die bestehenden Fotoabstände und abgerundeten Ecken. Die Originaldatei bleibt mit 1536 × 1147 Pixeln unverändert und wird vollständig im ursprünglichen Seitenverhältnis dargestellt.

## Durchgehend gleichmäßige Timecoderinge, vollständige Logoreihen und einheitliche Schrift

Alle 30 Timecodebänder folgen von der Mitte nach außen derselben additiven Skalierung. Jeder Schritt beträgt 0,092, entsprechend dem Größenunterschied der beiden vordersten Hauptlogos. Ringbreiten und Punktdurchmesser wachsen über sämtliche Innenringe, den Übergang zur vordersten Logoebene und alle äußeren Fortsetzungen mit gleich bleibendem Zuwachs. Die bisherigen schmalen Zwischenräume bleiben exakt gleich und skalieren weiterhin gemeinsam mit der Ringgruppe. Jedes Band folgt dem Winkel seiner zugeordneten Logoebene.

Die Referenzfläche endet direkt mit der letzten Logoreihe an der abgerundeten Außenkante. Die zusätzliche Abschlusslinie, der untere Innenabstand und alle Füllzellen entfallen. Bei ungerader Logoanzahl nimmt das letzte Logo im Querformat die gesamte letzte Reihe ein.

## Bannerrand und Absatzgrößen

Die untere Linie des geöffneten Menübanners wird in allen Ausrichtungen als nativer Rahmen gezeichnet und bleibt beim Scrollen innerhalb der Navigation an deren Außenkante. Die Einleitungsabsätze unter „Eight&Eight“ und „From premise to implementation.“ verwenden dieselbe Schriftgröße wie die folgenden Absätze: 22 Referenzpixel, proportional zur gemeinsamen Layouteinheit.

## Hauptlogo-Größe nach Bildmarkierungen

Startlogo und vorderste animierte Ebene verwenden nun auch im Hochformat denselben Maßstab. Die frühere Querformat-Beschränkung dieser Angleichung entfällt. Die äußeren Startlogo-Abmessungen bleiben unverändert; alle acht animierten Ebenen werden gemeinsam daran ausgerichtet, mit unveränderten relativen Größenstufen. Die Berechnung verwendet nicht gerundete CSS-Abmessungen. Auch Tapetenmaß und Konturvorbereitung verwenden diesen gemeinsamen Faktor.

Die acht separaten SVG-Kopien der Hauptlogos sind aus der sichtbaren Seite entfernt. Eine einzige gemeinsame Liste enthält die ursprünglichen acht Ebenen in der Reihenfolge 7 bis 0 mit unveränderten Größen- und Sichtbarkeitsstufen. GPU, Canvas-Ersatzdarstellung und der begrenzte Bannerausschnitt verwenden ausschließlich diese eine Folge und dieselbe Mittelachse.

Im Hochformat sind die ursprünglichen Größen und Positionen des Startlogos und aller acht Hauptlogo-Ebenen wiederhergestellt. Nur im Querformat werden sie gegenüber dieser Ausgangsversion um 30 Prozent vergrößert. Die freie Fläche vor dem ersten Inhaltsfeld wächst passend mit: Die sichtbare Logokontur hat oben zur Bannerunterkante und unten zur Oberkante des ABOUT-Feldes denselben Abstand. Die Linie unter der ABOUT-Beschriftung dient nicht als Messpunkt. Bestehende Größenstufen, Timecode-Abstände und Tapetenmaß bleiben erhalten.

Der Logoregen läuft während der Startanimation wieder zeitgesteuert, auch wenn zuvor gescrollt wurde. Bei jedem erneuten Start wird seine vorherige Scrollbindung ohne Positionssprung gelöst. Nach der scrollgesteuerten Rückkehr der Hauptlogos wird er wie bisher wieder an die Scrollposition gebunden.

## Timecode-Punktreihen bis in die seitlichen Logoflächen

In Hochformat, Querformat und Desktop reicht dasselbe Ringmuster bis hinter die seitlichen Logoflächen. Das Hochformat erhält dafür die 16 zusätzlichen Punktreihen und den Ringmaßstab aus dem Querformat. Die Animation lädt die Datei stroboskopring-sandgold.svg direkt. Canvas und WebGL übernehmen die darin gespeicherten Punktpositionen und Punktgrößen. Das Ringmuster verwendet dieselben schmalen Zwischenräume und Größenstufen von 0,092. Die Deckkraft fällt je Vierergruppe nach innen um 8 Prozent, gleichmäßig auf die vier Punktreihen verteilt. Alle Ansichten verwenden die bisherige Deckkraft des Querformats. Alle 120 Punktreihen werden hinter sämtlichen Hauptlogos gezeichnet. GPU, Canvas-Ersatzdarstellung und Bannerausschnitt verwenden dieselbe Geometrie und sichtbare Punktphase.

## Feste Tempoabläufe für die Timecoderinge

Die erste achtsekündige Pause beginnt erst, wenn sämtliche Hauptlogo-Grafiken vorbereitet sind. Die Startsequenz kann dadurch nicht mehr während des Ladens unsichtbar über die erste langsame Phase laufen. Wiederholungen bleiben auf denselben berechneten Zyklusgrenzen verankert; verspätete Einzelbilder verschieben den nächsten Start nicht.

Die Hauptlogos und die zugeordneten Timecoderinge wechseln in acht Abschnitten zwischen 8 und 33,333333 U/min. Jede Ebene liefert ihren Ringen denselben Drehwinkel und dieselbe weiche Tempokurve von 0,8 Sekunden. Der erste Durchgang startet gemeinsam. Die folgenden Fächerzeiten betragen 0 / 0,08 / 0,16 / 0,24 / 0,32 / 0,40 / 0,48 Sekunden je Ebene. Schlussbeschleunigung und Scrollrückkehr enden aufrecht.

Die sichtbare Punktphase folgt dem virtuellen Stroboskoptakt und driftet bei beiden Tempi gegen den Uhrzeigersinn. Die Phase und ihre Geschwindigkeit gehen bei jedem Tempowechsel kontinuierlich ineinander über. Bei ausgelassenen Bildern wird der sichtbare Schritt im Schwebeabschnitt auf 40 Prozent eines Punktabstands begrenzt. Die Ausrichtung auf ganze Punktabstände erfolgt bei der Schlussbeschleunigung.

## Flüssige Übergänge und verringerte Zeichenlast

Scrollimpulse geben der Startrückkehr ein Ziel; die acht Logos laufen kontinuierlich darauf zu. Ein Menüklick übernimmt die gerade sichtbaren Winkel und Sichtbarkeiten, statt sie auf null zu setzen. Auch der Wechsel zurück zum Seitenanfang, die Bewegung der gemeinsamen Mitte und größere Scrollsprünge werden geglättet. Die acht Größenstufen, Fächerzeiten, Startgeschwindigkeiten und Punktreihen bleiben erhalten. Beim Ausblenden der Seite pausiert die gemeinsame Animationsuhr und setzt dieselbe Phase fort.

Auf Geräten mit WebGL wird auch der flache Bannerausschnitt über GPU-Punktpuffer und dieselben Logoebenen gezeichnet. Dort entfallen die parallel gezeichneten CPU-Logos und die großen vorberechneten Ringbilder vollständig. Ringgruppen außerhalb des sichtbaren Ausschnitts werden übersprungen. Ohne WebGL werden die 120 Punktreihen als wiederverwendete Vektorpfade gezeichnet. Diese entsprechen Punkt für Punkt den GPU-Puffern; nur sichtbare Reihen werden gefüllt. Große transparente Ringbilder und deren laufende Überblendung entfallen auch in dieser Ersatzdarstellung. Originalfotos und ihre scrollabhängigen Lichteffekte bleiben unverändert. Eine feste Bildrate auf jedem Endgerät kann ohne Messung auf dem jeweiligen Gerät nicht zugesichert werden.

## Optimierte Animationen

Hauptlogo-Konturen werden einmal in der benötigten Darstellungsauflösung vorbereitet und anschließend als Grafiken wiederverwendet. Die GPU zeichnet alle 21.540 Timecode-Punkte aus kleinen, dauerhaft wiederverwendeten Geometriepuffern und übernimmt auch die acht Hauptlogos. Bei fehlendem WebGL oder Kontextverlust greift automatisch die vorberechnete Canvas-Darstellung. Dort werden gemeinsam rotierende Punktreihen aus vorbereiteten Vektorpfaden gezeichnet und vor dem Zeichnen auf Sichtbarkeit geprüft. Unbenutzte Ringtexturen entfallen. Die statischen goldenen Feldlinien verwenden native Rahmen statt zusätzlicher Maskenflächen. Textmasken entstehen nur in Bildschirmnähe und in freien Browserzeiten; entfernte Textfilter werden ausgeblendet. Foto-Beleuchtungskarten werden vor Erreichen des Fotos vorbereitet. Die Originalfotos, Beleuchtungskarten und ihre Scrolleffekte bleiben erhalten.

Während des normalen Scrollens sind keine blockierenden Touch- oder Mausrad-Listener aktiv. Sie werden nur für die bestehende Startrückkehr vorübergehend eingeschaltet. Bewegungskurven, acht Logoebenen, 120 Timecode-Punktreihen, gleichmäßige Sichtbarkeitsschritte und scrollgebundener Regen bleiben erhalten.

Trebuchet MS steht nun für sämtliche Ansichten an erster Stelle. Die bisherigen geräteabhängigen Rundschrift-Alternativen entfallen; die vorhandenen Schriftgrößen und Schriftschnitte bleiben erhalten.

## Scrollabhängiger Logoregen

Nach der scrollgesteuerten Rückkehr aller Hauptlogos in die Ausgangsposition wird der Logoregen an die Scrollposition gekoppelt. Ohne weiteres Scrollen bleibt er stehen; Zurückscrollen stellt dieselben Regenpositionen wieder her. Bei regulärem Start ohne Unterbrechung erfolgt die Kopplung beim ersten Verlassen des Seitenanfangs. Bis dahin läuft der Regen wie bisher zeitgesteuert. Die maximale Geschwindigkeit ist nochmals halbiert (4 statt 2 Sekunden Mindestdurchlauf); im Scrollmodus entspricht ein solcher Durchlauf vier sichtbaren Bildschirmhöhen.

Alle Ausrichtungen verwenden 282 Regenlogos wie die bisherige Ansicht bei 1600 × 900. Relative Positionen bleiben bei Größenwechseln erhalten. Navigation und Referenzlogos sind in ihren Flächen zentriert. Die Referenzfläche endet direkt nach der letzten vollständigen Logoreihe. Alle 26 Referenzen und die Originalfotos bleiben erhalten.

# Eight&Eight – Geordnete Referenzen und scrollgesteuertes Fotolicht

Diese ZIP enthält 59 Dateien einschließlich dieser Anleitung, CNAME und gpu-frames-v1.js. Für GitHub Pages alle Dateien aus dem enthaltenen Ordner in das bestehende Website-Verzeichnis übernehmen; die Fotos und Materialkarten gehören dazu.

## Einheitliche Proportionen auf allen Auflösungen

Das mobile Querformat mit 896 × 414 CSS-Pixeln dient als Querformat-Referenz, einschließlich Desktop und Tablet. Im Hochformat wird die bestehende mobile Gestaltung mit 393 × 852 CSS-Pixeln proportional weitergeführt. Ein gemeinsamer Skalierungsfaktor passt jeweils die Referenz in die verfügbare Breite und Höhe ein. Unterschiedliche Seitenverhältnisse können zusätzliche freie Fläche zeigen, ohne Logos oder Fotos zu verzerren.

Bannerhöhe und Wortmarke, Startlogo und Hauptlogos, Timecoderinge, Tapetenmaß, Schriftgrößen, Felder, Innenabstände, Fotokanten und unterer Banner folgen derselben Einheit. Die tatsächliche sichtbare Browserfläche bestimmt weiterhin die gemeinsame Scrollmitte unter dem oberen Banner. Die Toolbar-Sperre auf mobilen Geräten bleibt erhalten; Änderungen der Browserleisten lassen die Größen nicht springen.

Auch oberhalb von 900 Pixeln bleibt die Menüanordnung des mobilen Querformats bestehen: mittige Bannerwortmarke und Hamburger mit ausklappbarer Navigation. Referenzen stehen im Querformat in zwei Spalten, im Hochformat in einer Spalte. Die unveränderten individuellen Logoanpassungen skalieren mit. Es gibt keine feste Desktop-Obergrenze für Logo oder Inhaltsbreite und keinen Dreispalten-Sprung mehr.

Die Umsetzung verwendet native CSS-Abmessungen, keine vergrößerte Screenshotfläche, kein CSS-Zoom und keinen transformierten Scrollcontainer. Alle Bilddateien einschließlich der drei 1536 × 1024-Pixel-Fotos und ihrer Lichtkarten bleiben unverändert. Startsequenz, zeitliche Ringstaffelung, Tempowechsel und Scrollrückkehr bleiben erhalten. Das einmalige Einrücken der Texte berücksichtigt Größenwechsel, ohne erneut abgespielt zu werden.

Geprüft in Chrome bei 896 × 414, 1363 × 936, 1920 × 1080, 1024 × 768, 2560 × 1080, 393 × 852 und 768 × 1024; zusätzlich mathematische Layoutprüfungen für 720 Formate. Ein nativer iPhone/Safari-Test ist hier nicht verfügbar.

## Einmaliges Einrücken und Ringabstände

Inhaltstexte rücken beim ersten Herunterscrollen um bis zu 32 CSS-Pixel von unten an ihre unveränderte Endposition. Der Weg folgt dem Scrollfortschritt. Beim Zurückscrollen wird er nicht zurückgespult; erreichte Endpositionen bleiben dauerhaft erhalten, auch bei Größenwechseln. Rahmen und Bilder werden dabei nicht verschoben. Reduzierte Bewegung zeigt sofort die Endposition.

Alle Timecodebänder erhalten denselben positiven radialen Zwischenraum. Als Maß dient der kleine radiale Kantenabstand zwischen benachbarten Punktreihen im unveränderten Timecode-Muster, wie einzeln gelb im Screenshot markiert. Die drei vorhandenen radialen Abstände betragen 2,30 / 1,80 / 2,00 SVG-Einheiten; ihr Mittelwert 2,0333 wird am vordersten Ring skaliert. Der vorher verwendete größere Abstand entlang einer Punktreihe wird dadurch ersetzt. Dieser gemeinsame Abstand skaliert mit der gesamten Ringgruppe auch im Querformat. Die sieben inneren Bänder setzen dieselbe additive Größenfolge nach innen fort und behalten ihre zugehörigen Sichtbarkeiten.

## Aktuelle Größenkorrektur der Referenzen

Ausgehend von der vorherigen Fassung sind Porsche, Microsoft und Vodafone proportional um 8 Prozent verkleinert; Holiday Inn, Best Western, Design Offices und Cupra sind proportional um 8 Prozent vergrößert. Die Anpassung erfolgt um die jeweilige Bildmitte, sodass Raster und Zentrierung erhalten bleiben. Vodafone hat damit gegenüber der früheren Standardgröße den Faktor 1,20 × 0,92 = 1,104.

## Sky-Referenz

Das gelieferte Skylogo ersetzt Jägermeister an dessen bisheriger Position. Die transparente Originaldatei bleibt bytegenau unverändert und wird proportional in der vorhandenen zentrierten Logofläche dargestellt.

## Work / Customers & Cooperators

Alle 26 Felder richten ihr Logo ausdrücklich waagerecht und senkrecht mittig aus. Netflix ist um den überflüssigen unteren Bildbereich beschnitten, ohne den Schriftzug zu skalieren oder verlustbehaftet neu zu komprimieren. Bei Vodafone wurde nur der SVG-Sichtbereich enger gefasst; sämtliche Vektorpfade und Farben bleiben unverändert. Dadurch nimmt die sichtbare Wortmarke etwa 30 Prozent mehr Breite ein und entspricht in der Darstellung der Breite von Siemens. Zusätzlich ist Vodafone auf Wunsch um weitere 20 Prozent vergrößert: maximal 240 × 168 statt 200 × 140 CSS-Pixel, weiterhin mittig und proportional. Die übrigen Logogrößen und die Branchenfolge bleiben erhalten.

Die Referenzliste beginnt mit AVE Audio Visual Equipment, Neumann&Müller und NEO eventservice. Danach folgt die bisherige Reihenfolge der übrigen 23 Referenzen.

Alle Logos verwenden dieselbe zentrierte Darstellungsfläche von maximal 200 × 140 Referenz-CSS-Pixeln, multipliziert mit dem gemeinsamen Layoutfaktor. Schmale Bildschirme begrenzen deren Breite automatisch. Die Originalproportionen bleiben erhalten. Vollständig transparente Außenränder wurden verlustfrei entfernt, damit die tatsächlichen Motive statt unterschiedlich großer Dateiränder eingepasst werden. Farben, Zeichnung und alle sichtbaren Bildpixel bleiben erhalten. Das vorhandene Raster mit einer, zwei oder drei Spalten und seinen Trennlinien bleibt bestehen.

Die zehn zusätzlichen Referenzen BMW, Porsche, Microsoft, Hilton, Siemens, ZDF, Vans, Zoo York, Sky und EastWest sind enthalten.

## Detailliertes Licht auf allen drei Fotos

- Uhrwerk, Schach und Goldlogo erhalten jeweils acht diffuse, außerhalb des Bildes liegende Lichtquellen mit unterschiedlichen Wegen und Gewichtungen. Ihre Richtungen folgen ausschließlich dem lokalen Scrollfortschritt. Zurückscrollen ergibt dieselbe Beleuchtung an derselben Position; im Stillstand läuft keine zusätzliche Fotoanimation.
- Vorhandene Oberflächenkarten in voller Auflösung richten die Reflexionen an den Rundungen, Kanten und Metallflächen aus. Die fotografierten Bearbeitungsspuren und feinen Strukturen beeinflussen die Reflexion zusätzlich. Hintergrund und Sand erhalten nur eine zurückhaltende diffuse Änderung. Es gibt keine sichtbaren Sonnen, Strahlen, Linsenreflexe oder Bewegungen der Motive.
- Die drei Originalfotos bleiben unverändert als native Bilder sichtbar: jeweils 1536 × 1024 Pixel, identische PNG-Dateien und vollständige Details. Das Licht liegt als transparente Soft-Light-Ebene darüber. Es ersetzt, verkleinert, komprimiert oder verwischt die Fotos nicht.
- Die detaillierten Beleuchtungsfelder sind vorab in Originalauflösung berechnet und werden nacheinander in freien Browserzeiten dekodiert. Zwischen ihnen wird kontinuierlich interpoliert. Die bestehende Animationssteuerung verändert nur die Mischgewichte sichtbarer Fotos, wenn sich ihre Scrollposition ändert. Während des Scrollens gibt es keine Berechnung einzelner Bildpixel, keine Layoutmessung, keine neuen Texturen und keine zusätzliche Animationsschleife.
- Die vorhandenen runden Fotokanten begrenzen auch die Lichtebene. Die Darstellung benötigt kein WebGL. Bei nicht geladenen Beleuchtungsfeldern oder reduzierter Bewegung bleibt das vollständige Originalbild sichtbar. Doppelte Randpixel verhindern, dass benachbarte Beleuchtungsfelder an den runden Fotoecken durchscheinen.

## Aktuelle Startsequenz: acht abwechselnde Tempodurchgänge

Die Hauptlogos verwenden in den acht Durchgängen abwechselnd 8,8888888 rpm (1, 3, 5, 7) und 33,333333 rpm (2, 4, 6, 8). Die Timecoderinge verwenden in den langsamen Phasen exakt 8 rpm. Ein virtueller Stroboskop-Takt von 26 Schritten pro Sekunde lässt die Punktreihen dabei gleichmäßig gegen den Uhrzeigersinn driften. Bei 33,333333 rpm gleicht ein eigener Takt pro Punktreihe das höhere Tempo aus und verstärkt die sichtbare Rückwärtsdrift um zwei Punktabstände pro Sekunde. Jeder Durchgang hat einen Grundtakt von acht Sekunden. Jeder Tempoübergang dauert 0,8 Sekunden, einschließlich des anfänglichen Anlaufens.

Die Hauptlogos starten im ersten Durchgang wie das Startlogo synchron. Die Ringe behalten dort ihren Versatz von 0,18 Sekunden pro Ebene. Ab dem zweiten Durchgang verwenden beide dieselben Fächerzeiten je Ebene, von 0 Sekunden im zweiten Durchgang bis 0,48 Sekunden im achten. In allen schnellen Phasen drehen Logos und Ringe nach dem Übergang mit exakt 33,333333 rpm.

Nur am Ende des achten Durchgangs erfolgt die schnelle Schlussbeschleunigung: in 1,8 Sekunden von 33,333333 auf 888 rpm, danach direkt aufrechter Stopp. Die gemeinsame achtsekündige Pause beginnt, wenn auch die letzte verzögerte Ebene aufrecht steht. Danach wiederholt sich die Sequenz. Die Scrollstaffelung und die Ringgeometrie bleiben unverändert.

## Weiterwachsende äußere Timecoderinge

Die sieben zusätzlichen Außenbänder setzen denselben additiven Skalenschritt von 0,092 fort, der bereits für alle innen liegenden Bänder gilt. Ringbreiten und Punktdurchmesser wachsen stetig nach außen. Die schmalen Zwischenräume bleiben gleich. Die Ergänzungen übernehmen die Phase des bisher äußersten Rings und führen die bisherige Sichtbarkeitsabstufung fort.

Für zusätzliche Ringe, die vollständig jenseits aller sichtbaren Ecken liegen, werden keine großen Leinwandtexturen angelegt. Zusätzliche Berechnungen oder Zeitgeber während des Scrollens entstehen nicht.

## Zuordnung der Timecoderinge zu den Hauptlogos

Alle Bänder behalten ihre Zuordnung zu den acht Hauptlogo-Ebenen. Die Bänder verwenden die jeweilige Scrollrotation und wechseln bei der Startanimation gemeinsam mit ihrer Logoebene das Tempo. Die inneren und äußeren Erweiterungen folgen der hintersten Ebene. Die Bänder liegen hinter dem gesamten Logostapel.

## Exakte gemeinsame Mitte und gestaffelte Timecode-Phase

Die Hauptlogos und alle Ringbänder verwenden in jedem Bild exakt denselben Drehpunkt. Nach dem anfänglichen Tapetenübergang liegt er unmittelbar in der Mitte des sichtbaren Bereichs zwischen Bannerunterkante und sichtbarem unteren Viewportrand, ohne nachlaufende Mittelpunktglättung. Die Startgrafik behält ihren zentrierten, unveränderten SVG-Drehpunkt.

Die Fächerstaffelung verwendet für die Logo-Ebene und ihre Timecoderinge dieselben Wechselzeitpunkte. Beim Scrollen folgen die Ringe direkt den zeitversetzten Winkeln ihrer Logo-Ebene. Der Scrollfächer beginnt mit 80 Millisekunden Abstand je Ebene und wird zum Ende zurückgeführt.

## Banner und Animation

Die Abdeckung für Text und Referenzlogos endet exakt am gemessenen unteren Außenrand des Banners beziehungsweise der geöffneten Navigation. Beide Tapetenbanner besitzen waagerechte Randlinien oben und unten. Die Bannerränder und Feldlinien verwenden in allen Ansichten die Strichstärke des Hochformats von 1,5 CSS-Pixeln. Das Tapetenmuster schließt direkt an die Randlinien an.

Die flüssigere Logoanimation bleibt enthalten: kontinuierliche Scrollwinkel, wiederverwendete Konturen und Ringtexturen, gemeinsamer Szenenzustand für Banner und Hauptfläche sowie eine gemeinsame Mitte unter dem oberen Banner. Ringgrößen, Zwischenräume und Deckkraft entsprechen in jeder Ansicht dem bisherigen Querformat.

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
