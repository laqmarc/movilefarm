# Movile Farm - Roadmap

## Objectiu
Construir un joc web d'automatitzacio on el jugador crea una xarxa de maquines, extreu recursos, els guarda i els ven per progressar.

## Core loop v1
1. Comprar miners.
2. Extreure pedra.
3. Guardar pedra al magatzem.
4. Vendre pedra al mercat.
5. Fer upgrades i repetir.

## Estat actual (MVP 0.1)
- UI base funcional.
- Miner que produeix pedra.
- Magatzem amb capacitat i upgrade.
- Mercat amb venda manual i auto-venda.
- Connexions simples (toggles entre zones).
- Contractes basics amb temps, recompensa i penalitzacio.
- Guardat automatic a localStorage.

## Fase 1 - Equilibri i UX
- Ajustar formulas de costos i produccio.
- Feedback visual de coll d'ampolla (produccio > capacitat).
- Historial curt de transaccions.
- Tooltips de cada sistema.

## Fase 2 - Connexions reals
- Model per nodes i arestes.
- Construccio de cables o transportadors.
- Capacitat de flux per connexio.
- Visualitzacio de flux en mapa.

## Fase 3 - Nous recursos i cadena
- Afegir ferro com a segon recurs.
- Nova maquina: fonedora o processador.
- Receptes amb input/output.
- Dependencia de connexions entre maquines.

## Fase 4 - Contractes v2
- Contractes per tipus de recurs.
- Contractes premium de risc alt.
- Reputacio i bonus de mercat.
- Pool de contractes dinamics.

## Fase 5 - Persistencia i expansio
- Migracio de save per versions.
- Reptes/objectius.
- Preparacio backend opcional per leaderboard.

## Decisions tecniques
- Stack actual: HTML + CSS + JavaScript vanilla.
- Simulacio en ticks amb `requestAnimationFrame`.
- Estat centralitzat en un objecte global.
- Persistencia via `localStorage`.

## Seguents passos recomanats
1. Passar de toggles a connexions per mapa (drag and connect).
2. Afegir sistema d'events (bonus temporal, avaries).
3. Fer balance pass amb tests de simulacio (5 min, 30 min, 2 h).

## Llista Curta (2026-02-21)
- [x] Separar compra en `Recursos` i `Maquines`.
- [x] Afegir mode explicit per tallar/esborrar cables.
- [x] Afegir mes receptes a `Assembler` (selector de recepta).
- [ ] Ajustar balance de preus/produccio de la nova cadena.
- [ ] Contractes multi-recurs (no nomes pedra).
- [ ] Filtre visual de flux per tipus de recurs.
