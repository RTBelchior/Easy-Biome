/* ════════════════════════════════════════════
   DADOS DOS TERRÁRIOS — partilhado por todas as páginas
   Usa localStorage para que o terrário escolhido e os
   dados se mantenham ao navegar entre páginas.
   ════════════════════════════════════════════ */

const DEFAULT_TERRARIOS = [
  {
    id: 1, nome: 'Exposição',
    img: 'https://images.unsplash.com/photo-1597916829826-02e5bb4a54e8?w=800&q=60',
    temp: 26.6, hum: 42, tempRange: [20,35], humRange: [40,80],
    fan: false, heat: false, light: false
  },
  {
    id: 2, nome: 'Quarto',
    img: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=800&q=60',
    temp: 24.1, hum: 58, tempRange: [18,30], humRange: [45,75],
    fan: true, heat: true, light: true
  },
  {
    id: 3, nome: 'Sala',
    img: 'https://images.unsplash.com/photo-1632158203225-b58c0bb54e91?w=800&q=60',
    temp: 31.8, hum: 38, tempRange: [22,32], humRange: [40,70],
    fan: true, heat: false, light: false
  }
];

function loadTerrarios() {
  try {
    const raw = localStorage.getItem('easybiome_terrarios');
    return raw ? JSON.parse(raw) : structuredClone(DEFAULT_TERRARIOS);
  } catch {
    return structuredClone(DEFAULT_TERRARIOS);
  }
}

function saveTerrarios() {
  localStorage.setItem('easybiome_terrarios', JSON.stringify(terrarios));
}

function loadActiveId() {
  return Number(localStorage.getItem('easybiome_active_id')) || 1;
}

function saveActiveId() {
  localStorage.setItem('easybiome_active_id', String(activeTerrarioId));
}

const terrarios = loadTerrarios();
let activeTerrarioId = loadActiveId();

function getActive() {
  return terrarios.find(t => t.id === activeTerrarioId) || terrarios[0];
}

function setActiveTerrario(id) {
  activeTerrarioId = id;
  saveActiveId();
}

function addTerrarioData(nome) {
  const id = Math.max(...terrarios.map(t => t.id)) + 1;
  terrarios.push({
    id, nome,
    img: 'https://images.unsplash.com/photo-1620207418302-439b387441b0?w=800&q=60',
    temp: 25, hum: 55, tempRange: [20,35], humRange: [40,80],
    fan: false, heat: false, light: false
  });
  saveTerrarios();
  return id;
}
