import { useEffect, useState } from "react";
import { getMovies, type Movie } from "./services/api";
import { AuthForm } from "./components/AuthForm";
import { CartSummary } from "./components/CartSummary";

interface CartItem {
  product: Movie;
  quantity: number;
}

function App() {
  const [products, setProducts] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const data = await getMovies();
      setProducts(Array.isArray(data) ? data : [data]);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(
        "Could not fetch store catalog fields from the Cloudflare Worker API.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    fetchCatalog();
  }, []);

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId),
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setCart([]);
  };

  return (
    <div
      style={{
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: "#121212",
        color: "#fff",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid #333",
          paddingBottom: "1rem",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ color: "#E50914", margin: 0 }}>🎬 CineStore Hub</h1>
          <p style={{ color: "#aaa", margin: "0.5rem 0 0" }}>
            Cross-Platform API-First Movie Store Ecosystem
          </p>
        </div>
        {user ? (
          <div style={{ textAlign: "right" }}>
            <span
              style={{
                marginRight: "1rem",
                fontSize: "0.95rem",
                color: "#00bc8c",
              }}
            >
              👋 Customer: <strong>{user.fullName}</strong>
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.4rem 1rem",
                backgroundColor: "#333",
                color: "#fff",
                border: "1px solid #555",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <span style={{ fontSize: "0.9rem", color: "#aaa" }}>
            👤 Guest Session
          </span>
        )}
      </header>

      {!user ? (
        <AuthForm
          onAuthSuccess={(u, t) => {
            setUser(u);
            setToken(t);
          }}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          <div>
            {loading && (
              <p style={{ color: "#007ACC" }}>
                🔄 Loading store showcase catalog arrays...
              </p>
            )}
            {error && (
              <div
                style={{
                  backgroundColor: "#3a0d11",
                  border: "1px solid #e50914",
                  padding: "1rem",
                  borderRadius: "4px",
                  color: "#ffb3b3",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {!loading && !error && (
              <div>
                <h2
                  style={{
                    fontSize: "1.4rem",
                    marginTop: 0,
                    marginBottom: "1.5rem",
                    borderBottom: "2px solid #E50914",
                    paddingBottom: "0.5rem",
                  }}
                >
                  🎥 Available Movies & Media Products
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  {products.map((product: any) => (
                    <div
                      key={product.id}
                      style={{
                        backgroundColor: "#1e1e1e",
                        borderRadius: "8px",
                        padding: "1.5rem",
                        border: "1px solid #2d2d2d",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              color: "#fff",
                              fontSize: "1.15rem",
                            }}
                          >
                            {product.title}
                          </h3>
                          <span
                            style={{
                              backgroundColor: "#333",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              color: "#aaa",
                              fontWeight: "bold",
                            }}
                          >
                            {product.format}
                          </span>
                        </div>
                        <p
                          style={{
                            color: "#aaa",
                            fontSize: "0.85rem",
                            margin: "0 0 1rem 0",
                            lineHeight: "1.4",
                            height: "40px",
                            overflow: "hidden",
                          }}
                        >
                          {product.description ||
                            "No movie description listed in catalog yet."}
                        </p>
                        <span style={{ fontSize: "0.85rem", color: "#888" }}>
                          📅 Release: {product.releaseYear || "N/A"}
                        </span>
                      </div>
                      <div
                        style={{
                          marginTop: "1.5rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "1.3rem",
                            fontWeight: "bold",
                            color: "#ffc107",
                          }}
                        >
                          ${(product.price || 14.99).toFixed(2)}
                        </span>
                        <button
                          onClick={() => addToCart(product)}
                          style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "#E50914",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                          }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <CartSummary cart={cart} onRemove={removeFromCart} />
        </div>
      )}
    </div>
  );
}

export default App;
