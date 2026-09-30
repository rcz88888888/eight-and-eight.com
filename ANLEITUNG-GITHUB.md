# Eight&Eight – Version 72

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

## Anpassungen

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

## Prüfung

JavaScript-Syntax, Ressourcenverweise, Anker und unveränderte Seiteninhalte
sind geprüft. Das Zeichenprogramm wurde lokal mit echten Canvas-Flächen
bei 393 × 852 und 1440 × 900 Pixeln auf Scrollen, Größenänderung, reduzierte
Bewegung und Stillstand geprüft. Die Löschlogik wurde in temporären
Git-Repositories einschließlich Vorschau, Wiederholung und Schutz geänderter
Dateien ausgeführt. Ein vollständiger Browser- und iPhone-Safari-Test war in
dieser Umgebung nicht möglich; eine garantierte Bildrate ist damit nicht belegt.
