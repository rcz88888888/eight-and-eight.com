# Eight&Eight – Website mit Hintergrundringen

Diese ZIP enthält 35 Dateien einschließlich dieser Anleitung und CNAME.
Ältere, nicht eingebundene Versionen und doppelte Bilddateien sind entfernt.

## Website hochladen

1. ZIP entpacken.
2. Den Inhalt von eight-and-eight.com-main in die Hauptebene des bestehenden
   Website-Repositorys hochladen. index.html muss direkt neben CNAME liegen.
3. Vorhandene Dateien ersetzen und die Änderung committen.

Ein ZIP-Upload löscht bereits im GitHub-Repository vorhandene Altdateien nicht.
Die ZIP selbst wird von GitHub Pages nicht automatisch entpackt.

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
- Der kleinste Abstand zu den Punkten entspricht einem Sechzehntel der Logogröße.
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
Die zeitlichen Animationsabläufe sind unverändert.
Ein Live-Browsertest bzw. Test direkt in Messenger/WhatsApp war in dieser
Umgebung nicht verfügbar. Die Schutzlogik wurde mit simulierten Browserleisten-,
Initialisierungs-, Dreh- und Desktop-Größenänderungen geprüft.
