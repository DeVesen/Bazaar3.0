# Identität, Anmeldung, Rollen und Rechte

Status: Entwurf · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [leitplanken](../leitplanken.md) (L7) · [zielbild](../architektur/zielbild.md)
Entscheidungen: E8, E11, E22, E24, E25
Schlagworte: Login, Anmeldung, Konto, Rolle, Rechte-Matrix, Admin, Basar-Team, Kassenpersonal, Verkäufer, Händler, Laufkunde, Einladung, Token, Passwort, Role-Toggle

## Zweck und Abgrenzung

Hier steht, wer sich wie anmeldet, welche Rollen es gibt und die **eine Rechte-Matrix** der Suite. Wie die
Oberfläche aussieht (Login-Seite, Shell), regelt [ui-grundlagen](ui-grundlagen.md).

## Heute

| | Voranmeldung | Haupt-App |
|---|---|---|
| Konten | Verkäufer, Selbstregistrierung oder Einladung; Admin = Verkäufer mit `isAdmin` | eigene Benutzer, angelegt vom Admin |
| Anmeldung | E-Mail + Passwort, Token 5 Tage + Refresh 30 Tage | Benutzername + Passwort, Token 16 h |
| Rollen | admin, seller; Role-Toggle für Admins | admin, cashier; **kein** Toggle (bewusst) |
| Rechte-Matrix | `advance-registration/spec.md` §4 | `bazaar-app/spec.md` §4.1 |
| Verkäufer-Kennung | 8-stellige ID als QR im Profil, scannt die Haupt-App | – |

## Ziel

### Ein Kontenbestand (E11)

| Rolle | Wer | Anmeldung | Frontend |
|---|---|---|---|
| **Verkäufer** | Privatperson oder Händler (Unterschied über den Verkäufer-Typ) | E-Mail + Passwort, Selbstregistrierung oder Einladung | Voranmeldung (Portal) |
| **Kassenpersonal** | Helfer an Annahme, Kasse, Rückgabe, Abrechnung (Begriff der Haupt-App) | Benutzername + Passwort, vom Admin angelegt (wie Haupt-App) | Basar |
| **Admin** | Organisatoren | wie Team | Basar + Voranmeldung (Verwaltung) |
| *Laufkunde* | Verkäufer **ohne** Login | – (Konto auf Wunsch per Einladung, E8) | – |
| *Anonym* | Interessenten | keine | Katalog |

- **Mehrere Rollen je Person** sind möglich, z. B. eine Helferin, die selbst verkauft. **Kein Role-Toggle (E22, wie Haupt-App).** Die Person nutzt das passende Frontend: Portal als Verkäufer, Basar als Team bzw. Admin.
- **Sicherheit:**
  - kurze Token-Laufzeit mit Erneuerung
  - Schutz gegen Passwort-Raten (Rate-Limit)
  - getrennte Audiences je Frontend
  - Passwort-Reset per E-Mail für alle Rollen
- Kassenpersonal bekommt auf geteilten Kassengeräten eine angemessene Sitzungsdauer für den Basar-Tag. Abmelden ist leicht. Zu klären ist, ob eine Schnellanmeldung per PIN sinnvoll ist.

### Eine Rechte-Matrix (Skizze, ersetzt beide heutigen)

| Bereich | Verkäufer | Kassenpersonal | Admin |
|---|---|---|---|
| Eigenes Profil, eigene Artikel (Portal) | ✅ nach [Lebenszyklus](artikel-lebenszyklus.md) | – | ✅ |
| Marken/Kategorien lesen und über AutoComplete anlegen | ✅ | ✅ | ✅ |
| Marken/Kategorien/Typen ändern, löschen | – | – | ✅ |
| Annahme, Kasse, Rückgabe, Abrechnung | – | ✅ | ✅ |
| Verkäufer anlegen/bearbeiten (Laufkunden) | – | ✅ | ✅ |
| Kontaktdaten registrierter Verkäufer ändern | eigene | – (E24) | ✅ |
| Konditionen überschreiben | – | – | ✅ |
| Artikel löschen, Abrechnung stornieren | – | – | ✅ |
| Basar anlegen, Termine, Einstellungen, Benutzer | – | – | ✅ |
| Etiketten-Vordruck, Bogenformate | – | – | ✅ |
| Statistik | eigene Ergebnisse | lesen | ✅ |

**Basis ist die Rechte-Matrix der Haupt-App** (`bazaar-app/spec.md` §4.1, E25). Neu sind nur die Verkäufer-Spalte und die Basar-Verwaltung. **Leitgedanke** (Haupt-App): Kassenpersonal darf alles Operative ohne Nachfragen, aber nichts
Zerstörendes und nichts Konfigurierendes. Durchgesetzt wird es im Backend, das Frontend dient nur der Bequemlichkeit.

## Berührungspunkte

- [artikel-lebenszyklus](artikel-lebenszyklus.md): zustandsabhängige Rechte
- [api-konventionen](api-konventionen.md): Auth-Stufen je Endpunkt
- [ui-grundlagen](ui-grundlagen.md): Login-Layout, rollenabhängige Navigation
- [datenschutz](datenschutz.md): Einladung von Laufkunden, Konto-Löschung

## Offene Fragen

1. Darf ein Händler Unterkonten haben, z. B. mehrere Mitarbeiter?
2. Schnellanmeldung an Kassengeräten (PIN)?
3. Die Verkäufer-Kennung als QR: bleibt sie die 8-stellige ID oder wird sie eine kurze Verkäufernummer je Basar?

## Nächste Planungsschritte

- Rechte-Matrix mit der Orga abstimmen. Danach ersetzt sie beide Spec-Matrizen.
