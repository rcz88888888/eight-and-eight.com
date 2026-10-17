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

## Enthaltene Änderungen

- Das vorderste Startlogo sitzt auf Desktop und im Querformat mittig zwischen
  Bannerkante und der ersten Textfeldlinie. Der Mittelpunkt folgt der Höhe
  des Startbereichs; die Logo- und Ringgröße bleiben erhalten.

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
Aktuelle Prüfung: geänderte CSS-Regeln, Dateiverweise und ZIP-Integrität.
Ringgeometrie und Animationsablauf wurden nicht geändert.
Ein Live-Browsertest war in dieser Umgebung nicht verfügbar.
