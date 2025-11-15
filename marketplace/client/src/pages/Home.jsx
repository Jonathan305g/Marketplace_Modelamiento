import React, { useState, useEffect } from 'react';
import FilterBar from '../components/FilterBar'; 
import ProductGrid from '../components/ProductGrid';
import ProductPublish from '../components/ProductPublish'; 
import ProductDetailModal from '../components/ProductDetailModal';

function Home() {
    // ESTADOS
    const [showPublishForm, setShowPublishForm] = useState(false);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // ID del usuario actual para la lógica de "dueño del producto" en el modal
    const currentUserId = localStorage.getItem('userId');
    
    // FUNCIONES ASÍNCRONAS Y CALLBACKS

    const fetchProducts = async () => {
        console.log('Recargando productos...');
        try {
            const response = await fetch('http://localhost:4000/api/products'); 
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error("Error al cargar los productos:", error);
        }
    };
    
    const handleDeleteProduct = async (productId) => {
        const token = localStorage.getItem('token');
        if (!token) return alert('No autorizado. Por favor, inicia sesión.');

        if (!window.confirm("¿Estás seguro de que quieres eliminar este producto?")) return;

        try {
            const response = await fetch(`http://localhost:4000/api/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                alert('Producto eliminado con éxito.');
                // Cierra el modal y recarga la lista
                setSelectedProduct(null); 
                fetchProducts(); 
            } else {
                const errorData = await response.json();
                alert(`Error al eliminar: ${errorData.message}`);
            }
        } catch (error) {
            alert('Error de conexión o fallo al eliminar.');
        }
    };
    
    // FUNCIONES DE VISTA/EVENTOS

    const handleCreatePublicationClick = () => {
        setShowPublishForm(true);
    };

    const handleClosePublishForm = () => {
        setShowPublishForm(false);
    };
    
    const handleProductCreation = () => {
        fetchProducts(); 
        setShowPublishForm(false); 
    };

    // Función para abrir el modal al hacer clic en la tarjeta (la pasa a ProductGrid)
    const handleCardClick = (product) => {
        setSelectedProduct(product);
    };

    // Función para cerrar el modal
    const handleCloseModal = () => {
        setSelectedProduct(null);
    };

    // EFECTO DE CARGA INICIAL
    useEffect(() => {
        fetchProducts();
    }, []);

    
    return (
        <div className="home-container">
            {/* Contenedor del botón de publicación */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px 0' }}>
                {!showPublishForm && (
                    <button 
                        onClick={handleCreatePublicationClick} 
                        className="btn-create-publication" 
                        style={{ /* ... estilos ... */ }}
                    >
                        Crear Publicación 
                    </button>
                )}
            </div>

            {/* Renderizado condicional del formulario o de la interfaz de lista */}
            {showPublishForm ? (
                <div className="publish-overlay">
                    <ProductPublish 
                        onClose={handleClosePublishForm} 
                        onProductCreated={handleProductCreation}
                    />
                </div>
            ) : (
                <>
                    <FilterBar /> 
                    {/* PASAMOS LA FUNCIÓN DE CLIC A LA CUADRÍCULA */}
                    <ProductGrid 
                        products={products} 
                        onProductSelect={handleCardClick} // <--- CORRECCIÓN DE LLAMADA
                    /> 
                </>
            )}
            
            {/* Renderizado del Modal de Detalles */}
            {selectedProduct && (
                <ProductDetailModal 
                    product={selectedProduct} 
                    onClose={handleCloseModal} 
                    onDelete={handleDeleteProduct} // Función para llamar al backend DELETE
                    currentUserId={currentUserId} // ID del usuario logueado para verificación
                />
            )}
        </div>
    );
}

export default Home;