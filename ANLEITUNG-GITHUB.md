# Eight and Eight – Website v218

Diese ZIP enthält 45 Dateien einschließlich dieser Anleitung und CNAME.

## Website hochladen

1. ZIP entpacken.
2. Den Inhalt von eight-and-eight.com-main in die Hauptebene des bestehenden
   Website-Repositorys hochladen. index.html muss direkt neben CNAME liegen.
3. Vorhandene Dateien ersetzen und die Änderung committen.

Die ZIP selbst wird von GitHub Pages nicht automatisch entpackt. Alte Dateien
werden durch das Hochladen neuer Dateien nicht automatisch gelöscht.

## Springerzug bis 3/4 des Scrollwegs (v218)

Der Springer steht spätestens bei 75 % des Vorbeiscrollens in der Mitte des
Zielfelds. Dafür wird die Zeitzuordnung des Schachvideos über eine glatte,
monotone Kurve angepasst: Bei 75 % wird Frame 161 erreicht, der die Landung
zeigt. Bis zum Scrollende läuft die Sequenz weiter bis Frame 191. In diesem
letzten Viertel bleibt der Springer auf seinem Zielfeld und das Licht wandert
weiter. Es gibt keinen Sprung der Zeitkurve am 75-%-Punkt.

Die hochauflösenden Video- und Bilddateien aus v217 werden direkt verwendet.
Uhrwerk und Goldlogo behalten ihre lineare Scroll-Zeitzuordnung. Geprüft:
Landungsframe bei 75 %, monotone Zeitkurve, vollständiger Framebereich,
Rückwärtslauf und dieselbe Zuordnung in Hoch- und Querformat.

## Fotoqualität und Lichteffekte

Alle drei Fotosequenzen wurden aus den vorhandenen Originalquellen neu in
1536 × 1024 Pixeln gerendert. Es gibt keine Verkleinerung auf 1152 × 768 mehr.
Die Poster sind verlustfreie PNGs. Die H.264-Filme verwenden CRF 8, 48 fps und
192 Frames statt zuvor 96. Ein Schlüsselbild alle acht Frames hält die
Suchstrecke kurz. BT.709-Farbraum und Pegel werden explizit konvertiert und
gekennzeichnet. Die Videos sind weiterhin videokomprimiert; die PNG-Poster
sind pixelgleich mit dem ersten unkomprimierten Renderbild.

Die Lichtberechnung moduliert die fotografische Oberfläche relativ zur
ursprünglichen Beleuchtung. Körnung, Schliffspuren, Gravuren, Eigenfarben und
vorhandene Mikroreflexionen bleiben damit erhalten. Die bisherige zusätzliche
Entsättigung und die deckende Addition heller Reflexionsflächen entfallen.
Eine weiche Schulter betrifft nur die hellsten Spitzlichter. Die frühere
Helligkeitserhöhung um 8 % bleibt erhalten.

Alle Filme verwenden denselben Verlauf einer außerhalb des Ausschnitts
wandernden Sonne über 18 Positionen mit kontinuierlichen Zwischenwerten.
Die Kamera steht fest. Das Uhrwerk bewegt nur seine Mechanik, mit dem um
75 % reduzierten Drehweg aus v215. Die Unruh schwingt weiterhin kleiner und
seltener. Der Springer durchläuft Start, beide Zwischenfelder und Ziel in
der jeweiligen Feldmitte; Standfläche, Schatten und Perspektive sind gekoppelt.
Das Goldlogo liegt fest im Sand. Die Fotosequenzen wurden aus Fotoebenen und
Oberflächeninformationen gerendert, nicht mit einem generativen Videomodell.

Die Scrollposition steuert direkt den Videoframe. Anhalten hält das Bild an;
Rückwärtsscrollen spult zurück. Die Dateidauer von vier Sekunden ist keine
unabhängige Abspieluhr. Bei reduzierter Bewegung oder einem Ladefehler bleibt
das hochauflösende PNG-Poster sichtbar. Das Schachvideo bleibt im selben
Partnership-Strategy-Feld direkt unter „ecosystems“.

## Einheitliches Anrücken aller Textzeilen

Die frühere Zusatzstreckung ganzer Textblöcke ist entfernt. Stattdessen wird
jede tatsächlich umbrochene Textzeile verschoben. Die vorhandenen Schriftformen,
Schriftgrößen, statischen Grundtransformationen, Zeilenhöhen und Feldhöhen
bleiben erhalten. Links und ihre Ereignisbehandlung werden nicht kopiert.

Eine einzige, von der Bildschirmposition abhängige Kurve gilt für alle Zeilen.
Am unteren Viewportrand beträgt die zusätzliche lokale Zeilenspreizung 8 %;
sie nimmt beim Herunterscrollen stetig ab und ist in der Mitte des gesamten
Viewports null. Dort und darüber entspricht der Abstand wieder dem Ausgangswert.
Inline-Fragmente derselben Zeile bewegen sich gemeinsam. Die Textfarbe bleibt
vollständig deckend. Die äußere Hintergrundunschärfe folgt den Zeilen, ohne
den Buchstabeninnenraum zu verwischen oder einen weißen Rand zu malen.

Zeilen werden nur bei Layout- oder Schriftänderungen neu ermittelt. Während
des Scrollens werden ausschließlich Transformationswerte gesetzt; es gibt
keine zeichenweisen Layoutmessungen und keinen Neuaufbau des Textes pro Frame.
Die native Zeilenaufteilung wird nach Breitenänderungen neu aufgenommen.

## Querformat aus v216

Startlogo, alle Hauptlogos und Timecoderinge bleiben im Querformat um 50 %
vergrößert. Die beidseitigen Abstände des vordersten Logos betragen weiterhin
1/20 seiner sichtbaren Höhe. Der Endbanner bleibt das letzte Element im
Seitenfluss. Die Korrektur der iOS-Seitenhöhe, die feste Größenreferenz bei
bewegten Browserleisten und die an die Displayframes angepasste Regenbewegung
bleiben erhalten.

## Prüfung

Geprüft werden die Medienauflösung, 192 Frames pro Clip, Vollständigkeit der
Dekodierung, Schlüsselbildabstände, Farbraum, Video-Suchverhalten, Poster,
vier Feldmitten des Springerwegs, Lichtvariation bei stillstehenden Motiven,
Textinhalt und Linkidentität, dieselbe Zeilenkurve bei allen Textfragmenten,
stetiges Anrücken bis zur Viewportmitte, Neuumbruch bei Breitenänderungen,
reduzierte Bewegung, Dateiverweise und ZIP-Integrität. Die DOM- und Scrolltests
verwenden simulierte Browserwerte. Ein visueller Browsertest und ein Test auf
einem echten iPhone konnten hier nicht durchgeführt werden.

## Feste Gestaltungsregeln

- Regen-Hintergrundlogos verwenden in jedem Modus die Größenreferenz des
  Querformats. Dafür werden die längere und kürzere Viewportseite wie im
  Querformat ausgewertet. Beim Wechsel zwischen Hoch- und Querformat
  derselben Viewportabmessungen bleibt der Größenbereich identisch.
  Die Referenz nutzt stabile kleine Viewporteinheiten, damit mobile
  Browserleisten die Regengröße beim Scrollen nicht verändern.
- Diese Regengrößen sind unabhängig von der Größe der Haupt-/Startlogos.
  Zufällige Größenverteilung, Sichtbarkeit, Fallgeschwindigkeit und die
  bisherige unterschiedliche Regenmenge je Ausrichtung bleiben erhalten.

- Die Tapetenkachel ist überall 220 CSS-Pixel breit und hoch, entsprechend
  dem bisherigen Smartphone-Hochformat. Diese Größe gilt unabhängig von
  Gerät, Bildschirmbreite, Ausrichtung und Größe der jeweiligen Logoebene.
- Startlogo, alle acht Hauptlogoebenen, oberer und unterer Banner sowie
  die erweiterte Menüfläche verwenden dieselbe Mustergröße.
- Die zentrale CSS-Variable --wallpaper-tile-size definiert diesen Wert.
  SVG- und Canvas-Logos gleichen ihre jeweilige Zeichenskalierung aus,
  damit das Muster beim Vergrößern einer Logoebene nicht mitwächst.

## Enthaltene Änderungen

- Die Browser-Farbvorgabe, der HTML-/Body-Hintergrund und die eigentliche
  Seitenfläche verwenden dasselbe Cremeweiß (#fdfcfa). Die Theme-Farbvorgabe
  wird bei Layoutmessungen direkt mit --page-cream synchronisiert.
  Die endgültige Darstellung der nativen Browserleisten steuert der Browser.
- Vom ersten Scrollpunkt (About direkt unter dem Banner) bis zum zweiten
  (Concept Architecture am bisherigen Screenshot-Endpunkt) sinkt der
  zeitliche Abstand zwischen benachbarten Hintergrund-Hauptlogoebenen
  linear von 0,08 auf 0,0008 Sekunden. Vorher bleibt er bei 0,08 Sekunden,
  danach bei 0,0008 Sekunden. Die zusätzliche Nachlaufglättung und die
  Rotationsgeschwindigkeitsunterschiede nehmen im selben Verlauf ab,
  damit die sichtbare Fächerung tatsächlich enger wird.

- Das Startlogo und die acht Hauptlogoebenen teilen eine feste
  Viewporthöhen-Referenz. Auf Touchgeräten wird sie vor dem ersten Scrollen
  festgehalten, damit ein-/ausfahrende Browserleisten in eingebetteten
  Browsern (z. B. Messenger/WhatsApp) die Logos nicht nachträglich skalieren.
- Beim Drehen bzw. tatsächlichen Ändern der Fensterbreite wird neu gemessen.
  Auf Desktopgeräten funktioniert auch das Verändern der Fensterhöhe weiter.
- Die Referenz gilt ebenfalls für die Regengrößen. Die sichtbare Canvasfläche
  darf sich weiterhin an das Fenster anpassen, ohne die Logogrößen zu ändern.

- Im Querformat entspricht die nächste Hintergrundebene der tatsächlichen
  Größe des vordersten Startlogos. Alle weiteren sieben Ebenen behalten
  ihre bisherige relative Größenstaffelung. Die Ringe folgen ihren Ebenen.

- Das vorderste Startlogo sitzt auf Desktop und im Querformat mittig zwischen
  Bannerkante und der ersten Textfeldlinie. Der Mittelpunkt folgt der Höhe
  des Startbereichs; die Größe des vordersten Startlogos bleibt erhalten.

- Der Ring des vordersten Startlogos ist ausgeblendet.
- Die acht schwächeren Hauptlogoebenen behalten ihre sandgoldenen Punktringe
  auch beim Herunterscrollen im Hintergrund.
- Alle acht Hauptlogo-Ebenen tragen denselben Punktering mit ihrer jeweiligen
  Größe, Sichtbarkeit, Rotation und Staffelung. Die Ringbilder werden gemeinsam
  zwischengespeichert und ohne zusätzliche Animationsschleife gezeichnet.
- Der Ring besteht nur aus Punkten; beide durchgehenden Randlinien sind entfernt.
- Der kleinste Abstand zu den Punkten entspricht einem Vierundsechzigstel der Logogröße.
- Gleichmäßige Punktabstände und transparente Zwischenräume bleiben erhalten.
- Neue Tempofolge mit 8/33/45 rpm, linearer Beschleunigung in den letzten
  1,8 Sekunden auf 888 rpm, anschließendem Abbremsen bis zum Stillstand,
  Stoppphasen und sieben einzelnen Umdrehungen bei 8 rpm.

Die Positionierung im Hochformat bleibt erhalten.
Aktuelle Prüfung: JavaScript-Syntax, identische Regengrößen bei vertauschten
Viewportseiten und Abgleich mit den bisherigen Querformatgrößen, Skalierungsberechnungen für fünf
Desktop-/Quer-/Hochformate, konstante Mustergröße aller neun Logos,
Texturzuordnung, Cache-Wiederverwendung, Schutz gegen veraltete Ladevorgänge
nach Größenänderungen, Dateiverweise und ZIP-Integrität.
Die automatische Startsequenz ist unverändert. Der Scroll-Nachlauf wurde
wie oben beschrieben angepasst. Zusätzlich geprüft: Browser-/Seitenfarbe,
Fächerzeit an beiden Scrollpunkten, Zwischenwerte, Rückwärtsscrollen und
Nachlauf nach dem Scrollende.
Ein Live-Browsertest bzw. Test direkt in Messenger/WhatsApp war in dieser
Umgebung nicht verfügbar. Die Schutzlogik wurde mit simulierten Browserleisten-,
Initialisierungs-, Dreh- und Desktop-Größenänderungen geprüft.
