# Eight&Eight – Website mit Hintergrundringen

Diese ZIP enthält 45 Dateien einschließlich dieser Anleitung und CNAME.
Ältere, nicht eingebundene Versionen und doppelte Bilddateien sind entfernt.

## Website hochladen

1. ZIP entpacken.
2. Den Inhalt von eight-and-eight.com-main in die Hauptebene des bestehenden
   Website-Repositorys hochladen. index.html muss direkt neben CNAME liegen.
3. Vorhandene Dateien ersetzen und die Änderung committen.

Ein ZIP-Upload löscht bereits im GitHub-Repository vorhandene Altdateien nicht.
Die ZIP selbst wird von GitHub Pages nicht automatisch entpackt.

## Scrollgesteuerte MP4-Videos (v215)

Die drei bisherigen Fotoflächen enthalten echte MP4-Dateien. Sie wurden aus
getrennten Fotoebenen gerendert, nicht mit einem KI-Bild-zu-Video-Modell.
Die Kamera, das Gehäuse, das Brett und die Bildausschnitte stehen fest.

- Uhrwerk: Die großen Zahnräder drehen gegensinnig unter den festen Brücken.
  Ihr Drehweg ist gegenüber v214 um 75 % reduziert (Hauptrad: etwa 74,5°).
  Die Unruh schwingt mit einem Viertel des bisherigen Ausschlags und vier
  statt zehn Schwingungen. Das gesamte Bild wird nicht gedreht.
- Schach: Das goldene Pferd folgt einem legalen L-Zug (1 + 2 Brettfelder)
  vom linken zum rechten markierten Bereich. Der Weg ist anhand der
  Brettschnittpunkte perspektivisch berechnet; Vordergrundbauern verdecken
  die Figur weiterhin korrekt. Schatten und Spiegelung bewegen sich mit.
  Bezugspunkt ist die Mitte der Standfläche. Start, beide Zwischenfelder
  und Ziel werden jeweils in der Feldmitte durchlaufen. Die Figur gleitet
  ohne zusätzliches Anheben; ihre Größe folgt der Brett-Perspektive.
- Goldlogo: Das Motiv bleibt fest, während die Metallreflexionen wandern.
- Alle drei Sequenzen enthalten denselben Verlauf einer Sonne außerhalb
  des Bildes über 18 Lichtpositionen mit stetigen Übergängen. Die Reflexionen
  auf Figuren, Brett und Goldlogo sind deutlicher ausgeprägt. Die Kamera-
  und Oberflächennormalen wurden auf dasselbe Koordinatensystem abgestimmt.
  Erhalten bleiben eine stärker am Bannerton
  orientierte Champagnerhellgold-Abstimmung und den 8-%-Helligkeitsschritt.

Jede Quelldatei enthält 96 Einzelbilder bei 24 Bildern pro Sekunde und ist
4 Sekunden lang. Die Seite spielt sie nicht nach einer unabhängigen Uhr ab:
Die Position beim Scrollen steuert den Videoframe. So durchläuft das Video
seine gesamte Sequenz genau während des Vorbeiscrollens, unabhängig davon,
wie schnell man scrollt. Anhalten hält den Frame an; Hochscrollen spult zurück.

Die MP4s enthalten ausschließlich einzeln suchbare H.264-I-Frames und keine
Tonspur. Inline-/Stumm-Eigenschaften sind für iPhone gesetzt. Erst nach dem
Laden eines dekodierten Bildes wird gespult. Schnelle Scrollanfragen werden
auf die jeweils neueste Zielposition zusammengefasst. Bei reduzierter Bewegung
oder einem Ladefehler bleibt das passende Posterbild sichtbar. Ein Test
auf einem echten iPhone ist noch erforderlich.

Das Schachvideo bleibt innerhalb des Partnership-Strategy-Feldes direkt
unter „ecosystems“. Der dezente Textverlauf aus v213 bleibt erhalten:
zusätzliche 8 % vertikale Streckung am unteren Viewportrand, Rückkehr zur
bisherigen Darstellung spätestens in der Bildmitte. Deckkraft, Schrift und
bestehende äußere Hintergrundunschärfe bleiben erhalten.

Geprüft: Dekodierung aller 288 MP4-Frames, I-Frame-Struktur, Scroll-Zeitzuordnung,
Anfang/Ende, Rückwärtslauf, Stillstand, schnelle Scrollwechsel, Ladefehler,
reduzierte Bewegung, lokale Dateiverweise und ZIP-Integrität. Zusätzlich:
vier Feldmitten des Springerwegs und ein isolierter Lichttest mit jeweils
18 Positionen bei stillstehenden Motiven in allen drei Sequenzen.
Details zu Medien und Erzeugung stehen in VIDEO-MEDIEN-v215.md.

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
