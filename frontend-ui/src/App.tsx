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

  // Identity Session Hooks
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Checkout Control Modal Hook
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

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

  const handleCheckoutIntent = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      alert(
        "Proceeding to integrated Stripe test payment gateway routing streams...",
      );
    }
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
        boxSizing: "border-box",
      }}
    >
      {/* 1. APP HEADER */}
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
          <h1 style={{ color: "#E50914", margin: 0, letterSpacing: "0.5px" }}>
            🎬 CineStore Hub
          </h1>
          <p
            style={{ color: "#aaa", margin: "0.5rem 0 0", fontSize: "0.9rem" }}
          >
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
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              padding: "0.5rem 1.2rem",
              backgroundColor: "#E50914",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Sign In / Register
          </button>
        )}
      </header>

      {/* 2. OPEN STOREFRONT TWO-COLUMN GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "3fr 1fr",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: PRODUCT CATALOG */}
        <div>
          {loading && (
            <p style={{ color: "#007ACC", fontWeight: "500" }}>
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
                marginBottom: "1rem",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && (
            <div>
              <h2
                style={{
                  fontSize: "1.3rem",
                  marginTop: 0,
                  marginBottom: "1.5rem",
                  borderBottom: "2px solid #E50914",
                  paddingBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#fff",
                }}
              >
                4K New Releases & Catalog Items
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "2rem",
                }}
              >
                {products.map((product: any) => {
                  const isOutOfStock = product.stockQuantity <= 0;

                  return (
                    <div
                      key={product.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "transparent",
                      }}
                    >
                      {/* POSTER CARD BOX FRAME */}
                      <div
                        style={{
                          width: "100%",
                          height: "320px",
                          borderRadius: "4px",
                          overflow: "hidden",
                          backgroundColor: "#1e1e1e",
                          position: "relative",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
                          marginBottom: "0.75rem",
                          border: "1px solid #282828",
                        }}
                      >
                        {product.posterUrl ? (
                          <img
                            src={product.posterUrl}
                            alt={product.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "100%",
                              color: "#555",
                              fontSize: "0.85rem",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                            }}
                          >
                            🎬 Movie Poster
                          </div>
                        )}

                        {/* Format Badging */}
                        <span
                          style={{
                            position: "absolute",
                            top: "8px",
                            left: "8px",
                            backgroundColor: "rgba(0,0,0,0.85)",
                            color: "#fff",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "2px",
                            fontSize: "0.65rem",
                            fontWeight: "bold",
                            border: "1px solid #333",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {product.format}
                        </span>
                      </div>

                      {/* TEXT INFO HIERARCHY */}
                      <div
                        style={{
                          flex: 1,
                          padding: "0 0.25rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <h3
                          style={{
                            margin: "0 0 0.25rem 0",
                            color: "#fff",
                            fontSize: "1rem",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {product.title}
                        </h3>
                        <p
                          style={{
                            margin: "0 0 0.5rem 0",
                            color: "#777",
                            fontSize: "0.85rem",
                          }}
                        >
                          Release Year: {product.releaseYear || "N/A"}
                        </p>
                        <div
                          style={{
                            fontSize: "1.2rem",
                            fontWeight: "bold",
                            color: "#ffc107",
                          }}
                        >
                          ${(product.price || 14.99).toFixed(2)}
                        </div>
                      </div>

                      {/* FULL WIDTH TRANSACTION ACTION BUTTON */}
                      <button
                        onClick={() => !isOutOfStock && addToCart(product)}
                        disabled={isOutOfStock}
                        style={{
                          width: "100%",
                          padding: "0.65rem",
                          backgroundColor: isOutOfStock ? "#252525" : "#E50914",
                          color: isOutOfStock ? "#555" : "#fff",
                          border: isOutOfStock ? "1px solid #333" : "none",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                          cursor: isOutOfStock ? "not-allowed" : "pointer",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          transition: "background-color 0.2s, color 0.2s",
                        }}
                      >
                        {isOutOfStock ? "🚫 Sold Out" : "🛒 Add to Cart"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INTERACTIVE SHOPPING CART */}
        <CartSummary
          cart={cart}
          onRemove={removeFromCart}
          onCheckout={handleCheckoutIntent}
        />
      </div>

      {/* 3. POPUP MODAL AUTH FORM GUARD LAYER */}
      {showAuthModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{ position: "relative", width: "100%", maxWidth: "420px" }}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "18px",
                background: "none",
                border: "none",
                color: "#aaa",
                fontSize: "1.6rem",
                cursor: "pointer",
                zIndex: 1010,
              }}
            >
              &times;
            </button>
            <AuthForm
              onAuthSuccess={(u, t) => {
                setUser(u);
                setToken(t);
                setShowAuthModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
