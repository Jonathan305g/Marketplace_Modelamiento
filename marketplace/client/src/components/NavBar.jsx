import FilterBar from "./FilterBar.jsx";
import ProductGrid from "./ProductGrid.jsx";

const DEMO_PRODUCTS = [
  {
    id: "p-001",
    name: "Cámara Mirrorless",
    price: 799.99,
    location: "Ambato",
    category: "Electrónica",
    thumbnail: "https://picsum.photos/seed/cam/600/600",
    publishedAt: "2025-10-01",
  },
  {
    id: "p-002",
    name: "Silla Ergonómica Pro",
    price: 199.9,
    location: "Quito",
    category: "Hogar",
    thumbnail: "https://picsum.photos/seed/chair/600/600",
    publishedAt: "2025-09-28",
  },
  {
    id: "p-003",
    name: "Zapatillas Running",
    price: 89.5,
    location: "Cuenca",
    category: "Deportes",
    thumbnail: "https://picsum.photos/seed/shoes/600/600",
    publishedAt: "2025-10-10",
  },
  {
    id: "p-004",
    name: "Smartphone XPro",
    price: 999.0,
    location: "Guayaquil",
    category: "Electrónica",
    thumbnail: "https://picsum.photos/seed/phone/600/600",
    publishedAt: "2025-10-07",
  },
  {
    id: "p-005",
    name: "Guitarra Acústica",
    price: 145.0,
    location: "Latacunga",
    category: "Música",
    thumbnail: "https://picsum.photos/seed/guitar/600/600",
    publishedAt: "2025-09-15",
  },
  {
    id: "p-006",
    name: "Cafetera Espresso",
    price: 120.0,
    location: "Riobamba",
    category: "Hogar",
    thumbnail: "https://picsum.photos/seed/coffee/600/600",
    publishedAt: "2025-10-05",
  },
];

export default function Home() {
  return (
    <main className="home">
      <section className="hero">
        <div className="container hero__content">
          <div>
            <h1>Explora productos y servicios</h1>
            <p className="hero__subtitle">
              Filtra por categoría, precio o ubicación. (Demo visual — sin lógica aún)
            </p>
          </div>
          <picture className="hero__image">
            <img
              src="https://picsum.photos/seed/market/960/520"
              alt="Banner marketplace"
              loading="lazy"
            />
          </picture>
        </div>
      </section>

      <section className="container section">
        <FilterBar />
        <ProductGrid products={DEMO_PRODUCTS} />
      </section>
    </main>
  );
}
