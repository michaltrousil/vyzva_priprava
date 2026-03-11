# CLAUDE.md - Výzva Příprava

## O projektu

Webová aplikace pro sledování týdenní tréninkové výzvy pro Atletiku Líbeznice. Každý den v týdnu má specifický cvik, atleti zaznamenávají splnění a sbírají body.

## Technologie

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Google Apps Script
- **Databáze:** Google Sheets
- **Hosting:** Vercel / GitHub Pages

## Struktura projektu

```
vyzva_priprava/
├── index.html              # Hlavní SPA stránka (3 pohledy)
├── css/style.css           # Styly (barvy Atletiky Líbeznice)
├── js/app.js               # Aplikační logika
├── google-apps-script/
│   └── Code.gs             # Google Apps Script API
├── CLAUDE.md               # Tento soubor
└── README.md               # Uživatelská dokumentace
```

## Klíčové soubory

- `js/app.js:7` - API_URL pro Google Apps Script
- `js/app.js:23-98` - EXERCISES konfigurace cviků (včetně YouTube URL)
- `js/app.js:130-135` - calculateJumpropePoints() - bodování švihadla
- `google-apps-script/Code.gs:12` - SPREADSHEET_ID

## Denní výzvy

| Den | Cvičení | Body |
|-----|---------|------|
| Pondělí | Protažení po tréninku | 2 |
| Úterý | Core posilka | 2 |
| Středa | Protažení po tréninku | 2 |
| Čtvrtek | Core posilka | 2 |
| Pátek | Švihadlo full trénink | 1 bod / 300 skoků (max 5) |
| Sobota | Švihadlo full trénink | 1 bod / 300 skoků (max 5) |
| Neděle | Core posilka | 2 |

**Maximum bodů za týden:** 20 bodů

## Bodovací systém

### Fixní body (Protažení, Core)
- Splnění = 2 body

### Variabilní body (Švihadlo)
- 300 skoků = 1 bod
- 600 skoků = 2 body
- 900 skoků = 3 body
- 1200 skoků = 4 body
- 1500 skoků = 5 bodů (maximum)

## Google Sheets struktura

### List "Atleti" (sdílený s ostatními výzvami)
| Jméno |
|-------|
| Jméno atleta |

### List "Priprava"
| Datum | Jméno | Typ cviku | Splněno | Hodnota | Poznámka | Body | Čas zápisu |
|-------|-------|-----------|---------|---------|----------|------|------------|
| 2026-03-11 | Petra | core | ANO | 15 | Super trénink! | 2 | 2026-03-11 18:30:00 |

## API Endpoints

| Endpoint | Popis |
|----------|-------|
| `?action=getAthletes&version=priprava` | Seznam atletů |
| `?action=getLeaderboard&version=priprava` | Žebříček |
| `?action=getEntry&version=priprava&athlete=X&date=Y` | Existující záznam |
| `?action=saveEntry&version=priprava&...` | Uložit splnění |
| `?action=getDebug&version=priprava` | Debug info |

## Přidání YouTube videí

V souboru `js/app.js` v objektu EXERCISES upravte `videoUrl`:

```javascript
monday: {
    name: 'Protažení po tréninku',
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
    // ...
}
```

## Časté úpravy

### Změna bodování
- Fixní body: `js/app.js` - `points` v EXERCISES
- Švihadlo: `js/app.js:130-135` - `calculateJumpropePoints()`

### Změna popisu cvičení
Upravit `description` pole v EXERCISES objektu v `js/app.js`

### Změna barev
Upravit CSS proměnné v `css/style.css:1-17`

## Nasazení

1. Vytvořit/upravit Google Sheet
2. V Apps Script vložit kód z `Code.gs`
3. Nahradit `SPREADSHEET_ID` skutečným ID
4. Nasadit jako webovou aplikaci
5. V `js/app.js` nastavit `API_URL`
6. Nahrát na hosting (Vercel, GitHub Pages, Netlify)
