let prendas = [];

// Referencias a las zonas de la página que actualiza el catálogo.
const rejillaPrendas = document.querySelector('#rejilla-prendas');
const dialogoPrenda = document.querySelector('#dialogo-prenda');
const contenidoDialogoPrenda = document.querySelector('#contenido-dialogo-prenda');
const dialogoBolsa = document.querySelector('#dialogo-bolsa');
const elementosBolsa = document.querySelector('#articulos-bolsa');
const pieBolsa = document.querySelector('#pie-bolsa');
const contadorBolsa = document.querySelector('#contador-bolsa');
// La bolsa se mantiene durante la visita mientras la persona agrega o quita artículos.
const bolsa = [];
const numeroWhatsApp = '5493515290303';
let prendaSeleccionada = null;
let categoriaSeleccionada = 'todos';

// Muestra los precios en pesos colombianos, sin decimales.
const formatearPrecio = (precio) => new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
}).format(precio);

function normalizarCategoriaPrenda(valor) {
  const palabras = String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .match(/[a-z0-9]+/g) ?? [];

  if (palabras.some((palabra) => ['remera', 'remeras', 'camiseta', 'camisetas'].includes(palabra))) {
    return 'remeras';
  }
  if (palabras.some((palabra) => ['pantalon', 'pantalones'].includes(palabra))) {
    return 'pantalones';
  }
  return null;
}

function perteneceACategoriaPrenda(prenda, categoria) {
  if (categoria === 'todos') return true;
  return normalizarCategoriaPrenda(prenda.grupo) === categoria
    || normalizarCategoriaPrenda(prenda.categoria) === categoria;
}

function dibujarPrendas() {
  // Las tarjetas se generan desde los datos para que agregar prendas sea sencillo.
  const prendasVisibles = prendas.filter((prenda) =>
    perteneceACategoriaPrenda(prenda, categoriaSeleccionada)
  );

  if (prendasVisibles.length === 0) {
    rejillaPrendas.innerHTML = '<p class="col-span-full py-10 text-center text-sm text-on-surface-variant">No hay prendas en esta categoría por ahora.</p>';
    return;
  }

  rejillaPrendas.innerHTML = prendasVisibles.map((prenda) => `
    <article class="group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-surface shadow-tarjeta transition hover:-translate-y-1 hover:shadow-suave" data-codigo-prenda="${escaparHTML(prenda.codigo)}" tabindex="0" role="button" aria-label="Ver ${escaparHTML(prenda.nombre)}">
      <div class="relative aspect-[3/4] overflow-hidden bg-surface-container">
        <img src="${escaparHTML(prenda.imagenes[0])}" alt="${escaparHTML(prenda.nombre)}" loading="lazy" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span class="absolute left-3 top-3 rounded-full ${prenda.etiqueta === 'Nuevo' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface/90 text-primary'} px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">${escaparHTML(prenda.etiqueta)}</span>
        <span class="absolute bottom-3 right-3 rounded-full bg-surface/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">${prenda.imagenes.length} fotos</span>
      </div>
      <div class="flex flex-1 flex-col justify-between p-3 sm:p-4 md:p-5">
        <div>
          <div class="mb-2 flex flex-wrap items-center justify-between gap-1 text-[8px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant sm:text-[10px] sm:tracking-[0.14em]">
            <span>${escaparHTML(prenda.categoria)}</span>
            <span class="text-secondary">Tallas ${escaparHTML(prenda.talles.join(', '))}</span>
          </div>
          <h3 class="mb-2 fuente-titular text-[1.05rem] leading-tight text-on-surface sm:text-[1.3rem] md:text-[1.45rem]">${escaparHTML(prenda.nombre)}</h3>
          <p class="mb-3 fuente-titular text-[1.2rem] leading-none text-primary sm:mb-4 sm:text-[1.5rem] md:text-[1.7rem]">${formatearPrecio(prenda.precio)}</p>
        </div>
        <span class="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-md bg-surface-container-high px-2 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-on-surface transition group-hover:bg-primary group-hover:text-on-primary sm:min-h-11 sm:gap-2 sm:px-4 sm:py-3 sm:text-[0.68rem] sm:tracking-[0.13em]">
          <span class="material-symbols-outlined text-[16px]">shopping_bag</span>
          Agregar
        </span>
      </div>
    </article>
  `).join('');
}

function abrirDetallePrenda(codigoPrenda) {
  // Abre la ficha con galería de fotos y opciones de compra de la prenda seleccionada.
  prendaSeleccionada = prendas.find((prenda) => prenda.codigo === codigoPrenda);
  if (!prendaSeleccionada) return;
  contenidoDialogoPrenda.innerHTML = `
    <div class="relative grid md:grid-cols-2">
      <button type="button" data-cerrar-prenda aria-label="Cerrar detalles" class="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 shadow hover:bg-white">
        <span class="material-symbols-outlined">close</span>
      </button>
      <div class="bg-surface-container p-3 sm:p-5">
        <img id="imagen-principal-prenda" src="${escaparHTML(prendaSeleccionada.imagenes[0])}" alt="${escaparHTML(prendaSeleccionada.nombre)}" class="aspect-[4/5] w-full rounded-xl object-cover" />
        <div class="mt-3 grid grid-cols-3 gap-2">
          ${prendaSeleccionada.imagenes.map((imagen, indice) => `
            <button type="button" data-imagen-galeria="${escaparHTML(imagen)}" aria-label="Ver foto ${indice + 1}" class="overflow-hidden rounded-lg border-2 ${indice === 0 ? 'border-primary' : 'border-transparent'} focus:border-primary">
              <img src="${escaparHTML(imagen)}" alt="" class="aspect-square w-full object-cover" />
            </button>
          `).join('')}
        </div>
      </div>
      <form id="formulario-prenda" class="flex flex-col p-5 sm:p-7 md:p-8">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">${escaparHTML(prendaSeleccionada.categoria)}</p>
        <h2 class="mt-2 fuente-titular text-3xl leading-tight sm:text-4xl">${escaparHTML(prendaSeleccionada.nombre)}</h2>
        <p class="mt-3 fuente-titular text-3xl text-primary">${formatearPrecio(prendaSeleccionada.precio)}</p>
        <p class="mt-2 text-sm leading-6 text-on-surface-variant">Selecciona el talle, color y cantidad que prefieras para agregarlo a tu bolsa.</p>
        <label for="talle-prenda" class="mb-2 mt-6 text-xs font-semibold uppercase tracking-[0.14em]">Talle</label>
        <select id="talle-prenda" name="talle" required class="min-h-12 rounded-lg border border-primary/20 bg-white px-3 text-sm focus:border-primary focus:outline-none">
          <option value="" disabled selected>Selecciona un talle</option>
          ${prendaSeleccionada.talles.map((talle) => `<option value="${escaparHTML(talle)}">${escaparHTML(talle)}</option>`).join('')}
        </select>
        <label for="color-prenda" class="mb-2 mt-5 text-xs font-semibold uppercase tracking-[0.14em]">Color</label>
        <select id="color-prenda" name="color" required class="min-h-12 rounded-lg border border-primary/20 bg-white px-3 text-sm focus:border-primary focus:outline-none">
          <option value="" disabled selected>Selecciona un color</option>
          ${prendaSeleccionada.colores.map((color) => `<option value="${escaparHTML(color)}">${escaparHTML(color)}</option>`).join('')}
        </select>
        <label for="cantidad-prenda" class="mb-2 mt-5 text-xs font-semibold uppercase tracking-[0.14em]">Cantidad</label>
        <input id="cantidad-prenda" name="cantidad" type="number" min="1" max="20" value="1" required class="min-h-12 w-28 rounded-lg border border-primary/20 bg-white px-3 text-sm focus:border-primary focus:outline-none" />
        <button type="submit" class="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary-container hover:text-on-primary-container">
          <span class="material-symbols-outlined">shopping_bag</span>
          Agregar
        </button>
      </form>
    </div>
  `;
  dialogoPrenda.showModal();
}

function dibujarBolsa() {
  // Actualiza el contador, los artículos y el total cada vez que cambia la bolsa.
  const cantidadEnBolsa = bolsa.reduce((totalPedido, articulo) => totalPedido + articulo.cantidad, 0);
  contadorBolsa.textContent = cantidadEnBolsa;
  contadorBolsa.classList.toggle('hidden', cantidadEnBolsa === 0);
  contadorBolsa.classList.toggle('flex', cantidadEnBolsa > 0);
  document.querySelector('#boton-abrir-bolsa').setAttribute('aria-label', `Abrir bolsa de compras, ${cantidadEnBolsa} ${cantidadEnBolsa === 1 ? 'producto' : 'productos'}`);

  if (bolsa.length === 0) {
    elementosBolsa.innerHTML = `
      <div class="flex h-full min-h-64 flex-col items-center justify-center text-center">
        <span class="material-symbols-outlined text-5xl text-primary/50">shopping_bag</span>
        <p class="mt-4 fuente-titular text-2xl">Tu bolsa está vacía</p>
        <p class="mt-2 max-w-xs text-sm leading-6 text-on-surface-variant">Explora la colección y agrega tus prendas favoritas.</p>
        <button type="button" data-cerrar-bolsa class="mt-5 rounded-full bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white">Ver colección</button>
      </div>
    `;
    pieBolsa.innerHTML = '';
    return;
  }

  elementosBolsa.innerHTML = bolsa.map((articulo, indice) => `
    <article class="flex gap-4 rounded-xl bg-white p-3 shadow-sm">
      <img src="${escaparHTML(articulo.imagen)}" alt="${escaparHTML(articulo.nombre)}" class="h-28 w-20 rounded-lg object-cover" />
      <div class="min-w-0 flex-1">
        <h3 class="fuente-titular text-xl leading-tight">${escaparHTML(articulo.nombre)}</h3>
        <p class="mt-1 text-xs text-on-surface-variant">Talle ${escaparHTML(articulo.talle)} · ${escaparHTML(articulo.color)}</p>
        <p class="mt-2 text-sm font-semibold text-primary">${formatearPrecio(articulo.precio)} · Cantidad: ${articulo.cantidad}</p>
        <button type="button" data-quitar="${indice}" class="mt-2 text-xs text-secondary underline underline-offset-2">Quitar de la bolsa</button>
      </div>
    </article>
  `).join('');

  const totalPedido = bolsa.reduce((subtotal, articulo) => subtotal + articulo.precio * articulo.cantidad, 0);
  pieBolsa.innerHTML = `
    <div class="mb-4 flex items-center justify-between">
      <span class="text-sm text-on-surface-variant">Total estimado</span>
      <strong class="fuente-titular text-2xl text-primary">${formatearPrecio(totalPedido)}</strong>
    </div>
    <p class="mb-4 text-xs leading-5 text-on-surface-variant">Al continuar, se abrirá WhatsApp con tu pedido redactado para que lo revises y lo envíes.</p>
    <button id="boton-enviar-whatsapp" type="button" class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-primary-container hover:text-on-primary-container">
      <span class="material-symbols-outlined">chat</span>
      Enviar pedido por WhatsApp
    </button>
    <div id="aviso-pedido-whatsapp" class="mt-4 hidden rounded-xl bg-surface-container-low p-4" aria-live="polite">
      <p id="estado-pedido-whatsapp" class="mb-3 text-sm leading-6 text-on-surface-variant"></p>
      <a id="link-whatsapp-pedido" href="https://wa.me/${numeroWhatsApp}" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-primary underline underline-offset-2">Abrir WhatsApp con el pedido</a>
    </div>
  `;
}

// Permite abrir las fichas tanto con clic como con Enter o la barra espaciadora.
rejillaPrendas.addEventListener('click', (evento) => {
  const activador = evento.target.closest('[data-codigo-prenda]');
  if (activador) abrirDetallePrenda(activador.dataset.codigoPrenda);
});
rejillaPrendas.addEventListener('keydown', (evento) => {
  if ((evento.key === 'Enter' || evento.key === ' ') && evento.target.matches('[data-codigo-prenda]')) {
    evento.preventDefault();
    abrirDetallePrenda(evento.target.dataset.codigoPrenda);
  }
});

// Cambia la foto principal al elegir una miniatura de la galería.
dialogoPrenda.addEventListener('click', (evento) => {
  if (evento.target.closest('[data-cerrar-prenda]')) dialogoPrenda.close();
  const botonGaleria = evento.target.closest('[data-imagen-galeria]');
  if (botonGaleria) {
    dialogoPrenda.querySelector('#imagen-principal-prenda').src = botonGaleria.dataset.imagenGaleria;
    dialogoPrenda.querySelectorAll('[data-imagen-galeria]').forEach((boton) => {
      boton.classList.toggle('border-primary', boton === botonGaleria);
      boton.classList.toggle('border-transparent', boton !== botonGaleria);
    });
  }
});

// Agrega una variante (prenda, talle y color) o suma unidades a la existente.
dialogoPrenda.addEventListener('submit', (evento) => {
  if (evento.target.id !== 'formulario-prenda') return;
  evento.preventDefault();
  const datosFormulario = new FormData(evento.target);
  const talle = datosFormulario.get('talle');
  const color = datosFormulario.get('color');
  const cantidad = Number(datosFormulario.get('cantidad'));
  if (!prendaSeleccionada || !talle || !color || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 20) return;

  const articuloExistente = bolsa.find((articulo) => articulo.codigo === prendaSeleccionada.codigo && articulo.talle === talle && articulo.color === color);
  if (articuloExistente) articuloExistente.cantidad += cantidad;
  else bolsa.push({
    codigo: prendaSeleccionada.codigo,
    nombre: prendaSeleccionada.nombre,
    precio: prendaSeleccionada.precio,
    imagen: dialogoPrenda.querySelector('#imagen-principal-prenda').src,
    talle,
    color,
    cantidad
  });
  dialogoPrenda.close();
  dibujarBolsa();
});

document.querySelector('#boton-abrir-bolsa').addEventListener('click', () => {
  dibujarBolsa();
  dialogoBolsa.showModal();
});
// Gestiona las cantidades, la eliminación y el envío del pedido a WhatsApp.
dialogoBolsa.addEventListener('click', (evento) => {
  if (evento.target.closest('[data-cerrar-bolsa]')) dialogoBolsa.close();

  const botonQuitar = evento.target.closest('[data-quitar]');
  if (botonQuitar) {
    bolsa.splice(Number(botonQuitar.dataset.quitar), 1);
    dibujarBolsa();
  }

  if (evento.target.closest('#boton-enviar-whatsapp')) {
    const detallePedido = bolsa.map((articulo) =>
      `🌷 ${articulo.nombre} (${articulo.talle}, ${articulo.color}) (x${articulo.cantidad}) - ${formatearPrecio(articulo.precio * articulo.cantidad)}`
    );
    const totalPedido = bolsa.reduce((subtotal, articulo) => subtotal + articulo.precio * articulo.cantidad, 0);
    const mensaje = `🌸 Hola Frané Boutique! 🌸\nQuiero hacer este pedido:\n\n${detallePedido.join('\n')}\n\n💐 Total: ${formatearPrecio(totalPedido)}\n\nGracias! 🌼`;
    const avisoPedido = document.querySelector('#aviso-pedido-whatsapp');
    const estadoPedido = document.querySelector('#estado-pedido-whatsapp');
    avisoPedido.classList.remove('hidden');
    const enlaceWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    document.querySelector('#link-whatsapp-pedido').href = enlaceWhatsApp;
    const ventanaWhatsApp = window.open(enlaceWhatsApp, '_blank');
    if (ventanaWhatsApp) ventanaWhatsApp.opener = null;
    estadoPedido.textContent = 'Abrimos WhatsApp con tu pedido redactado. Revísalo y pulsa enviar.';
  }
});

// En pantallas pequeñas el menú se despliega debajo del encabezado.
const botonMenuMovil = document.querySelector('#boton-menu-movil');
const navegacionMovil = document.querySelector('#navegacion-movil');
botonMenuMovil.addEventListener('click', () => {
  const menuExpandido = botonMenuMovil.getAttribute('aria-expanded') === 'true';
  botonMenuMovil.setAttribute('aria-expanded', String(!menuExpandido));
  botonMenuMovil.setAttribute('aria-label', menuExpandido ? 'Abrir menú' : 'Cerrar menú');
  botonMenuMovil.querySelector('span').textContent = menuExpandido ? 'menu' : 'close';
  navegacionMovil.classList.toggle('hidden', menuExpandido);
});
navegacionMovil.addEventListener('click', (evento) => {
  if (evento.target.closest('a')) {
    navegacionMovil.classList.add('hidden');
    botonMenuMovil.setAttribute('aria-expanded', 'false');
    botonMenuMovil.setAttribute('aria-label', 'Abrir menú');
    botonMenuMovil.querySelector('span').textContent = 'menu';
  }
});

// Los botones de categoría actualizan el catálogo sin recargar la página.
document.querySelector('#filtros-categoria').addEventListener('click', (evento) => {
  const botonFiltro = evento.target.closest('[data-filtro]');
  if (!botonFiltro) return;

  categoriaSeleccionada = botonFiltro.dataset.filtro;
  document.querySelectorAll('[data-filtro]').forEach((boton) => {
    const estaSeleccionado = boton === botonFiltro;
    boton.classList.toggle('seleccionado', estaSeleccionado);
    boton.setAttribute('aria-pressed', String(estaSeleccionado));
  });
  dibujarPrendas();
});

dibujarBolsa();
async function cargarProductos() {
  rejillaPrendas.innerHTML = '<p class="col-span-full py-10 text-center text-sm text-on-surface-variant">Cargando prendas...</p>';
  const productos = await obtenerProductos();
  if (productos === null) {
    rejillaPrendas.innerHTML = '<p class="col-span-full py-10 text-center text-sm text-on-surface-variant">No pudimos cargar el catálogo. Intenta recargar la página.</p>';
    return;
  }
  prendas = productos;
  dibujarPrendas();
}

cargarProductos();
