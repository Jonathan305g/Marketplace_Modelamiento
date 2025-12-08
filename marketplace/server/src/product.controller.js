import { supabase } from './db.js';

const BANNED_KEYWORDS = [
  'arma', 'droga', 'explosivo', 'pornografía'
];
function contieneProhibido(texto = '') {
  const lower = texto.toLowerCase();
  return BANNED_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}
// --- C R E A T E (Crear Producto) ---
export const createProduct = async (req, res) => {
  const { name, description, price, category, location, imageUrls, type, state } = req.body;
  const userId = req.userId;

  if (!userId || !name || !price) {
    return res
      .status(400)
      .json({ message: 'Faltan campos obligatorios (Usuario, Nombre, Precio).' });
  }
  if (contieneProhibido(name) || contieneProhibido(description)) {
    return res.status(400).json({
        message: 'El producto contiene palabras o servicios prohibidos.',
        });
    }

  try {
    // 1. Validar URLs ANTES de insertar nada
    let validUrls = [];
    if (imageUrls && Array.isArray(imageUrls)) {
      const trimmed = imageUrls.map((u) => (u || '').trim());
      validUrls = trimmed.filter((url) => url !== '');

      const invalidUrls = validUrls.filter((url) => !/^https?:\/\//i.test(url));
      if (invalidUrls.length > 0) {
        return res.status(400).json({
          message: 'Algunas URLs no son válidas. Deben comenzar con http:// o https://',
          invalidUrls,
        });
      }
    }

    // 2. Insertar producto
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        user_id: userId,
        name,
        description,
        price,
        category,
        location,
        type,
        state,
      })
      .select()
      .single();

    if (productError) {
      console.error('❌ Error al insertar producto:', productError);
      return res.status(500).json({
        message: 'Error al crear el producto.',
        error: productError.message,
      });
    }

    const productId = product.id;

    // 3. Insertar imágenes si hay
    if (validUrls.length > 0) {
      const rowsToInsert = validUrls.map((url) => ({
        product_id: productId,
        image_url: url,
      }));

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(rowsToInsert)
        .select();

      if (imagesError) {
        console.error('❌ Error al insertar imágenes:', imagesError);
        // Ojo: aquí el producto ya está creado. Para 100% atomicidad habría que usar RPC.
      }
    }

    // 4. Recuperar producto con imágenes
    const { data: productWithImages, error: getError } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        description,
        price,
        category,
        location,
        type,
        created_at,
        user_id,
        product_images (
          image_url
        )
      `
      )
      .eq('id', productId)
      .single();

    if (getError) {
      console.error('❌ Error al obtener producto recién creado:', getError);
      return res.status(500).json({
        message: 'Producto creado, pero error al obtenerlo con imágenes.',
        error: getError.message,
      });
    }

    const images = (productWithImages.product_images || []).map((img) => img.image_url);

    const result = {
      id: productWithImages.id,
      name: productWithImages.name,
      description: productWithImages.description,
      price: productWithImages.price,
      category: productWithImages.category,
      location: productWithImages.location,
      type: productWithImages.type,
      created_at: productWithImages.created_at,
      user_id: productWithImages.user_id,
      images,
    };

    res.status(201).json({ message: 'Producto publicado con éxito', product: result });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({
      message: 'Error interno del servidor al crear el producto.',
      error: error.message,
    });
  }
};

// --- R E A D (Obtener productos con filtros) ---
export const getProducts = async (req, res) => {
  const { category, location, min_price, max_price, search } = req.query;

  try {
    let query = supabase
      .from('products')
      .select(
        `
        id,
        name,
        description,
        price,
        category,
        location,
        created_at,
        user_id,
        state,
        product_images (
          image_url
        )
      `
      )
      .eq('state', 'visible')
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (location) query = query.ilike('location', `%${location}%`);
    if (min_price) query = query.gte('price', min_price);
    if (max_price) query = query.lte('price', max_price);

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error Supabase al obtener productos:', error);
      return res.status(500).json({
        message: 'Error al obtener productos.',
        error: error.message,
      });
    }

    const products = (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      location: p.location,
      created_at: p.created_at,
      user_id: p.user_id,
      images: (p.product_images || []).map((img) => img.image_url),
    }));

    return res.status(200).json(products);
  } catch (err) {
    console.error('❌ Error al obtener productos con filtros:', err);
    return res.status(500).json({ message: 'Error al obtener productos.' });
  }
};

// --- R E A D (Obtener UN Producto por ID - Público) ---
export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: product, error } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        description,
        price,
        category,
        location,
        type,
        created_at,
        state,
        user_id,
        seller:users (
          name
        ),
        product_images (
          image_url
        )
      `
      )
      .eq('id', id)
      .eq('state', 'visible')
      .maybeSingle();

    if (error) {
      console.error('❌ Error Supabase al obtener producto por ID:', error);
      return res.status(500).json({
        message: 'Error al obtener el producto.',
        error: error.message,
      });
    }

    if (!product) {
      return res
        .status(404)
        .json({ message: 'Producto no encontrado o no está visible.' });
    }

    const response = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      location: product.location,
      type: product.type,
      created_at: product.created_at,
      user_id: product.user_id,
      seller_name: product.seller?.name || null,
      images: (product.product_images || []).map((img) => img.image_url),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    res.status(500).json({ message: 'Error al obtener el producto.' });
  }
};

// --- U P D A T E (Actualizar Producto - Vendedor) ---
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const {
    name,
    description,
    price,
    category,
    location,
    availability,
    type,
    state,
    imageUrls,
  } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Nombre y Precio son obligatorios.' });
  }

  try {
    // 1. Actualizar producto (solo si pertenece al usuario)
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        name,
        description,
        price,
        category,
        location,
        availability,
        type,
        state: state || 'visible',
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('❌ Error al actualizar producto:', updateError);
      return res.status(500).json({
        message: 'Error al actualizar el producto.',
        error: updateError.message,
      });
    }

    if (!updatedProduct) {
      return res.status(404).json({
        message: 'Producto no encontrado o no autorizado para editar.',
      });
    }

    // 2. Manejo de imágenes (si vienen en el body)
    if (imageUrls && Array.isArray(imageUrls)) {
      const validUrls = imageUrls
        .map((u) => (u || '').trim())
        .filter((url) => url !== '');

      // Borrar imágenes existentes
      const { error: deleteError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', id);

      if (deleteError) {
        console.error('❌ Error al borrar imágenes existentes:', deleteError);
      }

      if (validUrls.length > 0) {
        const rowsToInsert = validUrls.map((url) => ({
          product_id: id,
          image_url: url,
        }));

        const { error: insertImagesError } = await supabase
          .from('product_images')
          .insert(rowsToInsert)
          .select();

        if (insertImagesError) {
          console.error('❌ Error al insertar nuevas imágenes:', insertImagesError);
        }
      }
    }

    // 3. Recuperar producto actualizado con imágenes
    const { data: productWithImages, error: getError } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        description,
        price,
        category,
        location,
        type,
        created_at,
        user_id,
        product_images (
          image_url
        )
      `
      )
      .eq('id', id)
      .single();

    if (getError) {
      console.error('❌ Error al obtener producto actualizado:', getError);
      return res.status(500).json({
        message: 'Producto actualizado, pero error al obtenerlo con imágenes.',
        error: getError.message,
      });
    }

    const images = (productWithImages.product_images || []).map((img) => img.image_url);

    const result = {
      id: productWithImages.id,
      name: productWithImages.name,
      description: productWithImages.description,
      price: productWithImages.price,
      category: productWithImages.category,
      location: productWithImages.location,
      type: productWithImages.type,
      created_at: productWithImages.created_at,
      user_id: productWithImages.user_id,
      images,
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({
      message: 'Error interno del servidor al actualizar el producto.',
      error: error.message,
    });
  }
};

// --- D E L E T E (Eliminar Producto) ---
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!id) {
    return res.status(400).json({ message: 'Se requiere el ID del producto.' });
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select('id');

    if (error) {
      console.error('❌ Error al eliminar producto:', error);
      return res.status(500).json({
        message: 'Error interno del servidor al eliminar el producto.',
        error: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: 'Producto no encontrado o no autorizado para eliminar.',
      });
    }

    res.status(200).json({ message: `Producto con ID ${id} eliminado con éxito.` });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({
      message: 'Error interno del servidor al eliminar el producto.',
      error: error.message,
    });
  }
};

// --- T O G G L E  F A V O R I T O ---
export const toggleFavorite = async (req, res) => {
  const { id } = req.params; // product_id
  const userId = req.userId;

  try {
    // 1. Ver si ya existe el favorito
    const { data: existing, error: existingError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', id)
      .maybeSingle();

    if (existingError) {
      console.error('❌ Error consultando favorito:', existingError);
      return res.status(500).json({ message: 'Error interno del servidor.' });
    }

    if (existing) {
      // 2. Si existe, eliminarlo
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        console.error('❌ Error al eliminar favorito:', deleteError);
        return res.status(500).json({ message: 'Error interno del servidor.' });
      }

      return res.status(200).json({ message: 'Producto eliminado de favoritos.' });
    } else {
      // 3. Si no existe, crearlo
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          product_id: id,
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error al añadir favorito:', insertError);
        if (insertError.code === '23503') {
          // FK violation
          return res.status(404).json({ message: 'El producto no existe.' });
        }
        return res.status(500).json({ message: 'Error interno del servidor.' });
      }

      return res.status(201).json({ message: 'Producto añadido a favoritos.' });
    }
  } catch (error) {
    console.error('Error en toggleFavorite:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// --- Obtener Productos Favoritos ---
export const getFavoriteProducts = async (req, res) => {
  const userId = req.userId;

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(
        `
        created_at,
        products (
          id,
          name,
          description,
          price,
          category,
          location,
          created_at,
          user_id,
          state,
          product_images (
            image_url
          )
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener favoritos:', error);
      return res
        .status(500)
        .json({ message: 'Error al obtener favoritos.', error: error.message });
    }

    const favorites = (data || [])
      .filter((row) => row.products && row.products.state === 'visible')
      .map((row) => {
        const p = row.products;
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category,
          location: p.location,
          created_at: p.created_at,
          user_id: p.user_id,
          favorited_at: row.created_at,
          images: (p.product_images || []).map((img) => img.image_url),
        };
      });

    res.status(200).json(favorites);
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({ message: 'Error al obtener favoritos.' });
  }
};
