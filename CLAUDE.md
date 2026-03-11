# CLAUDE.md - Výzva Příprava

## O projektu

Webová aplikace pro sledování týdenní tréninkové výzvy pro Atletiku Líbeznice. Každý den v týdnu má specifický cvik, atleti zaznamenávají splnění a sbírají body.

**Produkční URL:** https://vyzva-priprava.vercel.app/

## Technologie

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Google Apps Script (sdílený se svihadlo výzvou)
- **Databáze:** Google Sheets (sdílená tabulka "švihadlo výzva")
- **Hosting:** Vercel

## Architektura

Aplikace používá **sdílený Google Apps Script** s projektem svihadlo-vyzva:
- API URL: `https://script.google.com/macros/s/AKfycbxXpe4SUXtP9CwENx9EMKE6BEhuJ4MfJBsZ_k6QltiBPvQF2QK0_uQEDCixUQ1xUPbx/exec`
- Parametr `version=priprava` rozlišuje tuto výzvu od švihadla
- Sdílený list "Atleti", samostatný list "Priprava" pro data

## Struktura projektu

```
vyzva_priprava/
├── index.html              # Hlavní SPA stránka (3 pohledy)
├── css/style.css           # Styly (barvy Atletiky Líbeznice)
├── js/app.js               # Aplikační logika
├── cviky.md                # Přehled textů cviků (pro editaci)
├── CLAUDE.md               # Tento soubor
└── README.md               # Uživatelská dokumentace
```

## Klíčové soubory

- `js/app.js:7` - API_URL pro Google Apps Script
- `js/app.js:20-110` - EXERCISES konfigurace cviků (názvy, popisy, YouTube URL)
- `js/app.js:143-147` - calculateJumpropePoints() - bodování švihadla
- `cviky.md` - Přehledný seznam textů pro cviky

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

Sdílená tabulka: **švihadlo výzva**

### List "Atleti" (sdílený s ostatními výzvami)
| Jméno |
|-------|
| Jméno atleta |

### List "Priprava"
| Datum | Jméno | Typ cviku | Splněno | Hodnota | Poznámka | Body | Čas zápisu |
|-------|-------|-----------|---------|---------|----------|------|------------|
| 2026-03-11 | Petra | core | ANO | 15 | Super trénink! | 2 | 2026-03-11 18:30:00 |

## API Endpoints

Všechny endpointy používají parametr `version=priprava`:

| Endpoint | Popis |
|----------|-------|
| `?action=getAthletes&version=priprava` | Seznam atletů |
| `?action=getLeaderboard&version=priprava` | Žebříček |
| `?action=getEntry&version=priprava&athlete=X&date=Y` | Existující záznam |
| `?action=saveEntry&version=priprava&...` | Uložit splnění |
| `?action=getDebug&version=priprava` | Debug info |

## Úprava textů cviků

Texty cviků jsou v souboru `cviky.md` pro přehlednost.
Pro změnu v aplikaci upravte `js/app.js` - objekt EXERCISES:

```javascript
monday: {
    name: 'Protažení po tréninku',
    description: [
        'Protažení zádových svalů',
        'Protažení nohou (hamstringy, lýtka)',
        // ...
    ],
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
}
```

## Přidání YouTube videí

V souboru `js/app.js` v objektu EXERCISES upravte `videoUrl`:

```javascript
monday: {
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
}
```

## Časté úpravy

### Změna bodování
- Fixní body: `js/app.js` - `points` v EXERCISES
- Švihadlo: `js/app.js:143-147` - `calculateJumpropePoints()`

### Změna popisu cvičení
1. Upravit `cviky.md` pro přehled
2. Zkopírovat změny do `js/app.js` - `description` pole v EXERCISES

### Změna barev
Upravit CSS proměnné v `css/style.css:1-17`

## Google Apps Script

Kód je sdílený s projektem svihadlo-vyzva:
- Soubor: `svihadlo-vyzva/google-apps-script/Code.gs`
- Obsahuje routing pro obě výzvy (`version=svihadlo` a `version=priprava`)
- Změny v GAS je potřeba nasadit jako novou verzi
