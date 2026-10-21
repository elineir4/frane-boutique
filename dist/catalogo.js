// Conexión con la base de datos (la variable `db` viene de supabase.js).

async function obtenerProductos() {
  const { data, error } = await db
    .from('productos')
    .select('*')
    .order('creado_en', { ascending: true });

  if (error) {
    console.error('No se pudieron leer los productos.', error);
    return null;
  }
  return data;
}

async function guardarProducto(producto) {
  const { error } = await db.from('productos').upsert(producto);

  if (error) {
    console.error('No se pudo guardar el producto.', error);
    return false;
  }
  return true;
}

async function eliminarProducto(codigo) {
  const { error } = await db.from('productos').delete().eq('codigo', codigo);

  if (error) {
    console.error('No se pudo eliminar el producto.', error);
    return false;
  }
  return true;
}

async function actualizarStockProducto(codigo, stock) {
  const { data, error } = await db
    .from('productos')
    .update({ stock })
    .eq('codigo', codigo)
    .select('codigo')
    .maybeSingle();

  if (error) {
    console.error('No se pudo actualizar el stock del producto.', error);
    return false;
  }
  if (!data) {
    console.error('No se encontró el producto para actualizar su stock.', codigo);
    return false;
  }
  return true;
}

// Utilidades compartidas por la tienda y el panel.

function escaparHTML(valor) {
  return String(valor).replace(/[&<>"']/g, (caracter) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[caracter]);
}

async function subirFoto(blob) {
  const ruta = `${crypto.randomUUID()}.jpg`;
  const { error } = await db.storage
    .from('fotos')
    .upload(ruta, blob, { contentType: 'image/jpeg' });

  if (error) {
    console.error('No se pudo subir la foto.', error);
    return null;
  }
  return db.storage.from('fotos').getPublicUrl(ruta).data.publicUrl;
}