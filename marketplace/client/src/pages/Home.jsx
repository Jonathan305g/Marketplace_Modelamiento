import React, { useState, useEffect } from 'react';
import FilterBar from '../components/FilterBar'; 
import ProductGrid from '../components/ProductGrid';
import ProductPublish from '../components/ProductPublish'; // Componente de formulario de publicación

function Home() {
    // Estado para controlar la visibilidad del formulario de publicación
    const [showPublishForm, setShowPublishForm] = useState(false);
    
    // NUEVO ESTADO: Almacena la lista de productos
    const [products, setProducts] = useState([]);

    // NUEVA FUNCIÓN: Lógica para obtener productos del backend
    const fetchProducts = async () => {
        console.log('Recargando productos...');
        try {
            // Asegúrate que la URL es correcta para tu endpoint GET /api/products
            const response = await fetch('http://localhost:4000/api/products'); 
            const data = await response.json();
            setProducts(data); // Actualiza el estado con los productos
        } catch (error) {
            console.error("Error al cargar los productos:", error);
        }
    };

    // Función para abrir el formulario
    const handleCreatePublicationClick = () => {
        setShowPublishForm(true);
    };

    // Función para cerrar el formulario (se pasa a ProductPublish)
    const handleClosePublishForm = () => {
        setShowPublishForm(false);
        // Lógica opcional para recargar productos al cerrar el formulario
    };
    
    // Función de callback que se ejecuta al publicarse un producto
    const handleProductCreation = () => {
        // 1. Recarga la lista de productos
        fetchProducts(); 
        
        // 2. Cierra el formulario de publicación
        setShowPublishForm(false); 
    };

    // Efecto para cargar los productos cuando el componente se monta
    useEffect(() => {
        fetchProducts();
    }, []); // El array vacío asegura que se ejecuta solo una vez al inicio

    return (
        <div className="home-container">
            {/* Contenedor del nuevo botón y la barra de filtros */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px 0' }}>
                {/* 1. NUEVO BOTÓN: Crear Publicación (visible cuando el formulario está cerrado) */}
                {!showPublishForm && (
                    <button 
                        onClick={handleCreatePublicationClick} 
                        className="btn-create-publication" // Aplica una clase para estilizar
                        style={{
                            padding: '10px 20px', 
                            borderRadius: '8px', 
                            border: 'none', 
                            backgroundColor: '#17a2b8', // Color distintivo (azul/cian)
                            color: 'white', 
                            cursor: 'pointer',
                            fontSize: '1em',
                            fontWeight: 'bold'
                        }}
                    >
                        Crear Publicación 
                    </button>
                )}
            </div>

            {/* Renderizado condicional del formulario o de la interfaz de lista */}
            {showPublishForm ? (
                // Cuando está abierto, muestra el formulario de publicación
                <div className="publish-overlay">
                    <ProductPublish 
                    onClose={handleClosePublishForm} 
                    onProductCreated={handleProductCreation}
                    />
                </div>
            ) : (
                <>
                    {/* Cuando está cerrado, muestra la barra de filtros y la cuadrícula de productos */}
                    <FilterBar /> 
                    <ProductGrid products={products}/> 
                </>
            )}
        </div>
    );
}

export default Home;