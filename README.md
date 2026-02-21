# Movile Farm

Prototype inicial del joc web d'automatitzacio.

## Com executar
Obre `index.html` al navegador.

Opcional amb servidor local:

```powershell
cd d:\movilefarm
python -m http.server 5500
```

Despres visita `http://localhost:5500`.

## Features actuals
- Graella tactil per col.locar items.
- Mapa gran navegable amb pan (arrossegant amb el dit).
- Zoom amb pinch (2 dits) sobre el mapa.
- HUD superior d'alcada fixa amb franja de recursos escalable.
- Franja de recursos amb resum `+N` i panell complet.
- Nodes reals (`miner`, `magatzem`, `mercat`) amb cables visuals.
- Barra d'eines principal: comprar, cables, seleccio, upgrade, vendre i borrar.
- Tecnologia per desbloquejar `ferro` i compra de `miner ferro`.
- Nou recurs `fusta` amb `miner fusta` des del principi.
- `Farga` desbloquejable que combina recursos amb recepta i produeix `peces`.
- Selector de recepta per maquina (ex. `Farga`: Peces/Acer/Plaques).
- Nous recursos base `carbo` i `coure` amb miners propis.
- Nova maquina `Assembler` que consumeix `peces` i `plaques` per crear `moduls`.
- `Assembler` amb receptes multiples (`Moduls`, `Circuits`, `Bastidors`).
- Compra separada visualment en seccions de `Recursos` i `Maquines`.
- Venda manual i auto-venda unificada per tots els recursos.
- Connexio per drag tactile (`Mode Cable`) i per taps.
- Mode `Tallar` per eliminar cables explicitament.
- Boto `Reinici` per esborrar persistencia i tornar a estat inicial.
- Contractes multi-recurs (entrega parcial i progressiva).
- Snap assistit en drag per facilitar connexions amb el dit.
- Cables amb cost economic i distancia maxima.
- Nou item `connector` per construir rutes.
- Cost de manteniment continu per nodes i cables.
- Eliminacio de nodes amb restriccions (nodes estructurals bloquejats).
- Produccio depenent de la connectivitat de la xarxa.
- Upgrade per item seleccionat.
- Magatzem amb capacitat i venda manual/automatica.
- Contractes basics amb recompensa/penalitzacio.
- Guardat automatic amb `localStorage`.

## Fitxers clau
- `index.html`: estructura UI.
- `styles.css`: estil i responsive.
- `script.js`: loader de compatibilitat.
- `js/01-bootstrap.js` a `js/09-events-loop.js`: codi principal separat per domini.
- `ROADMAP.md`: pla d'evolucio.
