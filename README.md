# Výzva Příprava

Webová aplikace pro sledování týdenní tréninkové výzvy pro Atletiku Líbeznice.

## Funkce

- Denní výzvy podle dne v týdnu (protažení, core, švihadlo)
- Zadávání splnění s počtem minut/skoků a poznámkou
- Žebříček s body za splněné výzvy
- Responzivní design pro mobily
- Data uložena v Google Sheets

## Denní rozvrh

| Den | Cvičení | Body |
|-----|---------|------|
| Pondělí | Protažení po tréninku (10-15 min) | 2 |
| Úterý | Core posilka (10-15 min) | 2 |
| Středa | Protažení po tréninku (10-15 min) | 2 |
| Čtvrtek | Core posilka (10-15 min) | 2 |
| Pátek | Švihadlo full trénink (1000+ přeskoků) | až 5 |
| Sobota | Švihadlo full trénink (1000+ přeskoků) | až 5 |
| Neděle | Core posilka (10-15 min) | 2 |

**Bodování švihadla:** 1 bod za každých 300 skoků, maximum 1500 skoků = 5 bodů

## Instalace

### 1. Google Sheets

Použijte existující tabulku s listem "Atleti" nebo vytvořte novou:

1. Jděte na [Google Sheets](https://sheets.google.com)
2. Vytvořte list **"Atleti"** (pokud neexistuje):
   - Buňka A1: `Jméno`
   - Pod ní přidejte jména atletů
3. List **"Priprava"** se vytvoří automaticky
4. Zkopírujte **ID tabulky** z URL

### 2. Google Apps Script

1. V Google Sheets otevřete **Rozšíření > Apps Script**
2. Vložte kód ze souboru `google-apps-script/Code.gs`
3. Nahraďte `'VLOŽTE_ID_VAŠÍ_TABULKY'` skutečným ID
4. **Nasadit > Nové nasazení**:
   - Typ: Webová aplikace
   - Spustit jako: Já
   - Kdo má přístup: Kdokoli
5. Autorizujte a zkopírujte URL

### 3. Frontend

1. Otevřete `js/app.js`
2. Nahraďte `'VLOŽTE_SVOU_GOOGLE_APPS_SCRIPT_URL'` zkopírovanou URL
3. (Volitelné) Přidejte YouTube URL do EXERCISES objektu

### 4. Hosting

**Vercel:**
```bash
npm i -g vercel
vercel
```

**GitHub Pages:**
1. Nahrajte na GitHub
2. Settings > Pages > Deploy from branch

**Lokálně:**
```bash
npx serve .
```

## Přidání videí k cvikům

V `js/app.js` upravte `videoUrl` v EXERCISES:

```javascript
monday: {
    name: 'Protažení po tréninku',
    videoUrl: 'https://www.youtube.com/embed/VAŠE_VIDEO_ID',
    // ...
}
```

## Struktura projektu

```
vyzva_priprava/
├── index.html
├── css/style.css
├── js/app.js
├── google-apps-script/Code.gs
└── README.md
```

## Technologie

- HTML5, CSS3, Vanilla JavaScript
- Google Sheets + Google Apps Script
