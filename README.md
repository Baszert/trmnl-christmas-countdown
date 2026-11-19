# ASCII Kerst Countdown voor TRMNL

Een private plugin die elke dag een andere ASCII-kerstscène toont, met een countdown tot Kerst.
Werkt op TRMNL OG (1-bit), OG V2 (2-bit), TRMNL X (4-bit) en kleurenschermen, in alle vier formaten (full, half horizontal, half vertical, quadrant) en in portrait.

## Wat je ziet

| Periode | Scène (modus *Combined*) |
|---|---|
| Tot 1 december | Elke dag een andere scène: bos, dorp, sneeuwpop, rendier, hut bij bevroren meer, bergen, kerk met ster. Binnen een week komt geen scène dubbel voor. |
| 1 t/m 24 december | Een grote kerstboom die elke dag één bal of lampje erbij krijgt (adventskalender). De plekken liggen per jaar vast, dus ze stapelen echt op. |
| 24 december | Arreslee met rendieren in de lucht en de eerste cadeautjes. |
| 25 en 26 december | Volle boom met stralende piek en cadeaus, "Vrolijk kerstfeest". |
| 27 t/m 31 december | Vuurwerk boven het dorp, aftellen naar Nieuwjaar. Elke dag meer vuurwerk. |
| 1 januari | Groot vuurwerk, "Gelukkig nieuwjaar". Daarna begint het opnieuw. |

Hoe dichter bij Kerst, hoe meer sneeuw. Half oktober valt alleen hier en daar een vlok, vanaf eind oktober ligt er sneeuw.
Sterren, bomen en sneeuw worden per dag opnieuw geplaatst, dus elke dag ziet anders uit.

## Instellingen

- **Language**: Auto (volgt je TRMNL-account), English, Nederlands, Deutsch, Français, Español, Italiano, Português, Svenska, Dansk, Norsk, Polski, Suomi.
- **Scene**: *Combined* (dagelijkse scène, vanaf 1 december de adventsboom), *Growing tree* (de boom groeit het hele seizoen en krijgt in december versiering), *Daily scene* (altijd een andere scène, ook in december).
- **Count**: *Days* ("nog 76 dagen tot Kerst") of *Sleeps* ("nog 76 nachtjes slapen").
- **Colors**: *Auto* gebruikt kleur op kleurenschermen en grijstinten op de X. *Off* houdt alles zwart.
- **Test date**: optioneel, bijvoorbeeld `2026-12-24`, om een andere dag te bekijken. Laat leeg voor normaal gebruik.

Tip: zet in TRMNL *dark mode* aan voor een echte nachthemel (wit op zwart).

## Installeren in TRMNL

1. Ga in TRMNL naar **Plugins → Private Plugin → Add new**.
2. Kies als strategy **Static** (er is geen databron nodig).
3. Open **Edit Custom Fields** en plak de `custom_fields` uit [settings.yml](settings.yml).
4. Open **Edit Markup** en plak:
   - [shared.liquid](shared.liquid) in het tabblad *Shared*
   - [full.liquid](full.liquid), [half_horizontal.liquid](half_horizontal.liquid), [half_vertical.liquid](half_vertical.liquid) en [quadrant.liquid](quadrant.liquid) in de tabbladen met dezelfde naam
5. Opslaan, kies je taal en modus, en voeg de plugin toe aan je playlist. Eén refresh per dag is genoeg. De standaard is elke 6 uur.

## Lokale preview

```bash
cd preview && npm install liquidjs@10 && node build.mjs && python3 -m http.server 8765
```

Open daarna http://localhost:8765. Je kunt de datum, het apparaat, de taal, de modus, portrait en de zoom aanpassen.

## Hoe het werkt

Liquid geeft alleen de datum, je tijdzone, je taal en de instellingen door. Een script in `shared.liquid` meet het beschikbare vlak en kiest een lettergrootte (ongeveer 190 kolommen op een full OG-scherm, 280 op de X). Daarna tekent het de scène als dichtheidskaart: elke cel krijgt een inktwaarde die als puntje (`·` `•` `●`) wordt getekend, met dithering voor zachte overgangen. Daar komt de countdown-kaart overheen.
