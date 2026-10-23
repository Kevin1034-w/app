/**
 * =====================================================================
 * PRINTANTS · MARKETPLACE 3D & COMUNIDAD DE CREADORES
 * Archivo: app.js
 * =====================================================================
 */

/* -------------------------------------------------------------
   1. UTILIDADES Y FORMATO
   ------------------------------------------------------------- */
const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c] || c));

const pesos = n => '$ ' + Math.round(Number(n) || 0).toLocaleString('es-CO');
const num = v => {
  const n = Number(v);
  return isFinite(n) && n >= 0 ? n : 0;
};
const leer = id => $(id) ? num($(id).value) : 0;

// Sistema Toast Flotante Amigable
function mostrarToast(mensaje, tipo = 'info') {
  const cont = $('toastContenedor');
  if (!cont) return;
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  const iconos = { exito: '✨', error: '⚠️', info: '🐝' };
  t.innerHTML = `<span>${iconos[tipo] || '•'}</span><span>${esc(mensaje)}</span>`;
  cont.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(15px)';
    setTimeout(() => t.remove(), 250);
  }, 3200);
}

/* -------------------------------------------------------------
   SISTEMA DE TEMA CLARO / OSCURO & IDENTIDAD VISUAL (LOGOS & EMBLEMAS)
   ------------------------------------------------------------- */
const RUTAS_IDENTIDAD = {
  claro: {
    emblema: 'emblema oscuro.png',
    logo: 'logo.png'
  },
  oscuro: {
    emblema: 'emblema.png',
    logo: 'logo claor.png'
  }
};

function actualizarIdentidadVisual(tema) {
  const t = tema === 'oscuro' ? 'oscuro' : 'claro';
  const rutas = RUTAS_IDENTIDAD[t];

  // 1. Actualizar todos los emblemas en Header, Footer, Modales y Ticket
  const emblemas = document.querySelectorAll('.marca-emblema-img, .ticket-emblema-img, .modal-emblema-img, [data-identidad="emblema"]');
  emblemas.forEach(img => {
    if (img && img.getAttribute('src') !== rutas.emblema) {
      img.src = rutas.emblema;
    }
  });

  // 2. Actualizar logos completos (si los hay)
  const logos = document.querySelectorAll('.marca-logo-img, [data-identidad="logo"]');
  logos.forEach(img => {
    if (img && img.getAttribute('src') !== rutas.logo) {
      img.src = rutas.logo;
    }
  });

  // 3. Actualizar Favicon en el head del documento
  const fav = $('faviconLink') || document.querySelector('link[rel="icon"]');
  if (fav && fav.getAttribute('href') !== rutas.emblema) {
    fav.href = rutas.emblema;
  }
}

function inicializarTema() {
  const temaGuardado = localStorage.getItem('printants_tema') || 'claro';
  aplicarTema(temaGuardado);

  const btnTema = $('btnCambiarTema');
  if (btnTema) {
    btnTema.onclick = () => {
      const temaActual = document.documentElement.getAttribute('data-tema') === 'oscuro' ? 'oscuro' : 'claro';
      const nuevoTema = temaActual === 'claro' ? 'oscuro' : 'claro';
      aplicarTema(nuevoTema);
      mostrarToast(nuevoTema === 'oscuro' ? 'Modo oscuro activado 🌙' : 'Modo claro activado ☀️', 'info');
    };
  }
}

function aplicarTema(tema) {
  const t = tema === 'oscuro' ? 'oscuro' : 'claro';
  document.documentElement.setAttribute('data-tema', t);
  localStorage.setItem('printants_tema', t);

  // Actualizar inmediatamente todos los emblemas y logos según el tema
  actualizarIdentidadVisual(t);

  const icono = $('iconoTema');
  const texto = $('textoTema');
  const btnTema = $('btnCambiarTema');

  if (t === 'oscuro') {
    if (icono) icono.textContent = '🌙';
    if (texto) texto.textContent = 'Modo oscuro';
    if (btnTema) btnTema.title = 'Modo actual: Oscuro. Clic para cambiar a Modo Claro';
  } else {
    if (icono) icono.textContent = '☀️';
    if (texto) texto.textContent = 'Modo claro';
    if (btnTema) btnTema.title = 'Modo actual: Claro. Clic para cambiar a Modo Oscuro';
  }

  // Si existe el cotizador, recalcular para refrescar colores del gráfico
  if (typeof calcularCotizacion === 'function') {
    calcularCotizacion();
  }
}

/* -------------------------------------------------------------
   2. ESTADO Y SINCRONIZACIÓN CON BACKEND PHP (guardar.php)
   ------------------------------------------------------------- */
const KEY_LOCAL = 'printants_marketplace_cache';
const URL_PHP = '/guardar.php';

// Estado Semilla Inicial (Humano y Local)
let BD = {
  vendedores: {
    pedro: {
      id: 'pedro',
      nombre: 'Pedro Impresiones 3D',
      creador: 'Pedro Gaviria',
      handle: '@PedroGaviria3D',
      avatar: '🧔‍♂️',
      nota: 'Ingeniero mecánico apasionado por la precisión dimensional, prototipos funcionales y tolerancias exactas.',
      maquinas: 'Bambu Lab X1-Carbon, Prusa MK4',
      hora: 2500,
      margen: 15,
      tel: '573001234567',
      ciudad: 'Bogotá',
      insignia: 'Taller Verificado · 4 años en comunidad',
      mat: { PLA: 65000, PETG: 78000, ABS: 82000, TPU: 115000, Resina: 130000 }
    },
    laura: {
      id: 'laura',
      nombre: 'Laura Print Lab',
      creador: 'Laura Restrepo',
      handle: '@LauraPrintLab',
      avatar: '👩‍🎨',
      nota: 'Diseñadora industrial especializada en iluminación cálida, jarrones biomiméticos y resinas artísticas.',
      maquinas: 'Elegoo Saturn 3 Ultra, Bambu P1S',
      hora: 3200,
      margen: 18,
      tel: '573155554433',
      ciudad: 'Cali',
      insignia: 'Creadora Destacada · Acabados a Mano',
      mat: { PLA: 60000, PETG: 72000, Resina: 120000, TPU: 105000 }
    },
    enrique: {
      id: 'enrique',
      nombre: 'Enrique 3D Studio',
      creador: 'Mateo & Enrique',
      handle: '@EnriqueMedellin',
      avatar: '👨‍💻',
      nota: 'Dúo de creadores en Medellín. Especialistas en miniaturas de rol, escenografía fantástica y series en PETG.',
      maquinas: 'Creality K1 Max, Formlabs Form 3',
      hora: 3800,
      margen: 20,
      tel: '573109876543',
      ciudad: 'Medellín',
      insignia: 'Top Ventas · Envíos Express',
      mat: { PLA: 55000, PETG: 65000, ABS: 70000, TPU: 95000, Nylon: 140000 }
    },
    sofia: {
      id: 'sofia',
      nombre: 'Taller Silvestre 3D',
      creador: 'Sofía Cárdenas',
      handle: '@TallerSilvestre',
      avatar: '🌱',
      nota: 'Objetos para el hogar impresos con filamentos ecológicos de caña de azúcar y madera reciclada.',
      maquinas: 'Prusa Mini+, Voron 2.4',
      hora: 2900,
      margen: 15,
      tel: '573204448899',
      ciudad: 'Bucaramanga',
      insignia: 'Eco-Maker · Bio-materiales',
      mat: { PLA: 58000, PETG: 68000, 'Madera-PLA': 92000, TPU: 98000 }
    }
  },
  productos: [
    {
      id: 'prod-1',
      nombre: 'Lámpara Colmena Voronoi',
      categoria: 'decoracion',
      categoria_nombre: 'Hogar & Decoración',
      precio: 78000,
      creador_id: 'laura',
      creador_nombre: 'Laura Restrepo',
      ciudad: 'Cali',
      material: 'PLA Mate Ámbar Cálido',
      tiempo_entrega: '2 a 3 días hábiles',
      dimensiones: '18 x 18 x 22 cm',
      rating: 4.9,
      resenas_count: 28,
      descripcion: 'Lámpara de sobremesa con patrón celular inspirado en colmenas naturales. Proyecta un ambiente cálido y relajante con bombillos LED estándar E27.',
      icono: '🏮',
      color_muestra: '#D97706',
      etiqueta: 'Favorito de la Colonia'
    },
    {
      id: 'prod-2',
      nombre: 'Soporte Ergonómico para Audífonos',
      categoria: 'gadgets',
      categoria_nombre: 'Gadgets & Oficina',
      precio: 54000,
      creador_id: 'pedro',
      creador_nombre: 'Pedro Gaviria',
      ciudad: 'Bogotá',
      material: 'PETG Negro Carbón',
      tiempo_entrega: '1 a 2 días hábiles',
      dimensiones: '12 x 14 x 26 cm',
      rating: 4.8,
      resenas_count: 42,
      descripcion: 'Base pesada y curva anatómica que protege la diadema de tus auriculares sin deformar las almohadillas. Incluye pies antideslizantes de silicona.',
      icono: '🎧',
      color_muestra: '#334155',
      etiqueta: 'Robusto'
    },
    {
      id: 'prod-3',
      nombre: 'Maceta Modular "AntHill" Auto-Riego',
      categoria: 'decoracion',
      categoria_nombre: 'Hogar & Decoración',
      precio: 42000,
      creador_id: 'sofia',
      creador_nombre: 'Sofía Cárdenas',
      ciudad: 'Bucaramanga',
      material: 'PLA Bio-Filamento Terracota',
      tiempo_entrega: '2 días hábiles',
      dimensiones: '13 x 13 x 15 cm',
      rating: 5.0,
      resenas_count: 19,
      descripcion: 'Sistema de hidratación por mecha de algodón para plantas de interior y suculentas. Riega una vez cada 10 días sin preocupaciones.',
      icono: '🪴',
      color_muestra: '#B45309',
      etiqueta: 'Sostenible'
    },
    {
      id: 'prod-4',
      nombre: 'Torre de Dados del Dragón',
      categoria: 'juegos',
      categoria_nombre: 'Miniaturas & Rol',
      precio: 69000,
      creador_id: 'enrique',
      creador_nombre: 'Mateo & Enrique',
      ciudad: 'Medellín',
      material: 'Resina UV Alta Definición',
      tiempo_entrega: '2 a 4 días hábiles',
      dimensiones: '15 x 16 x 20 cm',
      rating: 4.9,
      resenas_count: 35,
      descripcion: 'Diseñada para partidas de rol. Los dados ruedan a través de una escalera en espiral interna y salen a la bandeja esculpida con escamas.',
      icono: '🐉',
      color_muestra: '#7C2D12',
      etiqueta: 'Edición Rol'
    },
    {
      id: 'prod-5',
      nombre: 'Organizador de Cables Magnético',
      categoria: 'gadgets',
      categoria_nombre: 'Gadgets & Oficina',
      precio: 32000,
      creador_id: 'pedro',
      creador_nombre: 'Pedro Gaviria',
      ciudad: 'Bogotá',
      material: 'TPU Flexible Premium',
      tiempo_entrega: '1 día hábil',
      dimensiones: 'Pack x 4 módulos',
      rating: 4.7,
      resenas_count: 16,
      descripcion: 'Se adhiere con imanes discretos al borde de cualquier mesa. Sostiene cables USB-C, Lightning y HDMI sin resbalarse ni rallar madera.',
      icono: '⚡',
      color_muestra: '#475569',
      etiqueta: 'Práctico'
    },
    {
      id: 'prod-6',
      nombre: 'Jarrón Escultural "Duna"',
      categoria: 'decoracion',
      categoria_nombre: 'Hogar & Decoración',
      precio: 65000,
      creador_id: 'laura',
      creador_nombre: 'Laura Restrepo',
      ciudad: 'Cali',
      material: 'PLA Mate Marfil Seda',
      tiempo_entrega: '2 días hábiles',
      dimensiones: '14 x 14 x 24 cm',
      rating: 5.0,
      resenas_count: 14,
      descripcion: 'Geometría suave y orgánica impresa en una sola pieza continua. Tratado internamente para ramas secas o flores frescas.',
      icono: '🏺',
      color_muestra: '#D97706',
      etiqueta: 'Diseño'
    },
    {
      id: 'prod-7',
      nombre: 'Miniatura Caballero Mech Titán 75mm',
      categoria: 'juegos',
      categoria_nombre: 'Miniaturas & Rol',
      precio: 48000,
      creador_id: 'enrique',
      creador_nombre: 'Mateo & Enrique',
      ciudad: 'Medellín',
      material: 'Resina Gris Ultra-Curada',
      tiempo_entrega: '2 a 3 días hábiles',
      dimensiones: 'Escala 75mm con peana',
      rating: 4.9,
      resenas_count: 23,
      descripcion: 'Impresión milimétrica a 0.02mm sin capas perceptibles, curada bajo UV con soporte lavado. Lista para pintura artística.',
      icono: '⚔️',
      color_muestra: '#64748B',
      etiqueta: 'Colección'
    },
    {
      id: 'prod-8',
      nombre: 'Pomo Ergonómico Industrial M8',
      categoria: 'repuestos',
      categoria_nombre: 'Repuestos & Taller',
      precio: 36000,
      creador_id: 'pedro',
      creador_nombre: 'Pedro Gaviria',
      ciudad: 'Bogotá',
      material: 'Nylon con Fibra de Carbono',
      tiempo_entrega: '1 a 2 días hábiles',
      dimensiones: 'Rosca metálica M8 insertada',
      rating: 5.0,
      resenas_count: 11,
      descripcion: 'Resistencia industrial a torsión y temperatura (hasta 110°C). Perfecto para herramientas, trípodes o maquinaria de taller.',
      icono: '🔧',
      color_muestra: '#1E293B',
      etiqueta: 'Ingeniería'
    }
  ],
  favoritos: {}, // { 'prod-1': true }
  cotizaciones: [],
  sesion: null
};

// Cargar caché local
try {
  const guardado = localStorage.getItem(KEY_LOCAL);
  if (guardado) {
    const parseado = JSON.parse(guardado);
    BD = Object.assign(BD, parseado);
  }
} catch (e) {
  console.warn('Caché no disponible:', e);
}

function guardarCacheLocal() {
  try {
    localStorage.setItem(KEY_LOCAL, JSON.stringify(BD));
  } catch (e) {
    console.warn('Error al guardar caché:', e);
  }
}

// Sincronización con backend PHP
async function sincronizarConPHP() {
  try {
    const res = await fetch(URL_PHP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'obtener_todo' })
    });
    const json = await res.json();
    if (json && json.ok && json.datos) {
      if (json.datos.vendedores) BD.vendedores = json.datos.vendedores;
      if (json.datos.productos && json.datos.productos.length) BD.productos = json.datos.productos;
      if (json.datos.cotizaciones) BD.cotizaciones = json.datos.cotizaciones;
      guardarCacheLocal();
      actualizarContadorFavoritos();
      renderizarProductos();
      renderizarCreadores();
    }
  } catch (err) {
    console.info('Backend PHP disponible en servidor.', err);
  }
}

/* -------------------------------------------------------------
   3. GESTIÓN DE MODALES ROBUSTA Y ACCESIBLE
   ------------------------------------------------------------- */
function cerrarTodosLosModales() {
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.hidden = true;
    m.classList.remove('activo');
    m.classList.add('oculto');
    m.style.display = 'none';
  });
  document.body.style.overflow = '';
}

function abrirModal(modalId) {
  cerrarTodosLosModales();
  const modal = $(modalId);
  if (!modal) return;
  modal.hidden = false;
  modal.classList.add('activo');
  modal.classList.remove('oculto');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Sincronizar emblemas de los modales con el tema activo
  const temaActual = document.documentElement.getAttribute('data-tema') === 'oscuro' ? 'oscuro' : 'claro';
  actualizarIdentidadVisual(temaActual);
}

// Cierre global con ESC y click exterior
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarTodosLosModales();
});

document.querySelectorAll('.modal-overlay').forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) cerrarTodosLosModales();
  });
});

/* -------------------------------------------------------------
   4. FAVORITOS DE PRODUCTOS
   ------------------------------------------------------------- */
function esFavorito(prodId) {
  return !!BD.favoritos[prodId];
}

function toggleFavorito(prodId) {
  if (BD.favoritos[prodId]) {
    delete BD.favoritos[prodId];
    mostrarToast('Quitado de tus favoritos', 'info');
  } else {
    BD.favoritos[prodId] = true;
    mostrarToast('Guardado en tus favoritos ❤️', 'exito');
  }
  guardarCacheLocal();
  actualizarContadorFavoritos();
  renderizarProductos();
}

function actualizarContadorFavoritos() {
  const conteo = Object.keys(BD.favoritos).length;
  const badge = $('badgeFavoritos');
  if (badge) badge.textContent = conteo;
}

/* -------------------------------------------------------------
   5. RENDERIZADO DEL MARKETPLACE DE PRODUCTOS
   ------------------------------------------------------------- */
let filtroCategoriaActual = 'todas';
let busquedaActual = '';
let ordenActual = 'destacados';

function renderizarProductos() {
  const grid = $('gridProductos');
  if (!grid) return;

  let lista = [...BD.productos];

  // Filtro por categoría
  if (filtroCategoriaActual !== 'todas') {
    lista = lista.filter(p => p.categoria === filtroCategoriaActual);
  }

  // Búsqueda por texto
  if (busquedaActual) {
    const q = busquedaActual.toLowerCase();
    lista = lista.filter(p => 
      p.nombre.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q) ||
      p.creador_nombre.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q)
    );
  }

  // Ordenamiento
  if (ordenActual === 'precio_asc') {
    lista.sort((a, b) => a.precio - b.precio);
  } else if (ordenActual === 'precio_desc') {
    lista.sort((a, b) => b.precio - a.precio);
  } else if (ordenActual === 'rating') {
    lista.sort((a, b) => b.rating - a.rating);
  }

  if (!lista.length) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:3.5rem 1rem; background:var(--fondo-panel); border:1px solid var(--borde); border-radius:var(--radio-md);">
        <div style="font-size:3rem; margin-bottom:0.75rem;">🔍</div>
        <h3 style="font-size:1.2rem; font-weight:800; color:var(--texto);">No encontramos piezas con ese criterio</h3>
        <p style="color:var(--texto-secundario); max-width:440px; margin:0.4rem auto 1.5rem;">
          Prueba con otra palabra clave o solicita una pieza a medida en nuestro cotizador 3D.
        </p>
        <a href="#cotizador" class="btn">Cotizar Pieza Personalizada</a>
      </div>
    `;
    return;
  }

  grid.innerHTML = lista.map(p => {
    const fav = esFavorito(p.id);
    const creador = BD.vendedores[p.creador_id] || {};
    const handleAutor = p.creador_handle || creador.handle || ('@' + p.creador_nombre.replace(/\s+/g, ''));
    return `
      <div class="producto-tarjeta" data-prod-id="${esc(p.id)}">
        <div class="producto-imagen-box" style="background: linear-gradient(135deg, ${esc(p.color_muestra)}18, var(--fondo-suave));">
          <span class="badge-producto-tag">${esc(p.etiqueta || 'Artesanal')}</span>
          <button type="button" class="btn-favorito-prod ${fav ? 'activo' : ''}" data-fav-btn="${esc(p.id)}" aria-label="Favorito" title="Guardar en favoritos">
            ${fav ? '❤️' : '🤍'}
          </button>
          <div class="producto-icono-grande">${p.icono || '📦'}</div>
        </div>

        <div class="producto-cuerpo">
          <div>
            <div class="producto-categoria-texto">${esc(p.categoria_nombre)}</div>
            <h3 class="producto-titulo">${esc(p.nombre)}</h3>
            
            <div class="producto-creador-fila">
              <span class="producto-creador-avatar">👤</span>
              <span>Creado por <b style="color:var(--secundario);">${esc(handleAutor)}</b> · ${esc(p.ciudad)}</span>
            </div>

            <div class="producto-meta-chips">
              <span class="chip-sutil">🧵 ${esc(p.material)}</span>
              <span class="chip-sutil">⏱️ ${esc(p.tiempo_entrega)}</span>
              <span class="chip-sutil" style="color:#B45309; font-weight:700;">★ ${p.rating} (${p.resenas_count})</span>
            </div>
          </div>

          <div class="producto-pie-tarjeta">
            <div>
              <span class="producto-precio">${pesos(p.precio)}</span>
              <span class="producto-precio-sub">Precio sugerido COP</span>
            </div>
            <button type="button" class="btn sm" data-ver-detalle="${esc(p.id)}">
              Ver Detalle
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Eventos de click en tarjeta y ver detalle
  grid.querySelectorAll('[data-ver-detalle]').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      const id = btn.getAttribute('data-ver-detalle');
      abrirDetalleProducto(id);
    };
  });

  // Eventos de favoritos
  grid.querySelectorAll('[data-fav-btn]').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      const id = btn.getAttribute('data-fav-btn');
      toggleFavorito(id);
    };
  });
}

function abrirDetalleProducto(id) {
  const p = BD.productos.find(item => item.id === id);
  if (!p) return;

  const creador = BD.vendedores[p.creador_id] || {
    nombre: p.creador_nombre,
    handle: '@' + p.creador_nombre.replace(/\s+/g, ''),
    ciudad: p.ciudad,
    tel: '573001234567',
    maquinas: 'Impresora 3D de alta precisión'
  };

  const cont = $('contenidoModalProducto');
  if (!cont) return;

  cont.innerHTML = `
    <div style="display:flex; gap:1.75rem; flex-wrap:wrap;">
      <div style="flex:1; min-width:240px; background:linear-gradient(135deg, ${esc(p.color_muestra)}20, var(--fondo-panel)); border:1px solid var(--borde); border-radius:var(--radio-md); display:flex; align-items:center; justify-content:center; padding:3rem 1rem;">
        <span style="font-size:6.5rem; filter:drop-shadow(0 10px 20px rgba(0,0,0,0.1));">${p.icono || '📦'}</span>
      </div>

      <div style="flex:1.4; min-width:280px; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <span class="badge-producto-tag" style="position:static; display:inline-block; margin-bottom:0.5rem;">${esc(p.etiqueta || 'Comunidad')}</span>
          <h2 id="modalProdTitulo" style="font-size:1.6rem; font-weight:800; color:var(--texto); line-height:1.2;">${esc(p.nombre)}</h2>
          <div style="font-size:0.88rem; color:var(--secundario); font-weight:700; margin:0.35rem 0 1rem;">
            Creado por ${esc(creador.handle || p.creador_nombre)} · ${esc(p.ciudad)}
          </div>

          <p style="color:var(--texto-secundario); font-size:0.92rem; line-height:1.6; margin-bottom:1.25rem;">
            ${esc(p.descripcion)}
          </p>

          <div style="background-color:var(--fondo); border:1px solid var(--borde-suave); border-radius:var(--radio-sm); padding:0.85rem 1rem; margin-bottom:1.5rem; font-size:0.86rem; display:flex; flex-direction:column; gap:0.4rem;">
            <div><strong>🧵 Material:</strong> ${esc(p.material)}</div>
            <div><strong>📐 Dimensiones:</strong> ${esc(p.dimensiones || 'Personalizable')}</div>
            <div><strong>⏱️ Tiempo de elaboración:</strong> ${esc(p.tiempo_entrega)}</div>
            <div><strong>🖨️ Equipos de taller:</strong> ${esc(creador.maquinas || '3D FDM / Resina')}</div>
            <div><strong>★ Valoración:</strong> ${p.rating} de 5.0 (${p.resenas_count} opiniones de clientes)</div>
          </div>
        </div>

        <div>
          <div style="margin-bottom:1rem; display:flex; align-items:baseline; justify-content:space-between;">
            <div>
              <span style="font-size:0.75rem; text-transform:uppercase; color:var(--texto-secundario); font-weight:700;">Precio de la pieza</span>
              <div style="font-family:var(--fuente-mono); font-size:1.9rem; font-weight:800; color:var(--secundario);">${pesos(p.precio)} COP</div>
            </div>
          </div>

          <div style="display:flex; gap:0.75rem;">
            <a href="https://wa.me/${creador.tel}?text=${encodeURIComponent('Hola ' + creador.nombre + ', vi tu pieza "' + p.nombre + '" en PrintAnts y deseo encargarla.')}" target="_blank" rel="noopener noreferrer" class="btn" style="flex:1;">
              📱 Encargar por WhatsApp
            </a>
            <button type="button" class="btn secundario" id="btnPersonalizarEnCotizador">
              Personalizar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  abrirModal('modalDetalleProducto');

  const btnCerrar = $('btnCerrarModalProd');
  if (btnCerrar) btnCerrar.onclick = cerrarTodosLosModales;

  const btnPers = $('btnPersonalizarEnCotizador');
  if (btnPers) {
    btnPers.onclick = () => {
      cerrarTodosLosModales();
      window.location.hash = '#cotizador';
      if ($('nombrePieza')) $('nombrePieza').value = p.nombre + ' (Personalizado)';
      if ($('vendedor')) $('vendedor').value = p.creador_id;
      calcularCotizacion();
    };
  }
}

/* -------------------------------------------------------------
   6. RENDERIZADO DEL DIRECTORIO DE CREADORES
   ------------------------------------------------------------- */
function renderizarCreadores() {
  const cont = $('gridCreadores');
  if (!cont) return;

  const creadores = Object.values(BD.vendedores || {});
  cont.innerHTML = creadores.map(c => `
    <div class="creador-tarjeta">
      <div>
        <div class="creador-header">
          <div class="creador-avatar-box">${c.avatar || '🧔‍♂️'}</div>
          <div class="creador-nombres">
            <h3>${esc(c.nombre)}</h3>
            <div class="creador-persona">${esc(c.creador || 'Maker Pro')} <span style="font-weight:normal; opacity:0.85; font-size:0.82rem;">(${esc(c.handle || '@' + c.id)})</span></div>
            <div class="creador-ciudad">📍 ${esc(c.ciudad)}</div>
          </div>
        </div>

        <p class="creador-bio">${esc(c.nota)}</p>

        <div class="creador-maquinas-box">
          <strong>Máquinas en taller:</strong>
          <span>${esc(c.maquinas || 'Impresión 3D FDM & Resina')}</span>
        </div>
      </div>

      <div class="creador-acciones">
        <div class="creador-tarifa">
          ${pesos(c.hora)} <span>/h máquina</span>
        </div>
        <button type="button" class="btn sm secundario" data-cotizar-creador="${esc(c.id)}">
          Cotizar
        </button>
      </div>
    </div>
  `).join('');

  cont.querySelectorAll('[data-cotizar-creador]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-cotizar-creador');
      window.location.hash = '#cotizador';
      if ($('vendedor')) {
        $('vendedor').value = id;
        actualizarMaterialesCotizador();
        calcularCotizacion();
      }
    };
  });
}

/* -------------------------------------------------------------
   7. COTIZADOR 3D AVANZADO & GRÁFICO DE PASTEL
   ------------------------------------------------------------- */
let cotizacionActual = null;

function inicializarCotizador() {
  const selTaller = $('vendedor');
  if (!selTaller) return;

  const talleres = Object.keys(BD.vendedores || {});
  selTaller.innerHTML = talleres.map(id => {
    const v = BD.vendedores[id];
    return `<option value="${esc(id)}">${esc(v.nombre)} (${esc(v.ciudad)}) - ${pesos(v.hora)}/h</option>`;
  }).join('');

  actualizarMaterialesCotizador();
  calcularCotizacion();

  selTaller.onchange = () => {
    actualizarMaterialesCotizador();
    calcularCotizacion();
  };

  ['material', 'horas', 'minutos', 'gramos', 'cantidad'].forEach(id => {
    const el = $(id);
    if (el) el.oninput = () => calcularCotizacion();
  });

  const infill = $('infillRelleno');
  if (infill) {
    infill.oninput = () => {
      const val = infill.value;
      let desc = 'Ligero (Decorativo)';
      if (val >= 75) desc = 'Ultra Resistente (Mecánico)';
      else if (val >= 40) desc = 'Funcional (Carcasas)';
      else if (val >= 20) desc = 'Estándar recomendado';
      if ($('infillTexto')) $('infillTexto').textContent = `${val}% (${desc})`;
      calcularCotizacion();
    };
  }

  // Plantillas rápidas
  document.querySelectorAll('.btn-plantilla').forEach(btn => {
    btn.onclick = () => {
      if ($('horas')) $('horas').value = btn.dataset.h;
      if ($('minutos')) $('minutos').value = btn.dataset.m;
      if ($('gramos')) $('gramos').value = btn.dataset.g;
      if ($('nombrePieza')) $('nombrePieza').value = btn.dataset.n;
      calcularCotizacion();
      mostrarToast(`Plantilla "${btn.dataset.n}" cargada`, 'info');
    };
  });

  // Guardar cotización
  const btnGuardar = $('btnGuardarCotizacion');
  if (btnGuardar) {
    btnGuardar.onclick = async () => {
      if (!cotizacionActual) return;
      btnGuardar.disabled = true;
      btnGuardar.textContent = 'Guardando...';

      try {
        const res = await fetch(URL_PHP, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accion: 'guardar_cotizacion', cotizacion: cotizacionActual })
        });
        const json = await res.json();
        const guardada = (json && json.ok && json.cotizacion) ? json.cotizacion : Object.assign({}, cotizacionActual, {
          id: 'COT-' + Date.now().toString().slice(-6),
          fecha: new Date().toISOString().slice(0, 16).replace('T', ' ')
        });
        BD.cotizaciones.unshift(guardada);
        guardarCacheLocal();
        mostrarToast('Presupuesto guardado exitosamente', 'exito');
      } catch (e) {
        mostrarToast('Guardado localmente', 'info');
      } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = '💾 Guardar Cotización en PHP';
      }
    };
  }

  // Ver comprobante
  const btnTicket = $('btnVerComprobante');
  if (btnTicket) {
    btnTicket.onclick = () => {
      if (cotizacionActual) abrirComprobante(cotizacionActual);
    };
  }

  // WhatsApp directo
  const btnWa = $('btnWhatsAppDirecto');
  if (btnWa) {
    btnWa.onclick = () => {
      if (!cotizacionActual) return;
      const v = BD.vendedores[cotizacionActual.vendedor_id];
      if (!v || !v.tel) {
        mostrarToast('Número de taller no configurado', 'error');
        return;
      }
      const texto = `Hola *${v.nombre}*, coticé mi proyecto en *PrintAnts*:\n\n` +
        `📦 *Pieza:* ${cotizacionActual.pieza_nombre}\n` +
        `🧵 *Material:* ${cotizacionActual.material}\n` +
        `⏱️ *Tiempo:* ${cotizacionActual.horas}h ${cotizacionActual.minutos}m\n` +
        `⚖️ *Peso neto:* ${cotizacionActual.gramos} g\n` +
        `🔢 *Cantidad:* ${cotizacionActual.cantidad} ud\n` +
        `💰 *Total estimado:* ${pesos(cotizacionActual.total)} COP\n\n` +
        `¿Cuándo podrías comenzar la impresión?`;
      window.open(`https://wa.me/${v.tel}?text=${encodeURIComponent(texto)}`, '_blank');
    };
  }
}

function actualizarMaterialesCotizador() {
  const tallerId = $('vendedor') ? $('vendedor').value : 'pedro';
  const v = BD.vendedores[tallerId] || BD.vendedores['pedro'];
  const selMat = $('material');
  if (!selMat || !v || !v.mat) return;

  const mats = Object.keys(v.mat);
  selMat.innerHTML = mats.map(m => `
    <option value="${esc(m)}">${esc(m)} (${pesos(v.mat[m])} / kg)</option>
  `).join('');
}

function calcularCotizacion() {
  const tallerId = $('vendedor') ? $('vendedor').value : 'pedro';
  const v = BD.vendedores[tallerId] || BD.vendedores['pedro'];
  if (!v) return;

  const mat = $('material') ? $('material').value : 'PLA';
  const precioKg = (v.mat && v.mat[mat]) ? v.mat[mat] : 65000;

  const horas = leer('horas');
  const minutos = leer('minutos');
  const gramos = Math.max(1, leer('gramos'));
  const cantidad = Math.max(1, leer('cantidad'));
  const nombrePieza = ($('nombrePieza') ? $('nombrePieza').value.trim() : '') || 'Prototipo 3D';

  const horasNum = horas + (minutos / 60);

  // 1. Costo tiempo de máquina
  const costoTiempo = horasNum * v.hora * cantidad;

  // 2. Costo material
  const costoMaterial = (gramos * (precioKg / 1000)) * cantidad;

  // 3. Margen comercial y acabado
  const costoMargen = (costoTiempo + costoMaterial) * (v.margen / 100);

  // 4. Descuentos por volumen
  let porcentajeDesc = 0;
  if (cantidad >= 10) porcentajeDesc = 0.10;
  else if (cantidad >= 3) porcentajeDesc = 0.05;

  const subtotal = costoTiempo + costoMaterial + costoMargen;
  const descuento = subtotal * porcentajeDesc;
  const total = Math.round(subtotal - descuento);

  // Actualizar UI
  if ($('costoTiempo')) $('costoTiempo').textContent = pesos(costoTiempo);
  if ($('costoMaterial')) $('costoMaterial').textContent = pesos(costoMaterial);
  if ($('costoMargen')) $('costoMargen').textContent = pesos(costoMargen);
  if ($('total')) $('total').textContent = pesos(total);

  if ($('filaDescuento')) {
    if (descuento > 0) {
      $('filaDescuento').hidden = false;
      if ($('costoDescuento')) $('costoDescuento').textContent = `- ${pesos(descuento)} (${porcentajeDesc * 100}%)`;
    } else {
      $('filaDescuento').hidden = true;
    }
  }

  // Gráfico de pastel integrado
  renderizarGraficoPie(costoTiempo, costoMaterial, costoMargen, total);

  cotizacionActual = {
    cliente_id: BD.sesion || 'invitado',
    cliente_nombre: 'Cliente Web',
    vendedor_id: tallerId,
    vendedor_nombre: v.nombre,
    pieza_nombre: nombrePieza,
    material: mat,
    horas,
    minutos,
    gramos,
    cantidad,
    costo_tiempo: costoTiempo,
    costo_material: costoMaterial,
    costo_margen: costoMargen,
    descuento,
    total
  };
}

function renderizarGraficoPie(cTiempo, cMat, cMargen, cTotal) {
  const cont = $('contenedorGraficoPie');
  if (!cont) return;

  const suma = cTiempo + cMat + cMargen;
  if (suma <= 0) {
    cont.innerHTML = '<p class="suave">Ingresa los datos para ver la distribución porcentual.</p>';
    return;
  }

  const pTiempo = Math.round((cTiempo / suma) * 100);
  const pMat = Math.round((cMat / suma) * 100);
  const pMargen = Math.max(0, 100 - pTiempo - pMat);

  const radio = 68;
  const perimetro = 2 * Math.PI * radio;

  const dashTiempo = (pTiempo / 100) * perimetro;
  const dashMat = (pMat / 100) * perimetro;
  const dashMargen = (pMargen / 100) * perimetro;

  const offsetTiempo = 0;
  const offsetMat = -dashTiempo;
  const offsetMargen = -(dashTiempo + dashMat);

  cont.innerHTML = `
    <div class="grafico-pie-svg-wrapper">
      <svg class="grafico-pie-svg" viewBox="0 0 190 190" aria-label="Distribución del costo de impresión 3D">
        <circle class="grafico-pie-sector" cx="95" cy="95" r="${radio}"
          stroke="var(--acento-tiempo)"
          stroke-dasharray="${dashTiempo} ${perimetro}"
          stroke-dashoffset="${offsetTiempo}">
        </circle>
        <circle class="grafico-pie-sector" cx="95" cy="95" r="${radio}"
          stroke="var(--acento-material)"
          stroke-dasharray="${dashMat} ${perimetro}"
          stroke-dashoffset="${offsetMat}">
        </circle>
        <circle class="grafico-pie-sector" cx="95" cy="95" r="${radio}"
          stroke="var(--acento-margen)"
          stroke-dasharray="${dashMargen} ${perimetro}"
          stroke-dashoffset="${offsetMargen}">
        </circle>
      </svg>
      <div class="grafico-pie-centro">
        <div class="grafico-pie-centro-etiqueta">Total Neto</div>
        <div class="grafico-pie-centro-total">${pesos(cTotal)}</div>
      </div>
    </div>

    <div class="grafico-pie-leyenda">
      <div class="grafico-pie-item">
        <span><span class="grafico-pie-color-dot" style="background:var(--acento-tiempo);"></span> Tiempo de Máquina</span>
        <strong>${pTiempo}% <span class="mono" style="color:var(--texto-secundario); font-weight:normal; font-size:0.8rem;">(${pesos(cTiempo)})</span></strong>
      </div>
      <div class="grafico-pie-item">
        <span><span class="grafico-pie-color-dot" style="background:var(--acento-material);"></span> Filamento / Resina</span>
        <strong>${pMat}% <span class="mono" style="color:var(--texto-secundario); font-weight:normal; font-size:0.8rem;">(${pesos(cMat)})</span></strong>
      </div>
      <div class="grafico-pie-item">
        <span><span class="grafico-pie-color-dot" style="background:var(--acento-margen);"></span> Margen & Taller</span>
        <strong>${pMargen}% <span class="mono" style="color:var(--texto-secundario); font-weight:normal; font-size:0.8rem;">(${pesos(cMargen)})</span></strong>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------
   8. COMPROBANTE OFICIAL / TICKET MODAL
   ------------------------------------------------------------- */
function abrirComprobante(cot) {
  if ($('ticketId')) $('ticketId').textContent = cot.id || 'COT-OFICIAL';
  if ($('ticketFecha')) $('ticketFecha').textContent = `Fecha: ${cot.fecha || new Date().toISOString().slice(0, 10)}`;
  if ($('ticketCliente')) $('ticketCliente').textContent = cot.cliente_nombre || 'Cliente Web';
  if ($('ticketTaller')) $('ticketTaller').textContent = cot.vendedor_nombre || 'Pedro Impresiones 3D';
  if ($('ticketPieza')) $('ticketPieza').textContent = cot.pieza_nombre || 'Pieza 3D';
  if ($('ticketMaterial')) $('ticketMaterial').textContent = cot.material || 'PLA';
  if ($('ticketTiempo')) $('ticketTiempo').textContent = `${cot.horas || 0}h ${cot.minutos || 0}m`;
  if ($('ticketPeso')) $('ticketPeso').textContent = `${cot.gramos || 0} g`;
  if ($('ticketCantidad')) $('ticketCantidad').textContent = `${cot.cantidad || 1} ud`;
  if ($('ticketCostoTiempo')) $('ticketCostoTiempo').textContent = pesos(cot.costo_tiempo || 0);
  if ($('ticketCostoMaterial')) $('ticketCostoMaterial').textContent = pesos(cot.costo_material || 0);
  if ($('ticketCostoMargen')) $('ticketCostoMargen').textContent = pesos(cot.costo_margen || 0);
  if ($('ticketTotal')) $('ticketTotal').textContent = `${pesos(cot.total || 0)} COP`;

  abrirModal('modalComprobante');

  const btnCerrar = $('btnCerrarModalTicket');
  if (btnCerrar) btnCerrar.onclick = cerrarTodosLosModales;

  const btnCerrarAbajo = $('btnCerrarModalTicketAbajo');
  if (btnCerrarAbajo) btnCerrarAbajo.onclick = cerrarTodosLosModales;

  const btnImp = $('btnImprimirTicket');
  if (btnImp) btnImp.onclick = () => window.print();
}

/* -------------------------------------------------------------
   9. MODAL "QUIERO VENDER" (REGISTRO DE TALLER)
   ------------------------------------------------------------- */
function inicializarRegistroTaller() {
  const btnNav = $('btnQuieroVenderNav');
  const btnHero = $('btnHeroQuieroVender');
  const btnUnirme = $('btnUnirmeCreadores');
  const btnFooter = $('linkFooterQuieroVender');

  [btnNav, btnHero, btnUnirme, btnFooter].forEach(btn => {
    if (btn) {
      btn.onclick = e => {
        e.preventDefault();
        abrirModal('modalQuieroVender');
      };
    }
  });

  const btnCerrar = $('btnCerrarModalVender');
  if (btnCerrar) btnCerrar.onclick = cerrarTodosLosModales;

  const btnEnviar = $('btnEnviarRegistroTaller');
  if (btnEnviar) {
    btnEnviar.onclick = async () => {
      const nombre = $('regTallerNombre') ? $('regTallerNombre').value.trim() : '';
      const creador = $('regTallerCreador') ? $('regTallerCreador').value.trim() : '';
      const ciudad = $('regTallerCiudad') ? $('regTallerCiudad').value.trim() : '';
      const tel = $('regTallerTel') ? $('regTallerTel').value.trim() : '';
      const maquinas = $('regTallerMaquinas') ? $('regTallerMaquinas').value.trim() : '';
      const bio = $('regTallerBio') ? $('regTallerBio').value.trim() : '';

      if (!nombre || !creador || !tel) {
        mostrarToast('Por favor completa tu nombre, taller y WhatsApp', 'error');
        return;
      }

      btnEnviar.disabled = true;
      btnEnviar.textContent = 'Registrando tu taller...';

      const nuevoId = 'taller_' + Math.random().toString(36).substring(2, 7);
      const nuevoTaller = {
        id: nuevoId,
        nombre,
        creador,
        avatar: '🛠️',
        nota: bio || 'Taller especializado en manufactura aditiva y prototipado rápido.',
        maquinas: maquinas || 'Impresión 3D FDM',
        hora: 3000,
        margen: 20,
        tel,
        ciudad: ciudad || 'Colombia',
        insignia: 'Taller Nuevo · En Verificación',
        mat: { PLA: 60000, PETG: 70000 }
      };

      BD.vendedores[nuevoId] = nuevoTaller;
      guardarCacheLocal();

      try {
        await fetch(URL_PHP, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accion: 'guardar_vendedor', vendedor: nuevoTaller })
        });
      } catch (e) {}

      btnEnviar.disabled = false;
      btnEnviar.textContent = '✨ Registrar mi Taller en PrintAnts';
      cerrarTodosLosModales();
      mostrarToast(`¡Bienvenido ${creador}! Tu taller ya está activo`, 'exito');
      renderizarCreadores();
      inicializarCotizador();
    };
  }
}

/* -------------------------------------------------------------
   10. MODAL DE CUENTA / AUTENTICACIÓN
   ------------------------------------------------------------- */
function inicializarAuth() {
  const btnAuth = $('btnAbrirAuth');
  if (btnAuth) {
    btnAuth.onclick = () => {
      renderizarEstadoCuenta();
      abrirModal('modalCuenta');
    };
  }

  const btnCerrar = $('btnCerrarModalCuenta');
  if (btnCerrar) btnCerrar.onclick = cerrarTodosLosModales;
}

function renderizarEstadoCuenta() {
  const cont = $('contenidoEstadoSesion');
  if (!cont) return;

  if (BD.sesion && BD.usuarios && BD.usuarios[BD.sesion]) {
    const u = BD.usuarios[BD.sesion];
    cont.innerHTML = `
      <div style="text-align:center; padding:1rem 0;">
        <span class="hero-insignia">Sesión Activa</span>
        <h3 style="font-size:1.2rem; font-weight:800; color:var(--texto); margin:0.4rem 0;">${esc(u.nombre)}</h3>
        <p style="color:var(--texto-secundario); font-size:0.88rem; margin-bottom:1.5rem;">${esc(u.correo)}</p>
        <button type="button" class="btn secundario sm" id="btnCerrarSesion">Cerrar Sesión</button>
      </div>
    `;
    const btnSalir = $('btnCerrarSesion');
    if (btnSalir) {
      btnSalir.onclick = () => {
        BD.sesion = null;
        guardarCacheLocal();
        mostrarToast('Sesión cerrada', 'info');
        renderizarEstadoCuenta();
        if ($('textoBtnAuth')) $('textoBtnAuth').textContent = 'Ingresar';
      };
    }
  } else {
    cont.innerHTML = `
      <form id="formAuth" onsubmit="return false;">
        <label for="inputAuthCorreo">Correo Electrónico</label>
        <input id="inputAuthCorreo" type="email" placeholder="hola@ejemplo.com" required>

        <label for="inputAuthClave">Contraseña</label>
        <input id="inputAuthClave" type="password" placeholder="••••••••" required>

        <button type="submit" class="btn" id="btnEjecutarLogin" style="width:100%; margin-top:1.5rem;">
          Iniciar Sesión / Entrar
        </button>
        <p style="text-align:center; font-size:0.78rem; color:var(--texto-secundario); margin-top:1rem;">
          Si no tienes cuenta se creará automáticamente en modo seguro.
        </p>
      </form>
    `;

    const btnLogin = $('btnEjecutarLogin');
    if (btnLogin) {
      btnLogin.onclick = () => {
        const correo = $('inputAuthCorreo') ? $('inputAuthCorreo').value.trim() : '';
        const clave = $('inputAuthClave') ? $('inputAuthClave').value : '';
        if (!correo || clave.length < 4) {
          mostrarToast('Ingresa un correo y contraseña de al menos 4 caracteres', 'error');
          return;
        }

        const idLocal = 'u_' + Math.random().toString(36).substring(2, 8);
        BD.usuarios = BD.usuarios || {};
        BD.usuarios[idLocal] = {
          id: idLocal,
          correo,
          nombre: correo.split('@')[0]
        };
        BD.sesion = idLocal;
        guardarCacheLocal();

        if ($('textoBtnAuth')) $('textoBtnAuth').textContent = BD.usuarios[idLocal].nombre;
        mostrarToast('¡Bienvenido a PrintAnts!', 'exito');
        cerrarTodosLosModales();
      };
    }
  }
}

/* -------------------------------------------------------------
   11. PESTAÑAS "¿CÓMO FUNCIONA?"
   ------------------------------------------------------------- */
function inicializarComoFunciona() {
  const btnCompradores = $('pestanaCompradores');
  const btnCreadores = $('pestanaCreadores');
  const bloqueCompradores = $('bloquePasosCompradores');
  const bloqueCreadores = $('bloquePasosCreadores');

  if (btnCompradores && btnCreadores) {
    btnCompradores.onclick = () => {
      btnCompradores.classList.add('activa');
      btnCreadores.classList.remove('activa');
      if (bloqueCompradores) bloqueCompradores.hidden = false;
      if (bloqueCreadores) bloqueCreadores.hidden = true;
    };

    btnCreadores.onclick = () => {
      btnCreadores.classList.add('activa');
      btnCompradores.classList.remove('activa');
      if (bloqueCompradores) bloqueCompradores.hidden = true;
      if (bloqueCreadores) bloqueCreadores.hidden = false;
    };
  }
}

/* -------------------------------------------------------------
   12. CATEGORÍAS & FILTROS DE BÚSQUEDA
   ------------------------------------------------------------- */
function inicializarFiltros() {
  // Filtro por tarjetas de categorías
  document.querySelectorAll('[data-cat]').forEach(card => {
    card.onclick = () => {
      document.querySelectorAll('[data-cat]').forEach(c => c.classList.remove('activa'));
      card.classList.add('activa');
      const cat = card.getAttribute('data-cat');
      if (cat === 'personalizado') {
        window.location.hash = '#cotizador';
        const cot = $('cotizador');
        if (cot) cot.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      filtroCategoriaActual = cat;
      if ($('selectFiltroCategoria')) $('selectFiltroCategoria').value = cat;
      renderizarProductos();

      const expl = $('explorar');
      if (expl) expl.scrollIntoView({ behavior: 'smooth' });
    };
  });

  // Dropdown de categorías
  const selCat = $('selectFiltroCategoria');
  if (selCat) {
    selCat.onchange = () => {
      filtroCategoriaActual = selCat.value;
      document.querySelectorAll('[data-cat]').forEach(c => {
        if (c.getAttribute('data-cat') === selCat.value) c.classList.add('activa');
        else c.classList.remove('activa');
      });
      renderizarProductos();
    };
  }

  // Ordenamiento
  const selOrd = $('selectOrdenarProducto');
  if (selOrd) {
    selOrd.onchange = () => {
      ordenActual = selOrd.value;
      renderizarProductos();
    };
  }

  // Búsqueda en vivo
  const inpBusq = $('inputBuscarProducto');
  if (inpBusq) {
    inpBusq.oninput = () => {
      busquedaActual = inpBusq.value.trim();
      renderizarProductos();
    };
  }

  // Click en items del hero escaparate
  document.querySelectorAll('[data-producto-click]').forEach(el => {
    el.onclick = () => {
      const id = el.getAttribute('data-producto-click');
      abrirDetalleProducto(id);
    };
  });

  // Botón abrir favoritos en la cabecera
  const btnFavs = $('btnAbrirFavoritos');
  if (btnFavs) {
    btnFavs.onclick = () => {
      window.location.hash = '#explorar';
      const favIds = Object.keys(BD.favoritos);
      if (!favIds.length) {
        mostrarToast('Aún no has guardado creaciones favoritas', 'info');
        return;
      }
      mostrarToast(`Mostrando tus ${favIds.length} creaciones guardadas`, 'info');
      // Filtramos en vivo mostrando solo favoritos
      const grid = $('gridProductos');
      if (!grid) return;
      const listaFavs = BD.productos.filter(p => BD.favoritos[p.id]);
      grid.innerHTML = listaFavs.map(p => {
        const creador = BD.vendedores[p.creador_id] || {};
        const handleAutor = p.creador_handle || creador.handle || ('@' + p.creador_nombre.replace(/\s+/g, ''));
        return `
        <div class="producto-tarjeta" data-prod-id="${esc(p.id)}">
          <div class="producto-imagen-box" style="background: linear-gradient(135deg, ${esc(p.color_muestra)}18, var(--fondo-suave));">
            <span class="badge-producto-tag">❤️ Favorito</span>
            <button type="button" class="btn-favorito-prod activo" data-fav-btn="${esc(p.id)}" aria-label="Favorito">❤️</button>
            <div class="producto-icono-grande">${p.icono || '📦'}</div>
          </div>
          <div class="producto-cuerpo">
            <div>
              <div class="producto-categoria-texto">${esc(p.categoria_nombre)}</div>
              <h3 class="producto-titulo">${esc(p.nombre)}</h3>
              <div class="producto-creador-fila">
                <span>Creado por <b style="color:var(--secundario);">${esc(handleAutor)}</b> · ${esc(p.ciudad)}</span>
              </div>
            </div>
            <div class="producto-pie-tarjeta">
              <span class="producto-precio">${pesos(p.precio)}</span>
              <button type="button" class="btn sm" data-ver-detalle="${esc(p.id)}">Ver Detalle</button>
            </div>
          </div>
        </div>
      `;
      }).join('');

      grid.querySelectorAll('[data-ver-detalle]').forEach(btn => {
        btn.onclick = () => abrirDetalleProducto(btn.getAttribute('data-ver-detalle'));
      });
      grid.querySelectorAll('[data-fav-btn]').forEach(btn => {
        btn.onclick = () => toggleFavorito(btn.getAttribute('data-fav-btn'));
      });
    };
  }
}

/* -------------------------------------------------------------
   13. ARRANQUE
   ------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  inicializarTema();
  cerrarTodosLosModales();
  actualizarContadorFavoritos();
  renderizarProductos();
  renderizarCreadores();
  inicializarCotizador();
  inicializarComoFunciona();
  inicializarFiltros();
  inicializarRegistroTaller();
  inicializarAuth();
  sincronizarConPHP();

  // Soporte menú móvil
  const btnMenuMovil = $('btnMenuMovil');
  const menuNav = $('menuNavegacion');
  if (btnMenuMovil && menuNav) {
    btnMenuMovil.onclick = () => {
      menuNav.classList.toggle('abierto-movil');
    };
    menuNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => menuNav.classList.remove('abierto-movil'));
    });
  }
});
