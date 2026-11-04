# Fonti di Istantaneamente

Mappa dei siti di usato, ricondizionato e offerte usati in Italia, con il modo in cui ogni sito entra nella lista unica. Aggiornata al 4 novembre 2026.

## I tre canali che portano annunci nella lista

| Canale | Cosa porta | Come | Costo |
|---|---|---|---|
| **eBay Browse API** | Annunci eBay usati, con data di pubblicazione esatta | API ufficiale, chiavi gratuite da developer.ebay.com | Gratis |
| **Google Shopping** (via SearchApi) | Offerte dei negozi, nuove e usate o ricondizionate: Amazon, MediaWorld, Unieuro, Euronics, Back Market, refurbed, Swappie, TrenDevice, Thomann e qualsiasi negozio che pubblica su Google Shopping | Una ricerca normale e una filtrata "usato" | Con la stessa chiave SearchApi |
| **Annunci indicizzati da Google** (via SearchApi) | Singoli annunci di Subito, Vinted, Marketplace, AutoScout24, Mercatino Musicale e degli altri siti di annunci | Una ricerca Google `site:` per categoria. Prende solo titolo, prezzo e data che Google ha già indicizzato, e porta all'annuncio originale | 100 ricerche gratis, poi da 4 $ ogni 1.000 (searchapi.io) |

Ogni ricerca sul sito costa al massimo 3 richieste SearchApi (Shopping, Shopping usato, annunci). Con il piano da 40 $ al mese sono circa 3.300 ricerche al mese.

## Siti per categoria

Legenda: **API** = eBay ufficiale · **Shopping** = offerte da Google Shopping · **Indice** = annunci indicizzati da Google · **Link** = solo link di ricerca, nella sezione "Cerca anche su".

### Generalisti
| Sito | Come entra |
|---|---|
| Subito | Indice |
| eBay | API |
| Facebook Marketplace | Indice (Facebook indicizza pochi annunci, quindi ne arriveranno pochi) |
| Vinted | Indice |
| Clasf, Bakeca, Secondamano, Porta Portese | Indice |
| Mercatino dell'Usato | Indice |
| Amazon (anche Seconda mano) | Shopping |
| Catawiki | Indice (collezionismo, lusso, arte) |

### Veicoli
| Sito | Come entra |
|---|---|
| AutoScout24, Automobile.it, Autosupermarket | Indice |
| Subito Motori | Indice |
| AutoUncle, ilParking, Quattroruote usato, mobile.de | Link |
| Autohero, Spoticar, Das WeltAuto (usato garantito) | Link |
| Moto.it, InSella | Indice · Dueruote: Link |
| CamperOnLine | Indice |
| Boat24, iNautia | Indice · YachtWorld: Link |
| Agriaffaires, Mascus, TruckScout24 | Indice |
| Ovoko (ricambi) | Link |

### Tecnologia
| Sito | Come entra |
|---|---|
| Back Market, refurbed, Swappie, TrenDevice, reBuy | Shopping |
| MediaWorld, Unieuro, Euronics, Amazon | Shopping |
| Mercatino Hardware Upgrade, JuzaPhoto | Indice |
| MPB | Shopping se presente, altrimenti Link |
| HifiShark, Audiogon | Link |

### Musica e libri
| Sito | Come entra |
|---|---|
| Mercatino Musicale, Reverb | Indice |
| Thomann, Strumentimusicali.net, Musik Produktiv, Gear4music | Shopping |
| Discogs | Indice · CDandLP: Link |
| Comprovendolibri | Indice · AbeBooks, Libraccio, Maremagnum: Link |

### Moda
| Sito | Come entra |
|---|---|
| Vinted, Depop, Vestiaire Collective | Indice |
| Micolet | Link |
| Chrono24 | Indice · Collector Square: Link |
| Baby Bazar | Link |

### Casa e tempo libero
| Sito | Come entra |
|---|---|
| Mercatino dell'Usato, Deesup | Indice · Pamono: Link |
| buycycle | Indice · Bikeflip, Upway: Link |
| Delcampe, Cardmarket, Catawiki | Indice |
| Anticoantico, Proantic | Link |

## Da attivare più avanti

| Fonte | Cosa sblocca | Requisito |
|---|---|---|
| Amazon Creators API (ha sostituito PA-API 5) | Offerte Amazon con prezzi aggiornati e commissione | Iscrizione ad Amazon Associates e almeno 10 vendite qualificate negli ultimi 30 giorni |
| Feed di affiliazione (Awin, Belboon) | Cataloghi completi con commissione: Back Market (Awin), refurbed IT (Belboon), Unieuro (Awin) | Account editore approvato, quindi serve il sito online |
| Kelkoo Shopping API | Altre offerte dei negozi italiani | Account editore Kelkoo approvato |

## Perché non copiamo i siti direttamente

Subito, Vinted, Facebook e AutoScout24 non hanno API pubbliche, e i loro termini vietano di estrarre gli annunci con programmi automatici. Copiarli direttamente comporta tre rischi:

1. **Blocchi**: questi siti hanno protezioni anti-bot. Il sito smetterebbe di funzionare da un giorno all'altro, e servirebbero proxy a pagamento per aggirarle.
2. **Rischio legale**: in UE i database di annunci sono protetti dal diritto *sui generis*. Nella sentenza CV-Online Latvia (C-762/19, 2021) la Corte di giustizia ha stabilito che un motore di ricerca che copia annunci viola quel diritto quando danneggia l'investimento del sito d'origine.
3. **Responsabilità sui contenuti**: ripubblicare foto e testi degli annunci di altri, cioè contenuti dei privati, è diverso dal linkarli.

Il canale "Indice" ottiene un risultato molto simile senza questi problemi: gli annunci arrivano da un motore di ricerca, che li ha già indicizzati con il permesso dei siti (robots.txt), e ogni risultato porta al sito originale. Se un giorno il progetto cresce, la strada pulita per avere tutto è un accordo commerciale con i singoli siti.
