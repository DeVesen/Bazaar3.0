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

| Ort | Variante |
|---|---|
| [Epic_Home_Verkaeufer](../../epics/Epic_Home_Verkaeufer/epic.md) | `card` — volle Karte mit QR 128 px |
| [Epic_Profil](../../epics/Epic_Profil/epic.md), Panel 01 | `card` — dieselbe Karte, rechts neben den Personendaten |
| [artikel-dialog.md](../forms/artikel-dialog.md), Modus „Anlegen" | `inline` — Nummer als Zeile + QR 72 px |

```
Variante "card":
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

Variante "inline" (im Anlege-Dialog):
Verkäufernummer  a3f9c2d1   ┌────┐
                            │▀▄▀ │  ← size 72
                            └────┘
```

## Aufbau

| Element | Component | card | inline |
|---|---|---|---|
| Container | [card](../../../../components/card/component.md), Panel-Block-Variante (`background: #f5f9f6; border: 1px solid #d4e8dc; border-radius: 8px; padding: 15px 16px`) | ✅ | ❌ (nackte Zeile im Dialog-Grid) |
| Panel-Titel „Meine Verkäufernummer" | Text, 11 px, 700, uppercase, `#3a7057` | ✅ | Label 13 px, muted, statt Panel-Titel |
| Nummer | Text, monospace, `--primary`; 24 px/800 (card) bzw. 14 px/700 (inline) | ✅ | ✅ |
| QR-Code | Shared [qr-code](../../../../components/qr-code/component.md), `value` = `id` | `size="128"` | `size="72"` |
| Kopieren-Button | [Button](../standard/button.md) `secondary outlined small`, Icon ⧉ → Clipboard + [Toast](../standard/toast.md) „✓ Nummer kopiert" | ✅ | ❌ |
| Hinweistext | 12 px, muted | ✅ | ❌ |

Die Caption des QR-Codes bleibt leer — die Nummer steht daneben schon im
Klartext, zweimal derselbe String wäre Rauschen.

## Schnittstelle

| Property | Typ | Art | Beschreibung |
|---|---|---|---|
| `sellerId` | `string` | `@Input` (required) | Verkäufer-`id`, vom Parent hereingegeben |
| `variant` | `'card' \| 'inline'` | `@Input`, Default `'card'` | Darstellungsform |

Leaf-Komponente: kein Store, kein HTTP
([overview.md](../overview.md), Abschnitt „Integration vs. Leaf").

## Datenherkunft

**Kein neues Feld, keine Migration, kein neuer Endpoint.** Die Page liest die
`id` aus dem `sub`-Claim des Access-Tokens über den `AuthService` (`core/`) und
gibt sie per `input()` herein. `GET /api/profile` liefert `id` ebenfalls bereits
mit ([`api/profile.md`](../../api/profile.md) Abschnitt 1) — die Profil-Seite
kann den Wert von dort nehmen, statt zwei Quellen zu mischen.

## Akzeptanzkriterien

Siehe [Epic_Home_Verkaeufer](../../epics/Epic_Home_Verkaeufer/epic.md) AC-4/AC-5,
[Epic_Profil](../../epics/Epic_Profil/epic.md) AC-9 und
[Epic_Meine_Artikel](../../epics/Epic_Meine_Artikel/epic.md) AC-9 — diese Datei
ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #verkäufernummer #qr-code #home #profil #artikel-dialog #primeng
