# Eight&Eight – Version 92

## Website hochladen

1. ZIP entpacken.
2. Den Inhalt von `eight-and-eight.com-main` in die Hauptebene des bestehenden
   Website-Repositorys hochladen. `index.html` muss direkt neben `CNAME` liegen.
3. Die vorhandenen Dateien beim Hochladen ersetzen und die Änderung committen.
   Die ZIP selbst wird von GitHub Pages nicht automatisch entpackt.

## Alte Dateien mit GitHub löschen

Die Workflowdatei ist bereits unter `.github/workflows/delete-old-files.yml`
enthalten. Falls der Ordner beim Upload auf dem iPhone nicht mitkommt:
Im Repository im Browser **Add file → Create new file** wählen, als Namen
`.github/workflows/delete-old-files.yml` eingeben und den vollständigen Inhalt
von `delete-old-files-v72.yml` einfügen. Auf dem Standardbranch (meist `main`)
speichern.

Danach **Actions → Alte Dateien löschen → Run workflow → Run workflow**.
Den Branch wählen, auf dem die Website liegt. Mit „Nur Vorschau anzeigen“
kannst du die Löschliste ansehen, ohne etwas zu entfernen.

Der Workflow entfernt ausschließlich bekannte, unveränderte Altdateien aus
Version 70, die keine verbleibende Quelldatei mehr erwähnt. Aktuelle Dateien,
neue unbekannte Dateien, geänderte Altdateien, `CNAME` und `.github` bleiben
bestehen. Es wird ein normaler Git-Commit erstellt; die Löschung lässt sich
über die Git-Historie rückgängig machen. Wiederholte Ausführung ist möglich.
Ein geschützter Branch kann den Push ablehnen; der Workflow umgeht keinen
Branchschutz. Es gibt keinen automatischen Start bei Uploads oder Pushes.

Die bereinigte ZIP enthält die Altdateien bereits nicht mehr. Der Workflow
ist für die Kopien gedacht, die noch im GitHub-Repository liegen. Er ist kein
Befehl zum Leeren des gesamten Repositorys. Er veröffentlicht selbst keine
neue Pages-Version; die neuen Website-Dateien zuerst als eigenen Commit
hochladen, damit der übliche Pages-Build startet.

## Änderungen in Version 92

Die Seite verwendet wieder den normalen Dokument-Scrollbereich des Browsers.
Der zusätzliche feststehende Scrollcontainer und dessen Fokusziel entfallen.
Der obere Banner und die cremefarbene Maske bleiben fest am Bildschirm;
Linien und Feldreflexionen liegen weiterhin über der Maske und unter dem Muster.
Browser-Scrollanker sind deaktiviert, damit Layoutänderungen die Position nicht
nachführen. Eine Wischbewegung bricht eine laufende Menü-Scrollanimation sofort
ab; abgebrochene Animationscallbacks dürfen die Position nicht mehr schreiben.
Alle Lichtwerte, Kontaktdaten und der Abschlussbanner bleiben erhalten.

Geprüft: Dokument-Scrollpositionen und Größenwechsel, feste Maskenkante,
Abbruch vor und während der Menüanimation einschließlich veralteter Callbacks,
Menüziele, 800 Lichtzyklen ohne wiederholte Richtung und alle Dateiverweise.
Ein Test auf einem echten iPhone steht noch aus.

## Änderungen in Version 91

Die Ganzflächen-Clippingmaske entfällt. Stattdessen liegt eine feste, cremeweiße
Abdeckung in der Banner-Hintergrundfarbe über den Texten und Kooperationslogos.
Rahmen, Feldreflexionen und Startlinienlogo liegen über dieser Abdeckung und
unter dem Tapetenmuster des oberen Banners. Texte und Linien scrollen weiter
gemeinsam nativ; es gibt keine per JavaScript nachgeführte Textkopie.
Die Maskenkante, Lichtwerte, Kontaktdaten und Position des Abschlussbanners
bleiben erhalten.

Prüfung: JavaScript-Syntax, native Scrollsteuerung bei schnellen und gebrochenen
Scrollpositionen, Größenwechsel, Menüanker, Maskenkante und Dateiverweise geprüft.
Die Darstellung auf einem echten iPhone wurde nicht geprüft.

## Änderungen in Version 90

Der untere Abschlussbanner gehört wieder hinter den Footer innerhalb der
nativen Scrollfläche. In Version 89 stand er außerhalb dieser Fläche und
erschien dadurch direkt unter dem oberen Banner. Der zusätzliche Tapetenblock
am Seitenanfang ist damit entfernt. Scroll-Darstellung, Maskenkante und alle
bisherigen Licht- und Kontaktänderungen bleiben erhalten.

## Änderungen in Version 89

- Texte, Linien und Kooperationslogos scrollen gemeinsam in einer nativen
  Browserfläche. Die per JavaScript nachgeführte Kopie des Seiteninhalts
  entfällt; Textpositionen werden beim Scrollen nicht mehr verschoben.
- Die feste Maskenkante reicht 1 CSS-Pixel weiter nach unten als in Version 88.
- Navigation und Hintergrundeffekte verwenden die Scrollposition dieser
  Fläche. Die acht Reflexionsrichtungen, 48 % Sichtbarkeit, der Rhythmus von
  0,8 Sekunden alle acht Sekunden und 0,8-px-Linien im Querformat bleiben aktiv.

## Änderungen in Version 88

- Kontaktbox: Eight&Eight, rCz audio, Contact und +491631583194; Telefonnummer
  direkt anwählbar. Der doppelte Kontaktblock unter Legal Information entfällt.
- Die acht zusätzlichen Lichter auf dem Startlinienlogo sind entfernt.
  Das Logo erhält das gemeinsame Lichtfeld des oberen Banners.
- Eine zusätzliche Reflexion kommt zufällig aus einer von acht Richtungen;
  dieselbe Richtung wird nicht direkt hintereinander verwendet.
- Text, Kooperationslogos, Linien, Felder und Bannerlinien reflektieren
  alle acht Sekunden für 0,8 Sekunden mit 48 % Licht-Sichtbarkeit.
- Im Querformat sind Feldlinien und Startlinienlogo 0,8 px dick.
- Die feste Maskenkante für Texte und Kooperationslogos bleibt erhalten.

## Bisherige Anpassungen

- Eigene Blur-Ebene mit 38 % Deckkraft und 10 px Unschärferadius hinter beiden
  Bannern, einschließlich ausgeklapptem mobilen Banner. Muster, Logos,
  Beschriftung und Linien liegen darüber und bleiben scharf.
- Hintergrund und acht Hauptlogos werden über zwei Canvas-Flächen gezeichnet.
  Individuelle Logo-Größen, Sichtbarkeiten, Geschwindigkeiten und die
  30-prozentige Lichtauflage bleiben erhalten.
- Gemeinsame, ereignisgesteuerte Aktualisierung; kein endloser Animationsloop
  im Stillstand. Keine Positionsmessung pro Logo während des Scrollens.
- Lichtverläufe von 33 auf neun Stützpunkte reduziert; Zeichenauflösung
  dekorativer Hintergründe begrenzt.
- Stabile mobile Höhen und gecachte Navigationsziele reduzieren Neuberechnungen
  beim Scrollen und beim Einblenden der Browserleiste.

Technischer Hinweis: CSS `blur()` verwendet Pixel, keine Prozent. Die
angeforderten 38 % sind deshalb die Deckkraft der separaten Unschärfe-Ebene:
`--banner-blur-opacity: .38`; der Radius ist `--banner-blur-radius: 10px`.

GitHub-Anleitung: https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow
Pages-Build: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Prüfung von Version 89

JavaScript-Syntax, Seitenstruktur, Ressourcen und unveränderte Texte sind
geprüft. Lokale Ablaufprüfungen decken schnelle und gebrochene Scrollwerte,
die feste Maskenkante, Logoausrichtung, Navigation, Größenänderung,
Hintergrundparameter und den unveränderten Reflexionsrhythmus ab.
Ein direkter Browser- oder iPhone-Safari-Test war in dieser Umgebung nicht möglich.

## Frühere Prüfungen (Version 73)

JavaScript-Syntax, Ressourcenverweise, Anker und unveränderte Seiteninhalte
sind geprüft. Das Zeichenprogramm wurde lokal mit echten Canvas-Flächen
bei 393 × 852 und 1440 × 900 Pixeln auf Scrollen, Größenänderung, reduzierte
Bewegung und Stillstand geprüft. Die Löschlogik wurde in temporären
Git-Repositories einschließlich Vorschau, Wiederholung und Schutz geänderter
Dateien ausgeführt. Ein vollständiger Browser- und iPhone-Safari-Test war in
dieser Umgebung nicht möglich; eine garantierte Bildrate ist damit nicht belegt.

## Korrektur in Version 73

Die acht statischen SVG-Ersatzlogos werden nach dem Start der Canvas-Darstellung
jetzt direkt mit `display: none` ausgeblendet. Die ältere Regel
`visibility: visible` auf den SVG-Elementen konnte zuvor die Vererbung von
`visibility: hidden` umgehen. Der Elternbereich behält seine Maße; dadurch
bleibt die Berechnung der acht bewegten Hauptlogos unverändert. Ohne aktive
Canvas-Darstellung stehen die Ersatzlogos weiterhin zur Verfügung.
