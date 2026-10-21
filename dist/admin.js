let productos = [];
let fotosActuales = [];
let fotosNuevas = [];

const MAX_FOTOS = 6;

const listaProductos = document.querySelector('#lista-productos');
const catalogoVacio = document.querySelector('#catalogo-vacio');
const totalProductos = document.querySelector('#total-productos');
const estadoCatalogo = document.querySelector('#estado-catalogo');
const panelFormulario = document.querySelector('#panel-formulario-producto');
const formularioProducto = document.querySelector('#formulario-producto');
const tituloFormulario = document.querySelector('#titulo-formulario-producto');
const errorFormulario = document.querySelector('#error-formulario-producto');
const inputFotos = document.querySelector('#fotos-producto');
const vistaFotos = document.querySelector('#vista-fotos');
const dialogoConfirmarEliminacion = document.querySelector('#dialogo-confirmar-eliminacion');
const nombreProductoEliminar = document.querySelector('#nombre-producto-eliminar');
const errorEliminacionProducto = document.querySelector('#error-eliminacion-producto');
const botonCancelarEliminacion = document.querySelector('#boton-cancelar-eliminacion');
const botonConfirmarEliminacion = document.querySelector('#boton-confirmar-eliminacion');
let productoPendienteEliminar = null;

const campos = {
  codigo: document.querySelector('#codigo-producto'),
  nombre: document.querySelector('#nombre-producto'),
  categoria: document.querySelector('#categoria-producto'),
  grupo: document.querySelector('#grupo-producto'),
  precio: document.querySelector('#precio-producto'),
  stock: document.querySelector('#stock-producto'),
  etiqueta: document.querySelector('#etiqueta-producto'),
  talles: document.querySelector('#talles-producto'),
  colores: document.querySelector('#colores-producto')
};

const formatearPrecio = (precio) => new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
}).format(precio);

function dibujarProductos() {
  totalProductos.textContent = String(productos.length);
  catalogoVacio.classList.toggle('hidden', productos.length > 0);

  listaProductos.innerHTML = productos.map((producto) => `
    <article class="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-tarjeta">
      <div class="flex gap-4 p-4">
        <img src="${escaparHTML(producto.imagenes[0])}" alt="${escaparHTML(producto.nombre)}" class="h-28 w-20 shrink-0 rounded-lg bg-surface-container object-cover" />
        <div class="min-w-0 flex-1">
          <p class="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-primary">${escaparHTML(producto.categoria)}</p>
          <h3 class="mt-1 break-words fuente-titular text-xl leading-tight">${escaparHTML(producto.nombre)}</h3>
          <p class="mt-2 text-sm font-semibold">${formatearPrecio(producto.precio)}</p>
          <p class="mt-1 text-xs text-on-surface-variant">${escaparHTML(producto.etiqueta)} · ${producto.imagenes.length} ${producto.imagenes.length === 1 ? 'foto' : 'fotos'}</p>
          <p class="mt-1 text-xs font-semibold ${(producto.stock ?? 1) === 0 ? 'text-error' : 'text-secondary'}">${(producto.stock ?? 1) === 0 ? 'Agotada' : `${producto.stock ?? 1} en stock`}</p>
        </div>
      </div>
      <div class="flex border-t border-primary/10">
        <button type="button" data-editar-producto="${escaparHTML(producto.codigo)}" class="flex flex-1 items-center justify-center gap-2 px-3 py-3 text-xs font-semibold text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary">
          <span class="material-symbols-outlined text-base">edit</span> Editar
        </button>
        <span class="my-2 w-px bg-primary/10"></span>
        <button type="button" data-eliminar-producto="${escaparHTML(producto.codigo)}" class="flex flex-1 items-center justify-center gap-2 px-3 py-3 text-xs font-semibold text-on-surface-variant transition hover:bg-red-50 hover:text-error">
          <span class="material-symbols-outlined text-base">delete</span> Eliminar
        </button>
      </div>
      <button type="button" data-cambiar-stock="${escaparHTML(producto.codigo)}" data-stock="${producto.stock ?? 1}" class="flex min-h-11 w-full items-center justify-center gap-2 border-t border-primary/10 px-3 py-3 text-xs font-semibold ${(producto.stock ?? 1) === 0 ? 'text-secondary hover:bg-surface-container-low' : 'text-error hover:bg-red-50'}">
        <span class="material-symbols-outlined text-base">${(producto.stock ?? 1) === 0 ? 'inventory' : 'inventory_2'}</span>
        ${(producto.stock ?? 1) === 0 ? 'Volver a publicar con 1 unidad' : 'Marcar agotada'}
      </button>
    </article>
  `).join('');
}

function mostrarEstado(mensaje, esError = false) {
  estadoCatalogo.textContent = mensaje;
  estadoCatalogo.classList.toggle('text-error', esError);
  estadoCatalogo.classList.toggle('text-secondary', !esError);
}

// ---------- Fotos ----------

function dibujarFotos() {
  const actuales = fotosActuales.map((src, indice) => ({ src, tipo: 'actual', indice }));
  const nuevas = fotosNuevas.map((archivo, indice) => ({ src: URL.createObjectURL(archivo), tipo: 'nueva', indice }));

  vistaFotos.innerHTML = [...actuales, ...nuevas].map((foto, posicion) => `
    <div class="relative">
      <img src="${escaparHTML(foto.src)}" alt="Foto ${posicion + 1}" class="h-24 w-20 rounded-lg object-cover" />
      ${posicion === 0 ? '<span class="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-primary">Principal</span>' : ''}
      <button type="button" data-quitar-foto="${foto.tipo}" data-indice="${foto.indice}" aria-label="Quitar foto ${posicion + 1}" class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow">
        <span class="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  `).join('');
}

// Reduce la foto a un máximo de 1200 px y la convierte a JPG liviano.
function comprimirImagen(archivo, maxLado = 1200, calidad = 0.82) {
  return new Promise((resolve, reject) => {
    const imagen = new Image();
    const url = URL.createObjectURL(archivo);
    imagen.onload = () => {
      const escala = Math.min(1, maxLado / Math.max(imagen.width, imagen.height));
      const lienzo = document.createElement('canvas');
      lienzo.width = Math.round(imagen.width * escala);
      lienzo.height = Math.round(imagen.height * escala);
      lienzo.getContext('2d').drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
      URL.revokeObjectURL(url);
      lienzo.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la foto.'))),
        'image/jpeg',
        calidad
      );
    };
    imagen.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer una de las fotos.'));
    };
    imagen.src = url;
  });
}

inputFotos.addEventListener('change', () => {
  const elegidas = Array.from(inputFotos.files);
  inputFotos.value = '';
  const espacio = MAX_FOTOS - fotosActuales.length - fotosNuevas.length;
  fotosNuevas.push(...elegidas.slice(0, Math.max(0, espacio)));
  if (elegidas.length > espacio) {
    mostrarEstado(`Solo se pueden agregar hasta ${MAX_FOTOS} fotos por prenda.`, true);
  }
  dibujarFotos();
});

vistaFotos.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-quitar-foto]');
  if (!boton) return;
  const indice = Number(boton.dataset.indice);
  if (boton.dataset.quitarFoto === 'actual') fotosActuales.splice(indice, 1);
  else fotosNuevas.splice(indice, 1);
  dibujarFotos();
});

// ---------- Formulario ----------

function limpiarFormulario() {
  formularioProducto.reset();
  campos.codigo.value = '';
  establecerOpciones(campos.talles, []);
  establecerOpciones(campos.colores, []);
  fotosActuales = [];
  fotosNuevas = [];
  dibujarFotos();
  tituloFormulario.textContent = 'Agregar prenda';
  errorFormulario.textContent = '';
  errorFormulario.classList.add('hidden');
}

function abrirFormulario(producto = null) {
  limpiarFormulario();
  if (producto) {
    campos.codigo.value = producto.codigo;
    campos.nombre.value = producto.nombre;
    campos.categoria.value = producto.categoria;
    campos.grupo.value = producto.grupo;
    campos.precio.value = String(producto.precio);
    campos.stock.value = String(producto.stock ?? 1);
    campos.etiqueta.value = producto.etiqueta;
    establecerOpciones(campos.talles, producto.talles);
    establecerOpciones(campos.colores, producto.colores);
    fotosActuales = [...producto.imagenes];
    dibujarFotos();
    tituloFormulario.textContent = 'Editar prenda';
  }

  panelFormulario.classList.remove('hidden');
  panelFormulario.scrollIntoView({ behavior: 'smooth', block: 'center' });
  campos.nombre.focus({ preventScroll: true });
}

function agregarCampoOpcion(contenedor, valor = '') {
  const tipo = contenedor.dataset.tipoOpcion;
  const fila = document.createElement('div');
  fila.className = 'flex min-w-0 items-center gap-2';

  const input = document.createElement('input');
  input.type = 'text';
  input.required = true;
  input.dataset.opcionInput = '';
  input.placeholder = tipo === 'talle' ? 'Ej.: S' : 'Ej.: Negro';
  input.value = valor;
  input.setAttribute('aria-label', tipo === 'talle' ? 'Talle disponible' : 'Color disponible');
  input.className = 'min-w-0 flex-1';

  const quitar = document.createElement('button');
  quitar.type = 'button';
  quitar.dataset.quitarOpcion = '';
  quitar.className = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-secondary transition hover:bg-red-50 hover:text-error disabled:cursor-not-allowed disabled:opacity-40';
  quitar.setAttribute('aria-label', tipo === 'talle' ? 'Quitar talle' : 'Quitar color');
  quitar.innerHTML = '<span class="material-symbols-outlined">close</span>';

  fila.append(input, quitar);
  contenedor.append(fila);
  actualizarBotonesQuitar(contenedor);
  return input;
}

function actualizarBotonesQuitar(contenedor) {
  const botones = contenedor.querySelectorAll('[data-quitar-opcion]');
  botones.forEach((boton) => {
    boton.disabled = botones.length === 1;
  });
}

function establecerOpciones(contenedor, opciones) {
  contenedor.replaceChildren();
  const valores = opciones.length > 0 ? opciones : [''];
  valores.forEach((valor) => agregarCampoOpcion(contenedor, valor));
}

function leerOpciones(contenedor) {
  return [...contenedor.querySelectorAll('[data-opcion-input]')]
    .flatMap((input) => input.value.split(','))
    .map((elemento) => elemento.trim())
    .filter(Boolean);
}

function crearCodigo(nombre) {
  const base = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'prenda';
  let codigo = base;
  let sufijo = 2;
  while (productos.some((producto) => producto.codigo === codigo)) {
    codigo = `${base}-${sufijo}`;
    sufijo += 1;
  }
  return codigo;
}

function mostrarErrorFormulario(mensaje) {
  errorFormulario.textContent = mensaje;
  errorFormulario.classList.remove('hidden');
}

formularioProducto.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  errorFormulario.textContent = '';
  errorFormulario.classList.add('hidden');

  const precio = Number(campos.precio.value);
  const stock = Number(campos.stock.value);
  const talles = leerOpciones(campos.talles);
  const colores = leerOpciones(campos.colores);
  const errores = [];

  if (!Number.isSafeInteger(precio) || precio < 1) errores.push('Ingresa un precio entero mayor que cero.');
  if (!Number.isSafeInteger(stock) || stock < 0) errores.push('Ingresa una cantidad de stock entera igual o mayor que cero.');
  if (talles.length === 0) errores.push('Ingresa al menos un talle.');
  if (colores.length === 0) errores.push('Ingresa al menos un color.');
  if (fotosActuales.length + fotosNuevas.length === 0) errores.push('Agrega al menos una foto.');

  if (errores.length > 0) {
    mostrarErrorFormulario(errores.join(' '));
    return;
  }

  const botonGuardar = formularioProducto.querySelector('button[type="submit"]');
  const textoOriginal = botonGuardar.textContent;
  botonGuardar.disabled = true;
  botonGuardar.textContent = 'Guardando...';

  try {
    // Sube las fotos nuevas y junta sus enlaces con los de las fotos que ya tenía.
    const urlsNuevas = [];
    for (const archivo of fotosNuevas) {
      const liviana = await comprimirImagen(archivo);
      const url = await subirFoto(liviana);
      if (!url) throw new Error('No se pudo subir una de las fotos. Inténtalo otra vez.');
      urlsNuevas.push(url);
    }

    const codigoExistente = campos.codigo.value;
    const producto = {
      codigo: codigoExistente || crearCodigo(campos.nombre.value),
      nombre: campos.nombre.value.trim(),
      categoria: campos.categoria.value.trim(),
      grupo: campos.grupo.value,
      precio,
      stock,
      etiqueta: campos.etiqueta.value.trim(),
      talles,
      colores,
      imagenes: [...fotosActuales, ...urlsNuevas]
    };

    if (!(await guardarProducto(producto))) {
      throw new Error('No se pudo guardar. Revisa tu conexión e inténtalo otra vez.');
    }

    productos = (await obtenerProductos()) ?? productos;
    dibujarProductos();
    limpiarFormulario();
    panelFormulario.classList.add('hidden');
    mostrarEstado(codigoExistente ? 'Prenda actualizada.' : 'Prenda agregada.');
  } catch (error) {
    console.error(error);
    mostrarErrorFormulario(error.message);
  } finally {
    botonGuardar.disabled = false;
    botonGuardar.textContent = textoOriginal;
  }
});

formularioProducto.addEventListener('click', (evento) => {
  const agregar = evento.target.closest('[data-agregar-opcion]');
  if (agregar) {
    const contenedor = agregar.dataset.agregarOpcion === 'talle' ? campos.talles : campos.colores;
    agregarCampoOpcion(contenedor).focus();
    return;
  }

  const quitar = evento.target.closest('[data-quitar-opcion]');
  if (!quitar) return;
  const contenedor = quitar.closest('[data-tipo-opcion]');
  if (contenedor.querySelectorAll('[data-opcion-input]').length === 1) return;
  quitar.parentElement.remove();
  actualizarBotonesQuitar(contenedor);
});

document.querySelector('#boton-nuevo-producto').addEventListener('click', () => {
  abrirFormulario();
});

document.querySelector('#boton-cancelar-producto').addEventListener('click', () => {
  limpiarFormulario();
  panelFormulario.classList.add('hidden');
});

function abrirConfirmacionEliminacion(producto) {
  productoPendienteEliminar = producto;
  nombreProductoEliminar.textContent = producto.nombre;
  errorEliminacionProducto.textContent = '';
  errorEliminacionProducto.classList.add('hidden');
  botonConfirmarEliminacion.disabled = false;
  botonConfirmarEliminacion.innerHTML = '<span class="material-symbols-outlined text-base">delete</span> Eliminar';
  dialogoConfirmarEliminacion.showModal();
}

botonCancelarEliminacion.addEventListener('click', () => {
  dialogoConfirmarEliminacion.close();
  productoPendienteEliminar = null;
});

dialogoConfirmarEliminacion.addEventListener('click', (evento) => {
  if (evento.target === dialogoConfirmarEliminacion) {
    dialogoConfirmarEliminacion.close();
    productoPendienteEliminar = null;
  }
});

botonConfirmarEliminacion.addEventListener('click', async () => {
  const producto = productoPendienteEliminar;
  if (!producto) return;

  botonConfirmarEliminacion.disabled = true;
  botonConfirmarEliminacion.innerHTML = '<span class="material-symbols-outlined text-base">hourglass_top</span> Eliminando...';
  errorEliminacionProducto.textContent = '';
  errorEliminacionProducto.classList.add('hidden');

  if (!(await eliminarProducto(producto.codigo))) {
    errorEliminacionProducto.textContent = 'No se pudo eliminar. Inténtalo otra vez.';
    errorEliminacionProducto.classList.remove('hidden');
    botonConfirmarEliminacion.disabled = false;
    botonConfirmarEliminacion.innerHTML = '<span class="material-symbols-outlined text-base">delete</span> Eliminar';
    return;
  }

  productos = (await obtenerProductos()) ?? productos;
  dibujarProductos();
  dialogoConfirmarEliminacion.close();
  productoPendienteEliminar = null;
  mostrarEstado('Prenda eliminada del catálogo.');
  botonConfirmarEliminacion.disabled = false;
  botonConfirmarEliminacion.innerHTML = '<span class="material-symbols-outlined text-base">delete</span> Eliminar';
});

listaProductos.addEventListener('click', async (evento) => {
  const botonStock = evento.target.closest('[data-cambiar-stock]');
  if (botonStock) {
    const codigo = botonStock.dataset.cambiarStock;
    const stockActual = Number(botonStock.dataset.stock);
    const nuevoStock = stockActual > 0 ? 0 : 1;
    botonStock.disabled = true;
    if (!(await actualizarStockProducto(codigo, nuevoStock))) {
      botonStock.disabled = false;
      mostrarEstado('No se pudo actualizar la disponibilidad. Verifica la migración de la base de datos e inténtalo otra vez.', true);
      return;
    }
    productos = productos.map((producto) =>
      producto.codigo === codigo ? { ...producto, stock: nuevoStock } : producto
    );
    dibujarProductos();
    mostrarEstado(nuevoStock === 0 ? 'Prenda marcada como agotada.' : 'Prenda disponible nuevamente con 1 unidad.');
    return;
  }

  const botonEditar = evento.target.closest('[data-editar-producto]');
  if (botonEditar) {
    const producto = productos.find((actual) => actual.codigo === botonEditar.dataset.editarProducto);
    if (producto) abrirFormulario(producto);
    return;
  }

  const botonEliminar = evento.target.closest('[data-eliminar-producto]');
  if (!botonEliminar) return;
  const producto = productos.find((actual) => actual.codigo === botonEliminar.dataset.eliminarProducto);
  if (!producto) return;
  abrirConfirmacionEliminacion(producto);
});

async function iniciar() {
  const { data } = await db.auth.getSession();
  if (!data.session) {
    window.location.href = 'login.html';
    return;
  }
  productos = (await obtenerProductos()) ?? [];
  dibujarProductos();
}
iniciar();

document.querySelector('#boton-cerrar-sesion').addEventListener('click', async (evento) => {
  evento.preventDefault();
  await db.auth.signOut();
  window.location.href = 'login.html';
});
