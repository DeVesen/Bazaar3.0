# Insel-Deployment mit SSL (mkcert)

Diese Anleitung beschreibt die Einrichtung der Bazaar-App für den Betrieb in einer lokalen LAN-Umgebung (Insel-Betrieb) mit selbstsigniertem SSL-Zertifikat via **mkcert**.

## 1. mkcert installieren

Installiere das Tool `mkcert` auf dem Rechner, auf dem die Bazaar-App laufen soll:

**Windows:**
```
choco install mkcert
```
Oder alternativ mit Scoop:
```
scoop install mkcert
```

**macOS:**
```
brew install mkcert
```

**Linux:**
Folge der offiziellen mkcert-Dokumentation (https://github.com/FiloSottile/mkcert) — üblicherweise durch Download des vorkompilierten Binaries oder via Paketmanager (z. B. `apt`, `yum`, `pacman`).

## 2. Root-CA erzeugen und ins System installieren

Führe den folgenden Befehl aus, um die lokale Root-Zertifizierungsstelle (CA) zu erzeugen und in den System-Zertifikatsspeicher zu installieren:

```
mkcert -install
```

Dieser Befehl erstellt eine lokale CA und importiert das Root-Zertifikat automatisch in dein Betriebssystem (Windows: Zertifikatsspeicher; macOS: Keychain; Linux: systemabhängig). Du wirst ggf. nach Administratorrechten gefragt.

## 3. Zertifikat für Hostname und LAN-IP generieren

Bestimme zuerst die LAN-IP-Adresse des Basar-Rechners:

- **Windows:** `ipconfig` im Terminal ausführen und die IPv4-Adresse unter dem relevanten Netzwerkadapter notieren (typischerweise `192.168.x.y`).
- **macOS/Linux:** `ifconfig` oder `ip addr` ausführen.

Führe dann mkcert mit dem Hostname und der LAN-IP aus:

```
mkcert bazaar.local 192.168.x.y
```

Ersetze `192.168.x.y` durch die tatsächliche LAN-IP-Adresse deines Rechners.

mkcert erzeugt daraufhin zwei Dateien mit Namen wie `bazaar.local+1.pem` und `bazaar.local+1-key.pem`. Der genaue Name hängt davon ab, wie viele Zertifikate du bereits für diese Domains erzeugt hast.

Lege zunächst das Zielverzeichnis an, falls es noch nicht existiert, und verschiebe die Dateien anschließend in das `nginx/certs/` Verzeichnis und benenne sie um:

```
mkdir -p nginx/certs
mv bazaar.local+1.pem nginx/certs/bazaar.pem
mv bazaar.local+1-key.pem nginx/certs/bazaar-key.pem
```

Falls die Dateinamen abweichen (z. B. `bazaar.local+2.pem`), passe die Befehle entsprechend an.

## 4. Root-CA auf LAN-Endgeräten importieren

Die Root-CA muss auf allen Geräten im LAN importiert werden, die auf die Bazaar-App zugreifen sollen, damit deren Browser die Zertifikate als vertrauenswürdig akzeptieren.

Finde den Pfad zur Root-CA-Datei:

```
mkcert -CAROOT
```

Dieser Befehl gibt das Verzeichnis aus, in dem die CA-Dateien liegen. Die Datei heißt `rootCA.pem`.

**Android:**
- Verbinde dich mit dem Basar-LAN.
- Öffne die Dateimanager-App und navigiere zu der Root-CA-Datei (`rootCA.pem`).
- Tippe auf die Datei; Android öffnet einen Dialog zur Zertifikatsverwaltung.
- Wähle „Vertrauenswürdiges Zertifikat installieren" oder ähnlich.
- Gib einen Namen für das Zertifikat ein (z. B. „Bazaar Local CA") und bestätige.

**iOS:**
- Verbinde dich mit dem Basar-LAN.
- Übertrage die `rootCA.pem` auf das iOS-Gerät (z. B. per E-Mail, AirDrop oder Cloud-Speicher).
- Öffne die Datei; iOS fordert zur Zertifikatsverwaltung auf.
- Gehe zu *Einstellungen* → *Allgemein* → *VPN und Geräteverwaltung* → *Vertrauenswürdige Root-Zertifikate*.
- Das neu installierte Zertifikat sollte dort erscheinen; schalte es ggf. explizit auf *vertrauenswürdig*.

**Windows:**
- Übertrage die `rootCA.pem` auf den Windows-Rechner im LAN.
- Öffne die Datei mit einem Doppelklick; der Windows-Zertifikatsimporteur öffnet sich.
- Wähle *Zertifikat installieren...* → *Lokaler Computer* → *Vertrauenswürdige Stammzertifizierungsstellen*.
- Folge dem Assistenten und bestätige die Installation (ggf. mit Administratorrechten).

## 5. Startbefehl für den Insel-Betrieb

Bevor du die Bazaar-App startest, stelle sicher, dass die Umgebungsvariablen in `.env` korrekt gesetzt sind. Kopiere dazu `.env.example` und befülle alle erforderlichen Variablen:

```
cp .env.example .env
```

Bearbeite `.env` und trage die Werte für `LOCAL_HOSTNAME`, Datenbankpasswörter und weitere notwendige Parameter ein (siehe `.env.example` für Dokumentation). Ersetze dabei insbesondere `POSTGRES_PASSWORD`, `Jwt__Secret` und die übrigen sicherheitsrelevanten Platzhalterwerte zwingend durch echte, eigene Werte, bevor der erste Start erfolgt — die Beispielwerte aus `.env.example` sind nur zur Dokumentation gedacht und dürfen nicht produktiv verwendet werden.

Starte dann die Docker-Compose-Services mit dem folgenden Befehl:

```
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d
```

Dieser Befehl startet die Bazaar-App (Frontend + Backend) und die lokale Datenbank im Hintergrund. Der `-f docker-compose.local.yml`-Overlay stellt sicher, dass die nginx-SSL-Konfiguration und die zertifikatsgestützten Ports verwendet werden.

## 6. Gültige Zugriffadressen

Nach dem erfolgreichen Start sind folgende Adressen für den Zugriff auf die Bazaar-App verfügbar:

1. **Hostname:** `https://bazaar.local` (bzw. der in `.env` als `LOCAL_HOSTNAME` konfigurierte Hostname)
2. **LAN-IP:** `https://192.168.x.y` (wobei `192.168.x.y` durch die tatsächliche LAN-IP des Basar-Rechners ersetzt wird)

Beide Adressen sind gleichwertig und funktionieren auf allen Endgeräten im LAN, die die Root-CA importiert haben. Der Browser zeigt das Zertifikat als vertrauenswürdig an, ohne Sicherheitswarnungen.

**Hinweis zur Namensauflösung:** mkcert erzeugt ausschließlich das SSL-Zertifikat, aber keine Namensauflösung. Damit `https://bazaar.local` (bzw. der konfigurierte `LOCAL_HOSTNAME`) auf LAN-Endgeräten tatsächlich funktioniert, muss der Hostname zusätzlich entweder als DNS-Eintrag im Router hinterlegt oder per mDNS/Bonjour bereitgestellt werden. Ohne eine dieser Maßnahmen ist auf den Endgeräten nur der Zugriff über die LAN-IP (`https://192.168.x.y`) möglich.
