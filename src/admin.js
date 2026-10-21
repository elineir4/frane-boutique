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

const campos = {
  codigo: document.querySelector('#codigo-producto'),
  nombre: document.querySelector('#nombre-producto'),
  categoria: document.querySelector('#categoria-producto'),
  grupo: document.querySelector('#grupo-producto'),
  precio: document.querySelector('#precio-producto'),
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
    campos.etiqueta.value = producto.etiqueta;
    campos.talles.value = producto.talles.join(', ');
    campos.colores.value = producto.colores.join(', ');
    fotosActuales = [...producto.imagenes];
    dibujarFotos();
    tituloFormulario.textContent = 'Editar prenda';
  }

  panelFormulario.classList.remove('hidden');
  panelFormulario.scrollIntoView({ behavior: 'smooth', block: 'center' });
  campos.nombre.focus({ preventScroll: true });
}

function leerLista(valor) {
  return valor.split(',').map((elemento) => elemento.trim()).filter(Boolean);
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
  const talles = leerLista(campos.talles.value);
  const colores = leerLista(campos.colores.value);
  const errores = [];

  if (!Number.isSafeInteger(precio) || precio < 1) errores.push('Ingresa un precio entero mayor que cero.');
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

document.querySelector('#boton-nuevo-producto').addEventListener('click', () => {
  abrirFormulario();
});

document.querySelector('#boton-cancelar-producto').addEventListener('click', () => {
  limpiarFormulario();
  panelFormulario.classList.add('hidden');
});

listaProductos.addEventListener('click', async (evento) => {
  const botonEditar = evento.target.closest('[data-editar-producto]');
  if (botonEditar) {
    const producto = productos.find((actual) => actual.codigo === botonEditar.dataset.editarProducto);
    if (producto) abrirFormulario(producto);
    return;
  }

  const botonEliminar = evento.target.closest('[data-eliminar-producto]');
  if (!botonEliminar) return;
  const producto = productos.find((actual) => actual.codigo === botonEliminar.dataset.eliminarProducto);
  if (!producto || !window.confirm(`¿Eliminar "${producto.nombre}" del catálogo?`)) return;

  if (!(await eliminarProducto(producto.codigo))) {
    mostrarEstado('No se pudo eliminar. Inténtalo otra vez.', true);
    return;
  }
  productos = (await obtenerProductos()) ?? productos;

  dibujarProductos();
  mostrarEstado('Prenda eliminada del catálogo.');
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