---
status: draft
updated: 2026-08-17
---

# Component: verkaeufer-nummer

## Kontext

Karte, die dem eingeloggten Verkäufer **seine eigene Verkäufernummer** zeigt —
im Klartext und als QR-Code. Bis hierher war die Nummer nur für den Admin in der
Verkäuferliste sichtbar; der Verkäufer selbst kannte sie nicht.

**Angezeigter Wert:** die Verkäufer-`id` (8 Zeichen, alphanumerisch,
case-sensitive — siehe [`entities/verkaeufer.md`](../../entities/verkaeufer.md)).
**Nicht** die `startNumber` aus der Admin-Spalte „Nr.": die ist der `fromNumber`
des ersten Nummernblocks, `null` solange kein Block existiert, und verschiebt
sich, wenn der Admin Blöcke umverteilt ([`api/sellers.md`](../../api/sellers.md)
Abschnitt „startNumber"). Die `id` ist stabil, immer vorhanden und genau der
Wert, den der Scanner der Haupt-App erwartet
([seller-search](../../../../components/seller-search/component.md) Scan-Modus).

Einsatzorte:

| Ort | Darstellung |
|---|---|
| [Epic_Home_Verkaeufer](../../epics/Epic_Home_Verkaeufer/epic.md) | volle Karte mit QR 128 px |
| [Epic_Profil](../../epics/Epic_Profil/epic.md), Panel 01 | dieselbe Karte, rechts neben den Personendaten |

**Verworfen: Inline-Variante im Anlege-Dialog.** Eine zweite, kompakte Variante
(Nummer als Zeile + QR 72 px) stand im Artikel-Anlege-Dialog, damit der Verkäufer
beim Etikettieren beide Nummern zusammen sieht. Wieder entfernt: sie kostet die
oberste Dialog-Zeile und bringt Rauschen in ein Formular, in dem es ums Erfassen
geht. Die Nummer ändert sich nie — Home und Profil zeigen sie dauerhaft, einmal
merken oder kopieren genügt. Es gibt daher **nur eine** Darstellung, kein
`variant`-Input.

```
┌─────────────────────────────────────┐
│ MEINE VERKÄUFERNUMMER               │  ← Panel-Titel, 11 px, 700, uppercase
│                                     │
│   a3f9c2d1        ┌──────────┐      │  ← Wert: 24 px, 800, monospace
│   [⧉ Kopieren]    │ ▀▄▀ █▀▄  │      │
│                   │ █ ▄▀▀▄ █ │      │  ← Shared qr-code, size 128
│                   └──────────┘      │
│ Am Basar-Tag vorzeigen — das         │  ← Hinweistext, 12 px, muted
│ Kassenpersonal scannt den Code.      │
└─────────────────────────────────────┘
```

## Aufbau

| Element | Component |
|---|---|
| Container | [card](../../../../components/card/component.md), Panel-Block-Variante (`background: #f5f9f6; border: 1px solid #d4e8dc; border-radius: 8px; padding: 15px 16px`) |
| Panel-Titel „Meine Verkäufernummer" | Text, 11 px, 700, uppercase, `#3a7057` |
| Nummer | Text, monospace, `--primary`, 24 px/800 |
| QR-Code | Shared [qr-code](../../../../components/qr-code/component.md), `value` = `id`, `size="128"` |
| Kopieren-Button | [Button](../../../../components/button/component.md) `secondary outlined small`, Icon ⧉ → Clipboard + [Toast](../../../../components/toast/component.md) „✓ Nummer kopiert" |
| Hinweistext | 12 px, muted |

Die Caption des QR-Codes bleibt leer — die Nummer steht daneben schon im
Klartext, zweimal derselbe String wäre Rauschen.

## Schnittstelle

| Property | Typ | Art | Beschreibung |
|---|---|---|---|
| `sellerId` | `string` | `@Input` (required) | Verkäufer-`id`, vom Parent hereingegeben |

Leaf-Komponente: kein Store, kein HTTP
([overview.md](../overview.md), Abschnitt „Integration vs. Leaf").

## Datenherkunft

**Kein neues Feld, keine Migration, kein neuer Endpoint.** Die Page liest die
`id` aus dem `sub`-Claim des Access-Tokens über den `AuthService` (`core/`) und
gibt sie per `input()` herein. `GET /api/profile` liefert `id` ebenfalls bereits
mit ([`api/profile.md`](../../api/profile.md) Abschnitt 1) — die Profil-Seite
kann den Wert von dort nehmen, statt zwei Quellen zu mischen.

## Akzeptanzkriterien

Siehe [Epic_Home_Verkaeufer](../../epics/Epic_Home_Verkaeufer/epic.md) AC-4/AC-5
und [Epic_Profil](../../epics/Epic_Profil/epic.md) AC-9 — diese Datei ist die
Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #verkäufernummer #qr-code #home #profil #primeng
