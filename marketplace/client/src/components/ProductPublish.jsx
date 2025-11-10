import React, { useState, useEffect } from "react";
import "./login.css";  




const ProductPublish = () => {
    const [image, setImage] = useState(null);
    const [product, setProduct] = useState("");
    const [description, setDescProducto] = useState(null);
    const [price, setPrice] = useState(null);

    const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
    };
    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/api/auth/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          description,
          price,
          image
        })
      });

      const data = await res.json().catch(() => ({}));
    } catch (err) {
      setErrorMsg("Error de red. Verifica que la API esté corriendo en :4000");
    } finally {
      setLoading(false);
    }
  };

    return(
        <div className="login-container">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="product">Nombre Producto</label>
            <input
              id="product"
              type="text"
              placeholder="Producto"
              value={email}
              onChange={(e) => setProducto(e.target.value)}
              autoComplete="text"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="description">Descripcion</label>
            <input
              id="description"
              type="text"
              placeholder="Descripcion del producto"
              value={email}
              onChange={(e) => setDescProducto(e.target.value)}
              autoComplete="text"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="price">Precio</label>
            <input
              id="price"
              type="text"
              placeholder="Precio"
              value={email}
              onChange={(e) => setPrice(e.target.value)}
              autoComplete="text"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="image">Imagen del producto</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange()}
              required
            />

            {image && (
              <div className="image-preview">
                <img src={image} alt="Vista previa" />
              </div>
            )}
        </div>
        </form>
      </div>
    );
};

export default ProductPublish;