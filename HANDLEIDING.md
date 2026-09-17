# Handleiding Boekenbende Sint-Pieters 📚
### Schoolbibliotheek Don Bosco Gent — Campus Sint-Pieters

Welkom bij de handleiding voor het webplatform van onze schoolbibliotheek **Boekenbende Sint-Pieters**. Deze gids is geschreven voor alle collega-leerkrachten (in het bijzonder leerkrachten Nederlands), graadcoördinatoren, secretariaatsmedewerkers en bib-beheerders. Hij legt stap voor stap uit hoe je samen met je leerlingen boeken zoekt, ontleent, inneemt via de Uitleenbalie en hoe het beheer werkt.

> 💡 **Tip voor leerkrachten en secretariaat:** Zoek je enkel een handige, korte gids voor de dagelijkse werking (boeken ontlenen, innemen en klasbeheer)? Bekijk dan de aparte [Handleiding voor Leerkrachten & Secretariaat (Rol 1)](HANDLEIDING_LEERKRACHTEN.md).

---

## Inhoudsopgave

1. [Over het platform & De Twee Rollen](#1-over-het-platform--de-twee-rollen)
2. [Boeken zoeken & Ontdekken met leerlingen](#2-boeken-zoeken--ontdekken-met-leerlingen)
   - [De zoekbalk](#de-zoekbalk)
   - [Filters: Taal, Graad, Thema en Beschikbaarheid](#filters-taal-graad-thema-en-beschikbaarheid)
   - [Snelkeuze-knoppen](#snelkeuze-knoppen)
   - [Carrousels & Thema in de kijker](#carrousels--thema-in-de-kijker)
3. [Boekfiche: Details, Recensies en Beschikbaarheid](#3-boekfiche-details-recensies-en-beschikbaarheid)
   - [Achterflap, recensies & externe links](#achterflap-recensies--externe-links)
   - [Exemplaren en realtime uitleenstatus](#exemplaren-en-realtime-uitleenstatus)
   - [Favorieten en sterrenbeoordeling](#favorieten-en-sterrenbeoordeling)
4. [Snel Uitlenen vanuit de Boekfiche](#4-snel-uitlenen-vanuit-de-boekfiche)
5. [De Uitleenbalie (Rol 1: Leerkrachten & Secretariaat)](#5-de-uitleenbalie-rol-1)
   - [Inloggen met de Leerkrachtcode](#inloggen-uitleenbalie)
   - [Snelle Barcode / ISBN scan (Inleveren of Uitlenen)](#snelle-barcodescan)
   - [Nieuwe uitlening handmatig registreren](#handmatig-registreren)
   - [Filteren per klas & Klasinlevering in één klik](#klasinlevering)
   - [Boek inleveren met staat-controle](#staat-controle)
6. [Het Beheerderspaneel (Rol 2: Hoofdbeheerders)](#6-het-beheerderspaneel-rol-2)
   - [Inloggen met de geheime Beheerderscode](#inloggen-beheerder)
   - [Tab 1: Thema in de kijker instellen](#tab-1-thema-in-de-kijker-instellen)
   - [Tab 2: Boek toevoegen (volledig handmatig)](#tab-2-boek-toevoegen-handmatig)
   - [Tab 3: Instellingen, Google Sheet & Wachtwoordbeheer](#tab-3-instellingen--wachtwoordbeheer)
   - [Tab 4: Hulp & FAQ](#tab-4-hulp--faq)
7. [Veelgestelde Vragen (FAQ)](#7-veelgestelde-vragen-faq)
   - [FAQ 1: Hoe help ik een leerling snel een boek vinden op niveau?](#faq-1-hoe-help-ik-een-leerling-snel-een-boek-vinden-op-niveau)
   - [FAQ 2: Waar zie ik of een boek aanwezig is of uitgeleend?](#faq-2-waar-zie-ik-of-een-boek-aanwezig-is-of-uitgeleend)
   - [FAQ 3: Hoe leen ik een boek uit aan een leerling?](#faq-3-hoe-leen-ik-een-boek-uit-aan-een-leerling)
   - [FAQ 4: Wat zijn de toegangscodes voor leerkrachten en beheerders?](#faq-4-wat-zijn-de-toegangscodes)
   - [FAQ 5: Hoe neem ik een boek weer in als een leerling het inlevert?](#faq-5-hoe-neem-ik-een-boek-weer-in-als-een-leerling-het-inlevert)
   - [FAQ 6: Kan ik in één klik alle boeken van mijn klas inleveren?](#faq-6-kan-ik-in-één-klik-alle-boeken-van-mijn-klas-inleveren)
   - [FAQ 7: Hoe voeg ik als beheerder een nieuw boek of extra exemplaar toe?](#faq-7-hoe-voeg-ik-een-nieuw-boek-toe)
   - [FAQ 8: Hoe pas ik de banner 'Thema in de kijker' aan?](#faq-8-hoe-pas-ik-de-banner-thema-in-de-kijker-aan)
   - [FAQ 9: Waarom linkt het ene boek naar Boekenzoeker en het andere naar Hebban?](#faq-9-waarom-linkt-het-ene-boek-naar-boekenzoeker-en-het-andere-naar-hebban)
   - [FAQ 10: Waar worden alle gegevens opgeslagen?](#faq-10-waar-worden-alle-gegevens-opgeslagen)
   - [FAQ 11: Hoe pas ik de klassenlijst aan?](#faq-11-hoe-pas-ik-de-klassenlijst-aan)
   - [FAQ 12: Kunnen leerlingen zelf boeken ontlenen van thuis uit?](#faq-12-kunnen-leerlingen-zelf-boeken-ontlenen-van-thuis-uit)

---

<a id="1-over-het-platform--de-twee-rollen"></a>
## 1. Over het platform & De Twee Rollen

**Boekenbende Sint-Pieters** is de digitale catalogus en het uitleensysteem van de schoolbibliotheek op Campus Sint-Pieters.

Om het beheer veilig en gebruiksvriendelijk te houden, werkt het platform met **twee aparte rollen met elk een eigen toegangscode**:

| Rol | Wie? | Toegang tot | Toegangscode |
| :--- | :--- | :--- | :--- |
| **Rol 1: Uitleenbalie / Leerkracht** | Leerkrachten Nederlands, secretariaat, bib-balie | • Boeken uitlenen & innemen<br>• Snel barcodes scannen<br>• Klasinleveringen in batch<br>• Uitleningenlijst raadplegen & verlengen | **Leerkrachtcode**<br>*(Standaard: `donbosco`)* |
| **Rol 2: Hoofdbeheerder** | De twee aangestelde bib-verantwoordelijken | • Alles van Rol 1<br>• Thema in de kijker instellen<br>• Nieuwe boeken handmatig toevoegen<br>• **Wachtwoorden van beide rollen wijzigen**<br>• Google Sheet koppeling & instellingen | **Beheerderscode**<br>*(Standaard: `beheerder`)* |

- **Voor leerlingen**: Een aantrekkelijke, visuele interface (in de stijl van Boekenzoeker.be) om zelfstandig of tijdens leesuren boeken te ontdekken, achterflappen te lezen en beschikbaarheid te zien. Leerlingen hebben geen code en kunnen van thuis uit niets registreren.

---

<a id="2-boeken-zoeken--ontdekken-met-leerlingen"></a>
## 2. Boeken zoeken & Ontdekken met leerlingen

Ga naar de startpagina (**📚 Catalogus Bib**). Hier kunnen leerlingen en collega's op verschillende manieren grasduinen:

### De zoekbalk
Bovenaan in de gekleurde banner vind je de zoekbalk. Je kan hier vrij typen:
- **Titel**: bv. *Kruistocht in spijkerbroek*
- **Auteur**: bv. *Dirk Bracke*, *Thea Beckman*
- **Thema of trefwoord**: bv. *spanning*, *vriendschap*, *oorlog*, *liefde*, *humor*
- Zodra je begint te typen, schakelt de pagina automatisch over naar het overzichtelijke raster met zoekresultaten.

### Filters: Taal, Graad, Thema en Beschikbaarheid
Onder de banner vind je vier dropdownknoppen om heel gericht te selecteren:
1. **Taal**: Filter op *Nederlands*, *Engels*, *Frans* of *Duits*. Handig voor de vakken moderne vreemde talen!
2. **Leeftijd / Graad**: 
   - *Eerste graad* (12–14 jaar)
   - *Tweede graad* (14–16 jaar)
   - *Derde graad* (16+ jaar)
   - *Alle graden*
3. **Thema**: Kies uit genres en onderwerpen (bv. *detective*, *fantasy*, *coming of age*, *graphic novel*, *waargebeurd*).
4. **Beschikbaarheid**:
   - Vink **Nu in de bib aanwezig** aan om enkel boeken te tonen die momenteel fysiek in de rekken staan.
   - Vink **Momenteel uitgeleend** aan om te zien welke boeken momenteel door leerlingen gelezen worden.

> 💡 **Tip:** Meerdere filters combineren is mogelijk. Met de rode knop **✕ Wis filters** zet je alle filters in één klik terug.

### Snelkeuze-knoppen
Bovenaan de filterbalk vind je handige sneltoetsen:
- **Alle boeken**: De volledige collectie.
- **Bekroonde boeken**: Boeken bekroond met o.a. de Boekenleeuw, Zilveren Griffel of De Leesjury.
- **Top beoordeeld**: Boeken die de hoogste sterren kregen van onze eigen leerlingen en leerkrachten.
- **Mijn favorieten**: Een persoonlijk lijstje van bewaarde boeken (blijft bewaard op dat toestel).
- **Nieuw in de bib**: De meest recente aanwinsten van de bib.

---

<a id="3-boekfiche-details-recensies-en-beschikbaarheid"></a>
## 3. Boekfiche: Details, Recensies en Beschikbaarheid

Klik op een boekkaartje om de gedetailleerde boekfiche te openen:
1. **Cover & Tags**: Een duidelijke boekomslag en labels met thema's.
2. **Locatie in de bib**: Je ziet meteen in welke kast of afdeling het boek staat (bv. *Nederlandstalige fictie*, *Boektoppers*, *Poëzie*, *Engelstalige fictie*).
3. **Fysieke exemplaren & Status**:
   - Bij elk exemplaar staat of het **beschikbaar** is of **uitgeleend** (inclusief naam van de lener, klas en verwachte inleverdatum).
4. **Sterrenbeoordeling & Favorieten**:
   - Geef het boek 1 tot 5 sterren. De score telt mee voor de 'Top beoordeeld'-rangschikking.
   - Klik op *'Opslaan in favorieten'* om het boek te bewaren op je boekenlijstje.
5. **Knop 'Meer informatie'**:
   - Linkt automatisch door naar **Boekenzoeker.be**, **Hebban.nl** of **Goodreads** voor recensies en samenvattingen.

---

<a id="4-snel-uitlenen-vanuit-de-boekfiche"></a>
## 4. Snel Uitlenen vanuit de Boekfiche

Wil een leerling in de klas meteen een boek meenemen? Dat kan rechtstreeks via de boekfiche:
1. Klik op het boek in de catalogus.
2. Klik linksonder op de blauwe knop **📘 Dit boek uitlenen**.
3. **Leerkrachtbeveiliging**: Er verschijnt een vraag om de **Leerkrachtcode** in te voeren (standaard: `donbosco`). Als je in deze browsersessie al bent ingelogd op de Uitleenbalie of als beheerder, opent het formulier meteen!
4. Selecteer het exemplaar, vul de **naam van de leerling** in en kies de **klas**.
5. De inleverdatum wordt automatisch berekend (standaard 1 maand).
6. Klik op **Uitlening Bevestigen**. Klaar!

---

<a id="5-de-uitleenbalie-rol-1"></a>
## 5. De Uitleenbalie (Rol 1: Leerkrachten & Secretariaat)

De **Uitleenbalie** is dé centrale werkplek voor leerkrachten (bv. leerkracht Nederlands die met de klas naar de bib gaat) en secretariaatsmedewerkers aan de balie. Hier kunnen boeken snel ingecheckt en uitgecheckt worden, zonder dat er risico is dat catalogusgegevens of instellingen gewijzigd worden.

<a id="inloggen-uitleenbalie"></a>
### Inloggen met de Leerkrachtcode
1. Klik in het bovenmenu op **🔄 Uitleenbalie** (op mobiel: **🔄 Balie**).
2. Voer de **Leerkrachtcode** in (standaard: `donbosco`, of de code die door de beheerder is ingesteld).
3. Klik op **Balie Openen**. Je blijft voor de duur van je sessie ingelogd op deze computer.
4. Ben je klaar? Klik rechtsboven op **🔒 Balie Vergrendelen**.

<a id="snelle-barcodescan"></a>
### Snelle Barcode / ISBN scan (Inleveren of Uitlenen)
Bovenaan de balie vind je de donkere scanbalk:
- **Boek innemen**: Scan de barcode met een handscanner (of typ de titel). Het systeem herkent direct wie het boek ontleend heeft en toont één knop: **Direct Inleveren ✓**.
- **Boek uitlenen**: Scan een beschikbaar boek. Het systeem herkent het boek en biedt direct de knop **Dit boek uitlenen 📘**.

<a id="handmatig-registreren"></a>
### Nieuwe uitlening handmatig registreren
Onder de scanbalk vind je het uitklapformulier *'Nieuwe uitlening handmatig registreren'*:
1. Vul de naam van de leerling of collega in.
2. Selecteer de klas uit de dropdown (bv. `2MWb`).
3. Typ de titel van het boek en kies het gewenste exemplaar.
4. Klik op **Uitlening opslaan**.

<a id="klasinlevering"></a>
### Filteren per klas & Klasinlevering in één klik
Brengt een leerkracht na een leesuur een hele bak boeken van de klas terug?
1. Klik in de filterbalk op de badge van jouw klas (bv. `2MWb`).
2. Je ziet direct alle openstaande boeken van die specifieke klas.
3. Klik op de groene knop **✓ Alles van klas 2MWb inleveren**. Alle boeken van die klas worden gelijktijdig gemarkeerd als ingeleverd!

<a id="staat-controle"></a>
### Boek inleveren met staat-controle
Bij het individueel inleveren van een boek opent een handig pop-upvenster:
- Kies de staat van het boek: **Goed**, **Lichte schade** of **Ernstig beschadigd / Pagina los**.
- Voeg eventueel een korte opmerking toe.
- Dit wordt netjes bewaard in de historiek en gesynchroniseerd met Google Sheets.

---

<a id="6-het-beheerderspaneel-rol-2"></a>
## 6. Het Beheerderspaneel (Rol 2: Hoofdbeheerders)

Het beheerderspaneel is exclusief voorbehouden voor de twee hoofdbeheerders van de bib.

<a id="inloggen-beheerder"></a>
### Inloggen met de geheime Beheerderscode
1. Klik rechtsboven in het menu op **⚙️ Beheerder**.
2. Voer jullie **geheime Beheerderscode** in (standaard bij installatie: `beheerder`).
3. Je bent nu ingelogd in het dashboard met vier subtabs:

---

<a id="tab-1-thema-in-de-kijker-instellen"></a>
### Tab 1: Thema in de kijker instellen
Hier pas je de grote seizoensbanner aan die leerlingen op de homepage zien:
- **Banner activeren/deactiveren**: Schakel de themabanner aan of uit.
- **Titel & Ondertitel**: bv. *"Jeugdboekenmaand: Tijd voor kunst & verhalen!"*
- **Trefwoord / Tag**: Geef het trefwoord op (bv. *spanning*, *vriendschap*, *fantasy*).
- **Kleursfeer**: Kies een sfeer (bijv. *Petrol Teal*, *Koraalrood*, *Nachtblauw*, *Warm Amber*).
- **Aanbevolen boeken per graad**: Selecteer per graad (1ste, 2de en 3de graad) tot 5 specifieke boeken die prominent op de carrousels verschijnen.
- Klik op **💾 Thema Opslaan & Publiceren**.

---

<a id="tab-2-boek-toevoegen-handmatig"></a>
### Tab 2: Boek toevoegen (volledig handmatig)
Nieuwe boeken aankopen en toevoegen gebeurt eenvoudig en handmatig via het invoerformulier:
1. **Titel en Auteur**: Typ de titel en naam van de auteur in.
2. **Graad**: Kies *Eerste graad*, *Tweede graad*, *Derde graad* of *Alle graden*.
3. **Locatie / Kast**: Selecteer de standplaats (bv. *Nederlandstalige fictie*, *Boektoppers*, *Graphic novels*...). Je kan via *'+ Nieuwe locatie toevoegen'* ook een eigen kast aanmaken.
4. **Aantal exemplaren**: Voeg je meerdere stuks toe? Klik op **2x**, **3x**, **5x** of typ het aantal in om ze in één klik in batch aan te maken.
5. **Genre & Thema's**: Klik op de keuzebadges om genres (bv. *Young adult*, *Graphic novel*, *Spanning*) en inhoudelijke thema's (*Vriendschap*, *Mentaal welzijn*...) te selecteren.
6. **Optionele gegevens**: Voer eventueel het ISBN-nummer, een coverlink of een weblink naar Boekenzoeker/Hebban in.
7. **Duplicaatherkenning (Extra exemplaar)**: Bestaat het boek al in de school? Dan verschijnt er direct een oranje melding. Met één klik op **Extra exemplaar toevoegen** worden alle gegevens automatisch overgenomen en krijgt het boek automatisch een nieuw volgnummer (bv. *Exemplaar 2*).
8. Klik op **Boek toevoegen en opslaan**. Het boek verschijnt direct in de catalogus en wordt automatisch opgeslagen in de Google Sheet!

---

<a id="tab-3-instellingen--wachtwoordbeheer"></a>
### Tab 3: Instellingen, Google Sheet & Wachtwoordbeheer
Hier beheren jullie de centrale configuratie en de beveiliging:

1. **Beheerderscode wijzigen (Rol 2)**:
   - Pas hier jullie eigen geheime code aan.
   - Klik op **Beheerderscode Opslaan**. De nieuwe code is direct actief en wordt gesynchroniseerd naar Google Sheets.
2. **Leerkrachtcode / Baliewachtwoord wijzigen (Rol 1)**:
   - Pas hier de code aan die collega's en secretariaatsmedewerkers gebruiken voor de Uitleenbalie.
   - Klik op **Leerkrachtcode Opslaan**. Wordt direct opgeslagen in Google Sheets.
3. **Google Spreadsheet**:
   - Directe link om de centrale Google Sheet van de school te openen in Google Drive.
4. **Google Apps Script Web-app URL**:
   - De veilige cloudverbinding tussen de website en Google Sheets.
5. **Standaard uitleentermijn**:
   - Kies tussen: *2 weken*, *3 weken*, *1 maand (standaard)* of *2 maanden*.
6. **Klassenlijst beheren**:
   - Beheer de lijst van klassen (gescheiden door komma's). Deze verschijnen automatisch in alle dropdowns.

---

<a id="tab-4-hulp--faq"></a>
### Tab 4: Hulp & FAQ
Bevat een handige samenvatting van de werking en een knop om de handleiding direct af te drukken of op te slaan als PDF.

---

<a id="7-veelgestelde-vragen-faq"></a>
## 7. Veelgestelde Vragen (FAQ)

<a id="faq-1-hoe-help-ik-een-leerling-snel-een-boek-vinden-op-niveau"></a>
### FAQ 1: Hoe help ik een leerling snel een boek vinden op zijn/haar niveau?
Gebruik de filterknop **Leeftijd** en kies de juiste graad (*Eerste graad* = 12-14 jaar, *Tweede graad* = 14-16 jaar, *Derde graad* = 16+ jaar). Combineer dit eventueel met een interesse via het **Thema** filter (bv. *spanning*, *sport* of *vriendschap*) of klik op de snelkeuze **Bekroonde boeken**.

---

<a id="faq-2-waar-zie-ik-of-een-boek-aanwezig-is-of-uitgeleend"></a>
### FAQ 2: Waar zie ik of een boek aanwezig is of momenteel uitgeleend?
Klik op het boek om de boekfiche te openen. In het vak **Exemplaren in de schoolbib** zie je per exemplaar een groen vinkje (*"Aanwezig"*) of een rood label (*"Uitgeleend aan [Naam] ([Klas])"*). Wil je enkel boeken zien die vandaag in het rek staan? Vink dan in de filterbalk de optie **Nu in de bib aanwezig** aan.

---

<a id="faq-3-hoe-leen-ik-een-boek-uit-aan-een-leerling"></a>
### FAQ 3: Hoe leen ik een boek snel uit aan een leerling?
Open de fiche van het boek in de catalogus en klik op **📘 Dit boek uitlenen**. Voer de leerkrachtcode in (`donbosco`), vul de naam en klas van de leerling in en klik op **Uitlening Bevestigen**.

---

<a id="faq-4-wat-zijn-de-toegangscodes"></a>
### FAQ 4: Wat zijn de standaard toegangscodes en wie gebruikt welke code?
Er zijn twee aparte codes:
- **Leerkrachtcode (Rol 1: Uitleenbalie & snel uitlenen)**: standaard **`donbosco`**. Deze code mag gedeeld worden met collega-leerkrachten en secretariaat.
- **Beheerderscode (Rol 2: Beheerderspaneel)**: standaard **`beheerder`**. Deze code is strikt geheim voor de twee hoofdbeheerders.
Beheerders kunnen **beide codes** op elk moment wijzigen via **Beheerder ➔ Instellingen & Sheet**.

---

<a id="faq-5-hoe-neem-ik-een-boek-weer-in-als-een-leerling-het-inlevert"></a>
### FAQ 5: Hoe neem ik een boek weer in wanneer een leerling het inlevert?
Klik bovenaan in het menu op **🔄 Uitleenbalie**. Log in met de leerkrachtcode (`donbosco`). Scan de barcode van het boek in de balk *'Snelle Barcode scan'* (of zoek de leerling in de tabel) en klik op **Direct Inleveren**.

---

<a id="faq-6-kan-ik-in-één-klik-alle-boeken-van-mijn-klas-inleveren"></a>
### FAQ 6: Kan ik in één klik alle boeken van mijn klas inleveren?
Ja! Open de **🔄 Uitleenbalie**, klik op de filterknop van jouw klas (bv. `2MWb`), en klik vervolgens op de groene knop **✓ Alles van deze klas inleveren**.

---

<a id="faq-7-hoe-voeg-ik-een-nieuw-boek-toe"></a>
### FAQ 7: Hoe voeg ik als beheerder een nieuw boek of extra exemplaar toe?
Ga naar **Beheerder ➔ Boek toevoegen**. Vul handmatig de titel, auteur, graad, kastlocatie en genres in en klik op **Boek toevoegen en opslaan**. Als het boek al in de schoolbib staat, klik je in de oranje melding op **Extra exemplaar toevoegen** om direct een volgend exemplaarnummer aan te maken.

---

<a id="faq-8-hoe-pas-ik-de-banner-thema-in-de-kijker-aan"></a>
### FAQ 8: Hoe pas ik de banner 'Thema in de kijker' aan?
Ga naar **Beheerder ➔ Thema in de kijker**. Geef een titel, omschrijving en trefwoord op, kies een kleursfeer en selecteer eventueel aanbevolen boeken per graad. Klik daarna op **Opslaan & Publiceren**.

---

<a id="faq-9-waarom-linkt-het-ene-boek-naar-boekenzoeker-en-het-andere-naar-hebban"></a>
### FAQ 9: Waarom linkt het ene boek naar Boekenzoeker en het andere naar Hebban?
Ons platform kiest automatisch de meest geschikte bron:
- Staat het boek in de officiële **Boekenzoeker.be** databank? Dan linkt het naar Boekenzoeker (ideaal voor jongeren).
- Is het een ander Nederlandstalig boek? Dan linkt het naar **Hebban.nl** voor achterflapteksten en recensies.
- Is het een anderstalig boek (Engels, Frans...)? Dan linkt het naar **Goodreads.com**.

---

<a id="faq-10-waar-worden-alle-gegevens-opgeslagen"></a>
### FAQ 10: Waar worden alle gegevens opgeslagen en wat als het internet hapert?
Alle boeken, actieve uitleningen en systeeminstellingen (inclusief de twee wachtwoorden) worden centraal opgeslagen in de **Google Spreadsheet** van de school via Google Apps Script. Daarnaast bewaart de browser lokaal een reservekopie (LocalStorage), zodat de catalogus zelfs bij een tijdelijke internetonderbreking vlot blijft werken.

---

<a id="faq-11-hoe-pas-ik-de-klassenlijst-aan"></a>
### FAQ 11: Hoe pas ik de klassenlijst aan aan het begin van een nieuw schooljaar?
Ga naar **Beheerder ➔ Instellingen ➔ Klassenlijst beheren**. Pas het tekstvak aan met de nieuwe klassenamen (gescheiden door komma's) en klik op **Klassenlijst Opslaan**.

---

<a id="faq-12-kunnen-leerlingen-zelf-boeken-ontlenen-van-thuis-uit"></a>
### FAQ 12: Kunnen leerlingen zelf boeken ontlenen van thuis uit?
Nee. Om misbruik te voorkomen, is voor elke uitlening en voor toegang tot de Uitleenbalie de leerkrachtcode vereist. Leerlingen kunnen thuis wel vrij zoeken in de catalogus, achterflappen lezen, beschikbaarheid checken en favorieten bewaren.

---

*Vragen, suggesties of ondersteuning nodig? Contacteer de bib-verantwoordelijken van Don Bosco Gent Campus Sint-Pieters.*
