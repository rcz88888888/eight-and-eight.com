# Eight&Eight – Version 118

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

## Änderungen in Version 102

Die Sonnenstrahlen aus Version 100/101 sind vollständig entfernt, einschließlich
Strahlen-Gruppe, Verläufen, Weichzeichnern und CSS-Regel. Das Licht auf dem oberen
Tapetenbanner und dem Startlogo samt Goldrändern aus Version 98 bleibt erhalten.
Es erreicht am Seitenanfang weiterhin 88 % und blendet beim Losscrollen aus.
Transparenz, native Scrollsteuerung und die Zentrierung der acht Hauptlogos
bleiben unverändert. Geprüft: SVG, entfernte Strahlenelemente, Dateiverweise,
Skriptsyntax und ZIP-Integrität.

## Änderungen in Version 101

Die schrägen Sonnenstrahlen sind deutlich kräftiger und länger sichtbar.
Hauptstrahl und Nebenstrahlen reichen über die gesamte Höhe der Startfläche;
ihre Geometrie beginnt oberhalb und endet unterhalb des SVG-Bildbereichs.
Die Lichtstärke bleibt über den größten Teil der Länge hoch und fällt erst
im unteren Abschluss weich auf null. Ein breiter warmer Hauptstrahl, heller
weißer Kern und diffuse Flanken geben der Lichtbahn mehr Tiefe. Die beiden
Nebenstrahlen sind ebenfalls breiter und intensiver.

Die gemeinsame Richtung von oben rechts nach unten links, die Start-Lichtstärke
von 88 % und das Ausblenden über die ersten 88 Scrollpixel bleiben erhalten.
Keine kurzen Randstrahlen, kein Randschein um das Logo und keine neue Zeitschleife.
Texte/Unternehmenslogos, Scrollsteuerung, Masken und Hauptlogo-Zentrierung bleiben
unverändert.

Geprüft: SVG gerendert und visuell mit Version 100 verglichen; deutlich höhere
Lichtdeckung im unteren Drittel, Strahlengeometrie über volle Bildhöhe und
weiches Ende. Bestehende Scroll-/Lichtsteuerung und sämtliche anderen Website-
Dateien unverändert; Syntax, Dateiverweise und ZIP geprüft. Kein iPhone-Test.

## Änderungen in Version 100

Die acht kurzen Randstrahlen, die inverse Strahlenmaske und der umlaufende
Randschein aus Version 99 sind entfernt. Stattdessen ziehen lange Sonnenstrahlen
wie in der Fotoreferenz aus derselben Richtung von oben rechts nach unten links:
ein heller, weicher Hauptstrahl mit schmalem Kern und zwei schwache Nebenstrahlen.
Sie werden nach unten breiter und nehmen in Helligkeit ab. Es gibt keinen
Strahlenkranz und keine zusätzliche Lichteffekt-Animationsschleife.

Die Strahlen liegen in der Startfläche unter Tapetenornamenten und Goldrändern.
Sie verwenden weiterhin die Lichtstärke am Seitenanfang und blenden über die
ersten 88 Scrollpixel aus. Transparenz, ursprüngliche Logoform, Bannermaske,
Zentrierung der acht Hauptlogos und native Scrollsteuerung bleiben erhalten.
Texte und Unternehmenslogos bleiben unbeleuchtet.

Geprüft: neue SVG-Strahlen auf Cremegrund gerendert und visuell kontrolliert;
Entfernung sämtlicher alter Randstrahlen-/Halo-Elemente; Ausblenden beim
Scrollen, Hauptlogo-Zentrierung, Bannerkopie, Scrollsteuerung und Dateiverweise.
Kein echter iPhone-Test.

## Änderungen in Version 99

Am Seitenanfang strahlt warmes Licht hinter dem Tapetenstartlogo an dessen
Konturen vorbei. Acht weiche, sich nach außen öffnende Strahlen und ein sanfter
Randschein liegen vor dem Hintergrund, aber hinter der Tapete und den Goldrändern.
Eine inverse Silhouettenmaske hält die Strahlen aus der gefüllten Logoform heraus;
die vorhandenen transparenten Zwischenräume bleiben erhalten.

Die Strahlen verwenden dieselbe Start-Lichtstärke wie Version 98 (88 %) und
blenden beim Losscrollen über die ersten 88 Pixel aus. Sie kehren beim Zurück-
scrollen an den Anfang zurück. Es gibt keine neue Zeitschleife oder zusätzliche
Scrollsteuerung. Texte und Unternehmenslogos bleiben unbeleuchtet.

Geprüft: Strahlen-SVG auf Cremegrund gerendert und visuell kontrolliert;
Maskierung und Reihenfolge hinter der Tapete; Lichtabnahme/Rückkehr beim
Scrollen, acht zentrierte Hauptlogos, Scrollsteuerung, Bannerkopie und Dateien.
Kein echter iPhone-Test.

## Änderungen in Version 98

Am Seitenanfang erhalten das obere Bannertapetenmuster und das transparente
Tapetenstartlogo samt Goldrändern ein breites, warmes Licht mit 88 % Spitzen-
Sichtbarkeit. Der Lichtbereich reicht von 6 % bis 94 % der jeweiligen Breite
und bedeckt damit 88 % der Breite. Die genaue Zahl einzelner beleuchteter
Ornamentpixel beziehungsweise die Konturlänge ist wegen der Logoform verschieden.
Der Lichtverlauf hat weiche Übergänge und nimmt über die ersten 88 Scrollpixel
bis auf null ab; bei Rückkehr ganz nach oben erreicht er wieder 88 %.

Die vorhandenen SVG- und Ornamentmasken begrenzen das Licht auf Muster und
Ränder. Die offenen Zwischenräume bleiben transparent. Texte, Unternehmens-
logos, Hintergrundlogos, übrige Felder und der untere Banner bleiben unbeleuchtet.
Es gibt keinen Lichttimer und keine neue dauerhafte Animationsschleife.
Die acht Hauptlogos sind weiterhin am Seitenanfang hinter dem Startlogo zentriert.

Geprüft: Lichtstärke am Seitenanfang, Abnahme und Rückkehr beim Scrollen,
Ornament-/Randmasken, Zentrierung der acht Hauptlogos, Scrollsteuerung,
Bannerübertragung, SVG und ZIP-Integrität. Kein echter iPhone-Test.

## Änderungen in Version 97

Bei vollständig nach oben gescrollter Seite treffen sich die Mittelpunkte
aller acht Hauptlogos exakt im Mittelpunkt des Tapetenstartlogos. Größen,
Transparenzen und Rotation bleiben erhalten. Die Startkorrektur wird beim
Scrollen im ersten Viertel der Seite weich ausgeblendet; danach gilt die
bisherige Bewegung der einzelnen Tiefenebenen. Auch nach einer Neumessung
und beim Zurückscrollen an den Anfang gilt dieselbe Zentrierung.

Geprüft: acht identische Mittelpunkte bei Scrollposition null, Rückkehr zum
Anfang nach tieferem Scrollen und Neumessung, ursprüngliche Bewegung ab dem
ersten Seitenviertel, Bannerübertragung und Scroll-/Menüregressionen.
Alle Lichteffekte bleiben entfernt. Kein echter iPhone-Test.

## Änderungen in Version 96

Das transparente Tapetenstartlogo scrollt wieder nativ in seiner Startfläche
mit dem Inhalt nach oben aus dem Bildschirm. Es ist keine feste Ebene mehr;
seine Position wird nicht per JavaScript gesetzt oder nachgeführt. Transparente
Zwischenräume, Bannertapete und Goldränder bleiben erhalten. Alle Lichteffekte
bleiben ausgeschaltet, ebenso bleiben Scrollsteuerung und Bannermaske erhalten.

Geprüft: normale SVG-Position im Dokument, Entfernung der festen Positions-
steuerung, Mustermaßstab und Randdicke, native Scroll-/Menüregressionen,
Bannerübertragung, Dateiverweise und ZIP-Integrität. Kein echter iPhone-Test.

## Änderungen in Version 95

Sämtliche Lichtanimationen, Reflexionsverläufe und Canvas-Lichtüberlagerungen
sind entfernt, auch von den acht Hauptlogos. Parallaxbewegung und Rotation
bleiben erhalten; Banner, Schriftzug, Linien und Logos haben konstante Farben.
Der zuvor beleuchtete Schriftzug im Banner ist ebenfalls unbeleuchtet.

Das Tapetenstartlogo hat keine cremefarbene Füllung mehr. Die Ornamentmaske
bleibt auf die bisherige gefüllte Logoform begrenzt, ihre Zwischenräume sind
transparent. Außen- und Innenkonturen sowie die runden Punkte erhalten die
statischen Goldränder des Banners, in dessen Bildschirm-Liniendicke; im
Querformat 0,8 Pixel. Die Mustergröße entspricht weiterhin dem oberen Banner.

Damit Inhalte hinter der Tapete vorbeiscrollen können, ist das Startlogo eine
feste, transparente Ebene an seiner bisherigen Startposition vor Text und
Unternehmensbildern. Es hat keine blickdichte Textmaske. Die Startfläche im
Layout bleibt erhalten. Der obere Banner behält seine separate Textmaske und
den synchron übernommenen Hintergrundlogo-Ausschnitt; die native Scrollsteuerung
und der Abbruch von Menüanimationen bleiben erhalten.

Geprüft: SVG mit Ornamenten und Rand gerendert; transparente Zwischenräume in
der Logoform; feste Position bei verschiedenen Scrollständen und Neumessung;
Banner-Mustergröße, Randdicke, Dokument-Scrollen und Menüabbruch, Canvas-
Bannerkopie, Entfernung aller Lichttimer/-gradienten, Syntax und ZIP-Integrität.
Ein Test auf einem echten iPhone steht noch aus.

## Änderungen in Version 94

Fließtexte und Unternehmens-/Kooperationslogos bekommen keine Lichtschichten.
Die Unternehmenslogo-Shimmer werden nicht mehr erzeugt. Alle Textglyphen und
Unternehmensbilder liegen über den Feldreflexionen, die unter ihnen strahlen.
Linien bleiben über der Bannermaske; die normale Dokument-Scrollsteuerung und
die synchron übertragene Logoebene im Banner sind erhalten.

Das Startlogo verwendet die bisherigen geschlossenen Kurven und Punktformen
als gefüllte SVG-Silhouette. Außenkontur und Innenaussparungen bleiben erhalten,
aber es wird kein Konturrand gezeichnet. Cremeweiß und Gold sowie die Tapete
kommen aus dem Bannerdesign; die Mustergröße entspricht der aktuellen Banner-
Mustergröße auf dem Bildschirm.

Linien, Felder, oberer und unterer Tapetenbanner, der vollständige Eight&Eight-
Schriftzug im oberen Banner und das neue Tapetenlogo erhalten weiches warmes
Licht mit 68 % Spitzen-Sichtbarkeit. Die Bewegung dauert 8 Sekunden je 18-
Sekunden-Zyklus; die restlichen 10 Sekunden ruhen. Der Startlogo-Schweif zieht
langsam diagonal mit sanftem Anlauf und Auslauf. Nicht sichtbare und reduzierte
Animationen werden angehalten.

Geprüft: SVG-Füllform samt Tapete gerendert und visuell kontrolliert; keine
Unternehmenslogo-Lichtebene; Texte/Bilder über Feldlicht; Zeit- und Masken-
steuerung, Dokument-Scrollen, Menüabbruch und synchroner Banner-Ausschnitt.
Skripte, Dateiverweise und ZIP-Integrität geprüft. Kein echter iPhone-Test.

## Änderungen in Version 93

Die Texte sind konstant dunkelgolden; ihre blinkende Lichtanimation entfällt.
Die Kooperationslogos und Linien behalten ihre bisherigen Reflexionen.
In der cremefarbenen Maske liegt eine transparente Canvas-Ebene, die den
Banner-Ausschnitt der bereits gezeichneten Hintergrundlogos und acht Hauptlogos
im selben Bildschritt übernimmt. Sie liegt über der Maskenfarbe und unter den
Rahmen, dem Startlinienlogo und dem Tapetenmuster. Es entstehen keine weiteren
Logos und keine zusätzliche dauerhafte Animationsschleife. Natives Dokument-
Scrollen und der sofortige Abbruch von Menüanimationen bleiben erhalten.

Geprüft: Bannerkopie aus beiden Originalebenen im selben Bildschritt,
Ausschnitt und Pixeldichten beim Scrollen, Größenwechsel und erweitertem Menü;
keine weitere dauerhafte Animationsschleife. Textanimation deaktiviert,
Scroll- und Maskenregressionen sowie Skript-/Dateiprüfungen bestanden.
Ein Test auf einem echten iPhone steht noch aus.

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

## Kreisförmiges Startlicht in Version 107

Die Website setzt die aus ZIP 103 fortgeführte Version 106 fort. Am
Seitenanfang beleuchtet ein gemeinsames Kreislicht die Tapetenmuster des
Banners, das Startlogo und die vorhandenen Feld-/Bannerkonturen. Alle diese
Flächen verwenden denselben Mittelpunkt, denselben Radius und dieselbe
Helligkeitskurve in Seitenkoordinaten. Das Startlogo hat keine Flächenfüllung
unter der Tapete; die Musterzwischenräume bleiben transparent.

Die schwarze Umrandung des Referenzbildes bestimmt die vertikale Ausdehnung:
Der Lichtkreis beginnt etwas oberhalb des oberen Banners und reicht bis
64 CSS-Pixel unter die erste Eight&Eight-Überschrift. Der Mittelpunkt liegt
auf der horizontalen Seitenmitte. Der Radius entspricht der halben
vertikalen Spanne, mindestens jedoch der halben Bildschirmbreite. Es ist
ein echter Kreis, der durch den Bildschirmrand seitlich beschnitten werden
kann, keine an die Bildschirmform verzerrte Ellipse. Größenänderungen und
Schriftladung aktualisieren die Geometrie anhand der Seitenelemente.

Das Zentrum ist am hellsten (100% Stärke, warmes Champagnerlicht). Die
Helligkeit nimmt in einer fein abgestuften, angenäherten Gaußkurve zum
Rand ab und endet dort weich bei null. Die Farbe des Goldmaterials bleibt
außerhalb des Lichtkegels erhalten. Der Mittelpunkt ist an die Startposition
der Seite gebunden; die gemeinsame Reflexion bleibt beim Scrollen auf allen
Oberflächen deckungsgleich und blendet über die ersten 88 Scrollpixel aus.

Das bisherige unabhängige Zufallslicht wandert weiter. Texte, Menüschrift,
Unternehmenslogos und Hintergrundlogos bleiben ohne zusätzliche Beleuchtung.
Liniendicken, Scrollmaske, Navigation, Logoausrichtung und Inhalte sind
unverändert. Es gibt keine Lichtfläche über den transparenten Feldinnenräumen.

Die Geometrie wird bei Layoutänderungen gemessen und bei Scrollbewegungen
aus dem Cache berechnet. Lokale Prüfungen bestätigen identische Kreis-
koordinaten und Helligkeitsprofile in CSS und SVG, natürlichen monotonen
Helligkeitsabfall, erhaltene Transparenz, unabhängiges Zufallslicht sowie
Pause bei ausgeblendeter Seite und reduzierter Bewegung.
Ein direkter iPhone-Safari-Test war in dieser Umgebung nicht möglich.

## Sanfter Rotationsbeginn in Version 108

Der Übergang aus der zentrierten Startposition verwendet eine Kurve mit
sanftem Beginn und Ende. Eine zeitabhängige Glättung mit 42 ms Zeitkonstante
wirkt ausschließlich auf die acht Hauptlogos. Das native Scrollen der Seite,
Texte, Bannermaske und Lichtberechnung folgen weiterhin der echten Scrollposition.
Bei Rückkehr zum Seitenanfang sind alle acht Logos wieder exakt ausgerichtet.

Vorbereitete Bildgrößen und pro Logo gespeicherte Bildauswahl reduzieren den
Zeichenaufwand. Während des kurzen Nachlaufs werden ruhende Hintergrundebenen
und unveränderte Abonnenten nicht laufend neu gezeichnet. Die Animation endet
selbstständig nach dem Einschwingen. Anzahl, Größen, Sichtbarkeit und acht
Umdrehungen der Hauptlogos bleiben erhalten.

Lokale Prüfungen bestätigen sanften Anlauf, monotones Einschwingen ohne
Überschwingen, synchronisierte Logos, zwischengespeicherte Zeichenbilder,
korrekte Bannerkopien, unverändertes natives Scrollen und feste Maskengeometrie.
Ein direkter iPhone-Safari-Test war in dieser Umgebung nicht möglich.

## Textänderung in Version 109

Im Dreiklang Strategy / Imagination / Creativity ersetzt „Imagination“ das
bisherige „Mathematics“. „CREATES STRUCTURE.“ und die Gestaltung bleiben erhalten.

## Erweitertes Startlicht und Telefon-Querformat in Version 110

Das gemeinsame Kreislicht hat einen um 65% größeren Radius und einen breiteren,
kräftigeren Helligkeitsverlauf in warmem Goldlicht. Die markierte Zone bis zur
ersten Überschrift und die seitlichen Muster im oberen Banner erhalten so
sichtbare Reflexionen, bevor das Licht außerhalb weich ausläuft. CSS und SVG
verwenden weiterhin identische Kreisgeometrie und Helligkeitsstufen.

Nur auf als Telefon erkannten Geräten im Querformat wird die Ornamentmaske
des Startlogos aufgehoben: Die exakte Logoform einschließlich der Punkte ist
deckend in #d7c193 gefüllt, ohne Tapetenmuster. Die Reflexionen treffen diese
Füllung. Bei Rückkehr ins Hochformat wird die Ornamentmaske wiederhergestellt.
Desktopbrowser behalten das Muster auch bei schmalen oder breiten Fenstern.
Die transparente Fläche außerhalb der Logoform bleibt in allen Modi erhalten.

Die Scrollglättung aus Version 108 und die Imagination-Textänderung aus
Version 109 bleiben enthalten. Lokale Prüfungen kontrollieren den Geräte- und
Orientierungswechsel, die gemeinsame Lichtprojektion und die Maskenstruktur.
Ein direkter iPhone-Safari-Test war in dieser Umgebung nicht möglich.

## Mittelreflexion und 100% Licht in Version 111

Die schwarz markierten oberen und unteren Ecken erhalten am Start weniger
Kreislicht. Der Radius beträgt nun 115% der ursprünglichen Referenzspanne,
statt 165%. Eine zusätzliche schmale, hohe Reflexion betont die rot markierte
Mittelzone vom Banner bis unter die erste Überschrift. Ihre Kanten laufen
weich aus. Beide Startlichtfelder verwenden dieselben Seitenkoordinaten für
Tapetenornamente und Konturen; ausschließlich diese Goldflächen werden beleuchtet.

Die Quellen haben 100% Sichtbarkeit: Das Zufallslicht variiert weiterhin Ort,
Ausdehnung und Geschwindigkeit, aber nicht mehr seine maximale Deckkraft.
Das Startlicht erreicht am Seitenanfang volle Stärke und blendet wie bisher
beim Verlassen des Startpunkts aus. Der räumliche Helligkeitsabfall bleibt
für natürliche Reflexionen erhalten. Text und Unternehmenslogos erhalten
keine Lichtüberlagerung. Die deckende Telefon-Querformatvariante gilt auch
für die neue Mittelreflexion; Desktop und Telefon-Hochformat behalten Tapete.

Lokale Prüfungen kontrollieren die gemeinsame CSS/SVG-Geometrie und Profile,
100% Quellendeckkraft, stärkere Mittelreflexion, geringeres Startlicht an den
Ecken und erhaltene Maskierung. Kein direkter iPhone-Safari-Test war möglich.

## Seitenstart und schmale Metallreflexion in Version 112

Ein frühes Startskript schaltet die automatische Scrollwiederherstellung ab
und entfernt beim frischen Seitenaufruf einen alten Abschnittsanker. Die Seite
startet oben. Ein begrenzter Abschluss beim Laden berücksichtigt die fertige
Seitengeometrie; nach einer Eingabe wird die Position nicht mehr zurückgesetzt.
Es gibt keinen dauerhaften Scrollzwang und keinen Intervall für diese Aktion.

Innerhalb der Mittelreflexion liegt ein deutlich schmalerer Glanzstreifen mit
weißgoldenem Kern und champagnerfarbenem Auslauf. Geometrie und Profile sind
in SVG und CSS gleich, auf die Goldflächen und Konturen begrenzt und folgen
der bestehenden Startlichtstärke. Telefon-Querformat bleibt deckend gefüllt.

Die Quellprüfung findet keinen Reload-Aufruf, Refresh-Metatag, Service Worker
oder Timer für Navigation. Die tatsächliche Ursache des gemeldeten erneuten
Ladens lässt sich ohne Browser-/Geräteprotokoll nicht eindeutig feststellen.
Unnötige identische CSS-/SVG-Schreibzugriffe des laufenden Lichts werden nun
unterdrückt, um Neuzeichnungen und Browserlast zu reduzieren. Alte Cache-
Metatags wurden entfernt; Dateiversionen aktualisieren die Ressourcen weiter.

Lokale Prüfungen kontrollieren einmaligen Start oben, Abbruch durch Benutzung,
fehlende periodische Navigation, abgestimmte Lichtprojektion und unveränderte
Scroll-/Inhaltsstruktur. Kein direkter iPhone-Safari-Test war möglich.

## Wandernder Lichtkreis in Version 113

Das bisherige zeitgesteuerte Zufallslicht wurde vollständig entfernt. Das
bestehende positionsabhängige Startlicht verändert sich weiterhin nur durch
Scrollen oder Layoutänderungen. Der einzige neue automatische Effekt ist ein
kräftiger weißgoldener Lichtkreis, der über das Startlogo in einer stehenden
Acht wandert. Sein Durchmesser von 230 SVG-Einheiten entspricht ungefähr der
roten Markierung über dem oberen runden Logobereich. Es ist ein echter Kreis
mit hellem Kern und weichem goldenen Rand, nur auf Ornamenten und Konturen.

Die nicht näher bezifferte Zeiteinheit für „88 Durchläufe“ ist als 88 vollständige
Achten pro Minute umgesetzt. Die Geschwindigkeit beginnt bei 2 pro Minute,
steigt 44 Sekunden lang weich auf 88 pro Minute und fällt dann 44 Sekunden
lang auf den Ausgangswert. Ein 88-Sekunden-Zyklus enthält exakt 66 vollständige
Achten, sodass die Schleife ohne Positionssprung anschließt. Sichtbarkeit: 100%.

Nur die Transformation des kleinen Lichtfeldes im Start-SVG wird animiert.
Außerhalb des sichtbaren Startlogos und bei ausgeblendeter Seite pausiert der
Zeitverlauf. Bei reduzierter Bewegung bleibt der Lichtkreis statisch. Scrollen,
Bannerposition, Texte und Unternehmenslogos werden nicht durch den neuen
Zeitverlauf geändert. Die deckende Telefon-Querformatvariante bleibt erhalten.

Lokale Prüfungen kontrollieren Geschwindigkeitsmaximum und Schleifenanschluss,
kreisförmige Projektion, Achterbahn, Pause/Weiterlauf, erhaltene Maskierung und
fehlende alte Zufallsanimation. Kein direkter iPhone-Safari-Test war möglich.

## Spitzengeschwindigkeit in Version 114

Das Maximum beträgt nun 88 vollständige Achten pro Sekunde. Der langsame
Start bei 2 Achten pro Minute und die weiche Beschleunigungs-/Bremskurve
bleiben bestehen. Für einen nahtlosen Anschluss enthält die Schleife exakt
3873 vollständige Achten; ihre Dauer liegt bei etwa 87,9894 Sekunden.

Die Bewegung wird zeitabhängig berechnet. Die Zeichenrate bleibt auf höchstens
60 Aktualisierungen pro Sekunde begrenzt; einzelne 88 Durchläufe pro Sekunde
können auf Displays mit geringerer Bildrate nicht vollständig sichtbar werden.
Größe, Lichtstärke, Maskierung und alle sonstigen Funktionen bleiben erhalten.
Die Spitzenfrequenz und der nahtlose Anschluss wurden lokal überprüft.

## Achtfach vergrößerter Lichtkreis in Version 115

Der wandernde Kreis hat nun einen Radius von 920 statt 115 SVG-Einheiten.
Der helle Kern und sämtliche Abstände des kreisförmigen Helligkeitsabfalls
werden gleichmäßig um den Faktor acht vergrößert. Farbe, volle Sichtbarkeit
und Achterbahn bleiben erhalten.

Die wandernde Lichtfüllung verwendet nur die äußere Logoform als Maske.
Dadurch werden auch die zuvor transparenten Zwischenräume innerhalb der
Tapetenornamente mit wanderndem Licht gefüllt. Der Bereich außerhalb der
Logoform bleibt transparent; die Tapete und übrigen Lichtmasken bleiben erhalten.

Eine vollständige Beschleunigungs-/Bremssequenz dauert exakt 18 Sekunden:
weich aus dem Stillstand bis maximal 88 vollständige Achten pro Sekunde nach
9 Sekunden, dann weich zurück. Die integrierte Bewegung enthält exakt 792
Achten, sodass die Schleife ohne Positionssprung wieder beginnt. Die Bildrate
begrenzt weiterhin die sichtbare Darstellung. Die Animation pausiert bei
unsichtbarem Logo, ausgeblendeter Seite oder reduzierter Bewegung.

Lokale Prüfungen kontrollieren achtfachen Kreisradius und Profilabstände,
18-Sekunden-Schleife, maximale Frequenz, erhaltene Außenmaske und Lichtfüllung
in den Ornamentzwischenräumen. Kein direkter iPhone-Safari-Test war möglich.

## Gemeinsames Acht-Licht für alle Goldflächen in Version 116

Der bisher nur im Start-SVG dargestellte wandernde Lichtkreis ist nun ein
gemeinsames Lichtfeld für Tapetenmuster im oberen und unteren Banner, Menü-
Tapete, das Startlogo sowie sämtliche vorhandenen Goldkonturen und Feldränder.
CSS und SVG verwenden dieselbe Position, denselben Radius und dasselbe Profil.
Das Licht liegt im Displayraum, anfangs exakt passend zum Startlogo. Beim
Scrollen ziehen weitere Goldflächen durch das Feld; auch nach Verlassen des
Startlogos läuft die gemeinsame Lichtanimation weiter. Die Elementpositionen
werden im vorhandenen Layoutdurchlauf gemessen, nicht in jedem Lichtbild.

18-Sekunden-Schleife, achtfache Größe/Reichweite, innere Lichtfüllung des
Startlogos und 88 Achten pro Sekunde als Maximum bleiben erhalten. Die
Lichtebenen sind weiter auf Goldflächen und Konturen maskiert; Texte und
Unternehmenslogos behalten die zuvor festgelegte Darstellung ohne Licht.
Bei ausgeblendeter Seite oder reduzierter Bewegung pausiert die Animation.
Lokale Prüfungen kontrollieren identische CSS/SVG-Projektion für feste und
scrollende Elemente sowie Licht am unteren Banner und die bestehende Schleife.
Kein direkter iPhone-Safari-Test war möglich.

## Reflexion außerhalb des Startlogos in Version 117

Eine eigene feste Displayebene zeigt das gemeinsame wandernde Kreislicht
jetzt auch außerhalb des Startlogos und der Goldkonturen auf der gesamten
Hintergrundfläche. Sie liegt über den kleinen Hintergrundlogos und den acht
Hauptlogos und unter der ursprünglichen Inhaltsebene. So sind die Reflexionen
auch in den transparenten Bereichen hinter den Textfeldern sichtbar.

Diese Ebene verwendet dasselbe Kreisprofil, dieselben Positionen und denselben
Radius wie die Banner und das Start-SVG. Der Screen-Mischmodus hellt die
Hintergründe auf. Es gibt keinen zusätzlichen Lichtzeitlauf, keine weitere
Logoanimation und keine Scrollbewegung durch die Displayebene. Texte und
Unternehmenslogos behalten die bisherige Vordergrunddarstellung.

Achtfache Kreisgröße, 18-Sekunden-Sequenz und maximal 88 Achten pro Sekunde
bleiben erhalten. Die Displayebene nimmt keine Eingaben entgegen und bewegt
keine Layoutboxen. Lokale Prüfungen kontrollieren deckungsgleiche Projektion,
Ebenenreihenfolge, Pause und Schleifenanschluss. Ein direkter iPhone-Safari-
Test war in dieser Umgebung nicht möglich.

## Ruhigeres neutrales Licht und zwei Ebenen in Version 118

Eine Sequenz dauert jetzt exakt 48 Sekunden. Das Maximum beträgt 18 Achten
pro Sekunde nach 24 Sekunden; anschließend bremst das Licht weich bis zum
Stillstand. Genau 432 Durchläufe sorgen für einen nahtlosen Anschluss. Die
weiß-cremefarbenen Reflexionen ersetzen die gelben Farben des bewegten Lichts.
Eine zeitliche Gauß-Glättung verringert bei hoher Geschwindigkeit die sichtbaren
Sprünge als Bewegungsunschärfe, statt die Bilder scharf flimmern zu lassen.

Die hintere Lichtfläche liegt unter allen Haupt- und Hintergrundlogos. Ihre
Position rotiert zusätzlich um die tatsächliche Zeichenachse der hintersten
Hauptlogoebene mit genau deren geglättetem Scrollwinkel. Eine gleiche Licht-
fläche liegt als oberste Reflexionsebene über den sichtbaren Oberflächen.
Text, Menüzeichen und Unternehmenslogos werden durch geometrische Aussparungen
von dieser Vordergrundreflexion ausgenommen. Die Aussparungen werden nur bei
Scroll-/Layoutänderungen aktualisiert, nicht in jedem Animationsbild.

Das Banner erhält neben dem stehenden Startlicht nur noch diese obere
bewegte Reflexion. Doppelte Einzelprojektionen des bewegten Lichts auf Banner,
Feldränder und Start-SVG sind deaktiviert. Die Ornamentmaske des Startlogos ist
wiederhergestellt: Im Hochformat/Desktop gibt es keine goldene Grundfüllung
zwischen den Tapetenornamenten. Telefon-Querformat behält die zuvor gewünschte
deckende Variante. Die Hintergrundreflexion außerhalb des Logos bleibt sichtbar.

Im bewegten Licht werden nur zwei Displayebenen aktualisiert. Bildvorbereitung,
Scrollglättung, gecachte Geometrie und Pause bei unsichtbarer Seite/reduzierter
Bewegung bleiben erhalten. Lokale Prüfungen kontrollieren Timing, Achsenbindung,
Textaussparung, Maskierung, Ebenenfolge und native Scrollbewegung. Ein direkter
iPhone-Safari-Test und eine Garantie der Bildrate sind nicht möglich.

## Parabolischer Verlauf und Bannerlicht in Version 119

48 Sekunden pro Sequenz, Spitzenwert 18 Achten pro Sekunde. Das Verhältnis
8:1 bezeichnet Maximum zu Minimum (18 zu 2,25). Die Geschwindigkeit folgt
einer symmetrischen Parabel; deren analytische Integration ergibt genau
612 Achten pro Schleife ohne Positionssprung. Zeitliche Glättung bleibt aktiv.

Beide bewegten Lichtquellen beleuchten den Banner, zusätzlich zum bestehenden
scrollabhängigen Startlicht. Die hintere Quelle wird in den vorhandenen
Ornament- und Randmasken projiziert; der obere Banner wird nicht mehr aus der
Vordergrundreflexion ausgespart. Inhaltstext und Unternehmenslogos bleiben
geschützt. Keine Füllung der transparenten Zwischenräume des Startlogos.

Die rechteckige Antipp-Hervorhebung der Menülinks entfällt. Tastaturfokus
bleibt durch Unterstreichung erkennbar. Lokale Quell- und Animationstests;
kein direkter iPhone-Test.

## Kontinuierliche Lichtflächen in Version 120

Die rechteckigen Text-/Bild-Aussparungen wurden vollständig entfernt. Die
Vordergrundreflexion liegt über den Hintergrund- und Hauptlogos, unter der
Inhaltsebene. Text und Partnerbilder bleiben unbeleuchtet, ohne dunkle Kästen
in ihrem Hintergrund. Goldränder und Tapeten erhalten dieselbe Reflexion in
ihren bestehenden Formmasken. Das transparente Startlogo erhält nur auf
Ornamenten und Konturen Licht. Beide Quellen erreichen die Banner.

48 Sekunden, Start/Ende im Stillstand, Spitze 8 Achten und Lichtrotationen
pro Sekunde. Eine glatte Kurve aus Sinuspotenzen hält die Geschwindigkeit
während mindestens 88 Prozent der Zeit unter 28 Prozent des Maximums.
Exakt 36 Durchläufe schließen die Schleife ohne Sprung. Die hintere Quelle
verwendet zusätzlich die Scrollachse der Hauptlogos. Native Scrollbewegung
und Logozeichenengine bleiben erhalten. Keine Layoutmessungen pro Lichtbild.

Lokale Timing-, Masken- und Scrollprüfungen; kein direkter iPhone-Test.

## Zurück auf Version 120: achsengebundenes Achterlicht in Version 122

Diese Ausgabe basiert vollständig auf Version 120. Die zwei Konturlichter
und das Timing aus Version 121 sind nicht enthalten. Die bestehende
48-Sekunden-Kurve mit maximal 8 Achten pro Sekunde bleibt erhalten.

Die Mitte der Achterbahn folgt nun dem tatsächlichen gezeichneten Zentrum
des vordersten Hauptlogos. Die lokale Achterbahn rotiert ausschließlich mit
dem geglätteten Scrollwinkel aller acht Hauptlogos. Die zusätzliche Rotation
durch die zeitliche Lichtphase entfällt. Die hintere Lichtebene bleibt hinter
dem hintersten Hauptlogo. Vordergrundreflexion, Bannerprojektion und Start-SVG
verwenden denselben achsengebundenen Punkt. Keine neuen Layoutmessungen je Bild.

Das bewegte Achterlicht hat überall 88 Prozent Quellensichtbarkeit. Das
metallische Standlicht und die übrigen Eigenschaften von v120 bleiben erhalten.
Lokale Prüfungen kontrollieren Pivot, Scrollbindung, Timing und Transparenz.

## Ruhige Achterbewegung und freie Vordergrundreflexion in Version 123

Die letzte Geschwindigkeitsangabe hat Vorrang: konstant eine vollständige
Acht in 8 Sekunden, ohne Beschleunigungswelle oder Stillstand. Die frühere
88-Sekunden-Angabe wird damit ersetzt. Richtung, Phase, Scrollachse und
88 Prozent Quellensichtbarkeit stimmen für beide Lichtebenen überein.

Der vordere Lichtkreis hat ein Achtel des hinteren Durchmessers und liegt
in der Inhaltsebene über dem Tapetenlogo, unter Text und Partnerbildern.
Er ist nicht an die Logoform oder die Tapetenornamente maskiert: Auch die
transparenten Zwischenräume und Bereiche außerhalb des Logorands werden
beleuchtet. Die zusätzliche bewegte SVG-Ornamentprojektion ist deaktiviert,
damit sie die Fläche nicht doppelt aufhellt. Das Startlogo selbst bleibt
transparent. Der hintere Kreis bleibt hinter allen Hauptlogos mit deren
Scrollachse verbunden. Standlicht und Bannerprojektionen bleiben erhalten.

Die Animation pausiert weiterhin bei unsichtbarem Browser-Tab oder aktivierter
Systemeinstellung für reduzierte Bewegung. Keine neuen Layoutmessungen pro Bild.

## Einzelnes großes Achter-Hinterlicht in Version 124

Das bewegte Licht liegt ausschließlich auf einer festen Ebene über dem
untersten Seitenhintergrund und unter sämtlichen Hintergrund-/Hauptlogos,
Tapetenlogo, Bannern, Konturen und Texten. Vorderlicht und direkte bewegte
Reflexionsprojektionen auf den Goldflächen entfallen. Dadurch kommt das
Achterlicht nun von hinten; deckende Oberflächen verdecken es entsprechend.
Die transparenten Bereiche und dünnen Konturen liegen vor dem Lichtfeld.

Der bisherige hintere Kreisradius von 920 SVG-Einheiten ist vervierfacht
auf 3680. Eine vollständige Acht dauert konstant 16 statt 8 Sekunden.
Sichtbarkeit 88 Prozent. Der geglättete Drehwinkel und das tatsächliche
Zentrum des vordersten Hauptlogos bleiben die Achse der Achterbahn.
Das separate positionsabhängige metallische Standlicht bleibt erhalten.

## Reines weiches Licht in Version 125

Metallische Glanzstreifen und der schmale Reflexionskern sind deaktiviert.
Goldflächen erhalten nur eine breite, diffuse weiß-cremefarbene Beleuchtung.
Die Basisfarbe bleibt erhalten. Ein festes weiches Hintergrundlicht deckt den
gelb markierten Bereich vom Banner über das Startlogo bis zum ersten Feld
dauerhaft ab; die rote Markierung wird nicht als Grenze verwendet. Das Licht
wird weder beim Scrollen noch durch die Achterbewegung ausgeschaltet.

Die feste Lichtquelle hat 88 Prozent Sichtbarkeit mit breitem gleichmäßigem
Innenbereich und weichem Außenabfall. SVG und CSS verwenden das gleiche Profil.
Die transparenzmaskierten Ornamente bleiben transparent. Das bestehende
Achter-Hinterlicht läuft weiterhin mit 16 Sekunden pro Runde, vierfachem
Durchmesser und der Scrollachse der Hauptlogos. Texte bleiben unbeleuchtet.

## Gelb markierte Fläche statt Konturbeleuchtung in Version 126

Die direkte Aufhellung der goldenen Linien und Ornamentfüllungen ist entfernt.
Linien und Tapeten behalten ihre Grundfarbe. Das weiche Standlicht liegt nun
als flächige Reflexion über dem Startlogo und den Hintergrundflächen, unter
Text und Partnerbildern. Auch transparente Lücken und Bereiche außerhalb
der Logoform erhalten Licht. Im oberen Banner ergänzt eine entsprechende
Flächenebene das Licht über dem gesamten Hintergrund statt nur im Muster.

Eine breite weich auslaufende Flächenmaske orientiert sich an der gelben
Markierung des Screenshots; die rote Linie ist keine Begrenzung. Es gibt keine
rechteckigen Textaussparungen. Die 88-Prozent-Quelle bleibt beim Scrollen
aktiv; Achter-Hinterlicht und Logo-Rotationsbindung bleiben unverändert.

## Sämtliches Licht entfernt in Version 127

Alle bewegten und festen Lichtflächen sowie die Beleuchtung im Banner und
Startlogo sind entfernt. Lichtgradienten und deren SVG-Gruppen sind gelöscht.
Das Licht-Animationsskript wird nicht mehr geladen und ist nicht im ZIP.
Die Goldfarben sind statisch; Transparenz, Tapeten, Konturen, Textdarstellung,
Scrollmasken und scrollabhängige Logo-Rotation bleiben erhalten. Das vorhandene
Rahmen-/Maskenskript dient nur noch der statischen Darstellung und Geometrie.

## Sonnengold aus dem Foto in Version 128

Feldränder, Linien, Bannerkonturen sowie die Tapetenornamente im Banner und
Startlogo verwenden #C2B594. Ausgangspunkt ist die Medianfarbe RGB(243,226,185)
aus 93471 goldenen Randpixeln des Sonnenbereichs im bereitgestellten Foto.
Die RGB-Werte sind um 20 Prozent abgedunkelt, damit die Farbe sichtbar und
nicht zu hell bleibt. Cremehintergrund und dunkle Textfarbe bleiben erhalten.
Alle Farben sind statisch. Es gibt weiterhin keine Lichteffekte.
