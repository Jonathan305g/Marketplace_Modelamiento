import Home from "./pages/Home.jsx";
import NavBar from "./components/NavBar.jsx";

export default function App() {
  return (
    <>
      <NavBar />
      <Home />
      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Marketplace Multiempresa — Demo UI</p>
        </div>
      </footer>
    </>
  );
}
