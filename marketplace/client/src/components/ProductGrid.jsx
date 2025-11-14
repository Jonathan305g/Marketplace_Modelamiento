import React, { useState } from 'react'; // Importamos useState
import ProductCard from './ProductCard'; 
import ProductDetailModal from './ProductDetailModal'; // Componente que crearemos

// Asegúrate de que el componente acepte products como prop
function ProductGrid({ products }) { 
    // NUEVO ESTADO: Almacena el producto seleccionado (o null si el modal está cerrado)
    const [selectedProduct, setSelectedProduct] = useState(null);

    // NUEVA FUNCIÓN: Abre el modal con la información del producto
    const handleCardClick = (product) => {
        setSelectedProduct(product);
    };

    // NUEVA FUNCIÓN: Cierra el modal
    const handleCloseModal = () => {
        setSelectedProduct(null);
    };

    return (
        <>
            <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', padding: '20px' }}>
                {products.length === 0 ? (
                    <p>No se encontraron productos. ¡Sé el primero en publicar!</p>
                ) : (
                    products.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            // Le pasamos la función para que la tarjeta sea clickeable
                            onClick={() => handleCardClick(product)} 
                        />
                    ))
                )}
            </div>

            {/* Renderizado condicional del Modal de Detalles */}
            {selectedProduct && (
                <ProductDetailModal 
                    product={selectedProduct} 
                    onClose={handleCloseModal} 
                />
            )}
        </>
    );
}

export default ProductGrid;