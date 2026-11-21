# Azure & Palm — Miami Luxury Real Estate

Site de prezentare premium pentru o agenție imobiliară de lux din Miami. Static (HTML + CSS + JS vanilla), fără build și fără dependențe.

## Funcționalități
- **Hero** pe tot ecranul, cu fotografie și căutare rapidă (cartier, tip, buget)
- **12 proprietăți** cu fotografii, prețuri, dormitoare/băi/suprafață, insigne „Nou” și „Waterfront”
- **Filtre**: text liber, cartier, tip, preț min/max, dormitoare, băi, pe malul apei, noi pe piață, favorite (salvate în browser), sortare
- **Fereastră de detalii** cu galerie (săgeți, miniaturi, tastatură, swipe pe mobil) și buton „Programează o vizionare” care completează automat formularul
- **Cartiere** (Miami Beach, Brickell, Coral Gables, Key Biscayne, Fisher Island, Coconut Grove): un click filtrează proprietățile
- Secțiunile **Despre noi**, **Echipă** și **Testimoniale**
- **Formular de contact** cu validare, protecție anti-spam (honeypot) și mesaje de confirmare
- **Bilingv RO / EN**, design responsive, animații discrete (respectă `prefers-reduced-motion`)

## Rulare
Deschide `index.html` în browser sau pornește un server local:
```bash
python3 -m http.server 8000   # apoi http://localhost:8000
```

## Personalizare
- **Proprietăți**: `js/data.js` (`PROPERTIES`, `NEIGHBORHOODS`). Fotografiile vin de pe Unsplash prin ID.
- **Texte / traduceri**: `js/i18n.js`
- **Culori și fonturi**: variabilele CSS din `:root`, în `css/styles.css`
- **Primirea mesajelor din formular**: setează `FORM_ENDPOINT` în `js/main.js` (de ex. un URL Formspree). Dacă rămâne gol, formularul doar simulează trimiterea.

> Proprietățile, prețurile, agenții și datele de contact sunt fictive și au rol demonstrativ.
