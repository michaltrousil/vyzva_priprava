# Přehled cviků - Výzva Příprava

Tento soubor obsahuje texty zobrazované u jednotlivých cviků.
Pro změnu v aplikaci je potřeba upravit `js/app.js` - objekt EXERCISES.

---

## Pondělí - Protažení po tréninku
**Doba trvání:** 10-15 minut
**Body:** 2

### Popis cvičení:
- Protažení zádových svalů
- Protažení nohou (hamstringy, lýtka)
- Uvolnění kyčlí
- Protažení ramen a paží

### YouTube video:
*(doplnit URL)*

---

## Úterý - Core posilka
**Doba trvání:** 10-15 minut
**Body:** 2

### Popis cvičení:
- Plank 3x30s
- Bicykl 3x20 opakování
- Ruský twist 3x15 na stranu
- Dead bug 3x10 na stranu

### YouTube video:
*(doplnit URL)*

---

## Středa - Protažení po tréninku
**Doba trvání:** 10-15 minut
**Body:** 2

### Popis cvičení:
- Protažení zádových svalů
- Protažení nohou (hamstringy, lýtka)
- Uvolnění kyčlí
- Protažení ramen a paží

### YouTube video:
*(doplnit URL)*

---

## Čtvrtek - Core posilka
**Doba trvání:** 10-15 minut
**Body:** 2

### Popis cvičení:
- Plank 3x30s
- Bicykl 3x20 opakování
- Ruský twist 3x15 na stranu
- Dead bug 3x10 na stranu

### YouTube video:
*(doplnit URL)*

---

## Pátek - Švihadlo full trénink
**Doba trvání:** 1000+ přeskoků
**Body:** 1 bod za 300 skoků (max 5 bodů za 1500 skoků)

### Popis cvičení:
- Základní přeskoky
- Střídavé nohy
- Dvojšvihy (pokročilí)
- Cíl: minimálně 1000 přeskoků

### YouTube video:
*(doplnit URL)*

---

## Sobota - Švihadlo full trénink
**Doba trvání:** 1000+ přeskoků
**Body:** 1 bod za 300 skoků (max 5 bodů za 1500 skoků)

### Popis cvičení:
- Základní přeskoky
- Střídavé nohy
- Dvojšvihy (pokročilí)
- Cíl: minimálně 1000 přeskoků

### YouTube video:
*(doplnit URL)*

---

## Neděle - Core posilka
**Doba trvání:** 10-15 minut
**Body:** 2

### Popis cvičení:
- Plank 3x30s
- Bicykl 3x20 opakování
- Ruský twist 3x15 na stranu
- Dead bug 3x10 na stranu

### YouTube video:
*(doplnit URL)*

---

## Jak upravit texty v aplikaci

1. Otevřete `js/app.js`
2. Najděte objekt `EXERCISES` (řádky 20-110)
3. Upravte pole `description` u příslušného dne:

```javascript
monday: {
    name: 'Protažení po tréninku',
    type: 'stretching',
    duration: '10-15 minut',
    points: 2,
    inputType: 'minutes',
    inputLabel: 'Počet minut',
    videoUrl: null, // Doplnit YouTube URL
    description: [
        'Protažení zádových svalů',
        'Protažení nohou (hamstringy, lýtka)',
        'Uvolnění kyčlí',
        'Protažení ramen a paží'
    ]
},
```

4. Pro přidání videa změňte `videoUrl: null` na:
```javascript
videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
```
