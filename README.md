# Halden Villas — Miami (site model)

Site de prezentare pentru o agenție care vinde vile în Miami, de la 1.000.000 €. Doar HTML și CSS, fără JavaScript și fără build. Conținutul site-ului e în engleză.

## Pagini
| Fișier | Ce conține |
|---|---|
| `index.html` | Prima pagină: vilele recomandate, despre noi, recenzii, contact |
| `villas.html`, `villas-2.html` | Toate cele 12 vile, câte 6 pe pagină |
| `villas/<nume>.html` | O pagină pentru fiecare vilă: galerie, detalii, formular de vizionare |
| `about.html` | Povestea firmei, echipa, toate recenziile |
| `contact.html` | Telefon, WhatsApp, email, adresă, program, formular |
| `css/style.css` | Tot designul (charcoal și tonuri calde) |

## De făcut înainte de lansare
1. **Formularul**: creează un formular gratuit pe [formspree.io](https://formspree.io) și înlocuiește `https://formspree.io/f/your-form-id` cu adresa ta în toate fișierele HTML (căutare și înlocuire în editor).
2. **Datele de contact**: înlocuiește telefonul `+1 (305) 555-0148`, numărul de WhatsApp `13055550148`, emailul `hello@haldenvillas.example` și adresa.
3. **Vilele și pozele**: textele, prețurile și pozele (de pe Unsplash) sunt exemple. Înlocuiește-le în paginile din `villas/` și pe cardurile din `index.html` și `villas*.html`.

## Publicare
GitHub Pages: în repository, la Settings → Pages, alege ramura și folderul rădăcină. Sau trage folderul proiectului pe app.netlify.com/drop.
