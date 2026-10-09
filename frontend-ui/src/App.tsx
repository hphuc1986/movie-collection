import { useEffect, useState } from "react";
import { getMovies, type Movie } from "./services/api";
import { AuthForm } from "./components/AuthForm";
import { CartSummary } from "./components/CartSummary";
import { ProductDetail } from "./components/ProductDetail";

interface CartItem {
  product: Movie;
  quantity: number;
}

function App() {
  const [products, setProducts] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Identity Session Hooks
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // UX Interaction State Controls
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

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
    setIsCartOpen(true);
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
    setIsCartOpen(false);
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Leave your cursor right here at the bottom and copy Part 2 immediately below!
  return (
    <div
      style={{
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: "#121212",
        color: "#fff",
        minHeight: "100vh",
        padding: "2rem",
        boxSizing: "border-box",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* 1. APP NAVBAR HEADER */}
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
        <div
          style={{ cursor: "pointer" }}
          onClick={() => setSelectedProduct(null)}
        >
          <h1 style={{ color: "#E50914", margin: 0, letterSpacing: "0.5px" }}>
            🎬 CineStore Hub
          </h1>
          <p
            style={{ color: "#aaa", margin: "0.5rem 0 0", fontSize: "0.9rem" }}
          >
            Cross-Platform API-First Movie Store Ecosystem
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              backgroundColor: "#222",
              border: "1px solid #444",
              color: "#fff",
              padding: "0.6rem 1.2rem",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            🛒 Cart{" "}
            <span
              style={{
                backgroundColor: "#E50914",
                color: "#fff",
                padding: "0.1rem 0.5rem",
                borderRadius: "10px",
                fontSize: "0.75rem",
              }}
            >
              {totalCartItems}
            </span>
          </button>

          {user ? (
            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  marginRight: "1rem",
                  fontSize: "0.95rem",
                  color: "#00bc8c",
                }}
              >
                👋 <strong>{user.fullName}</strong>
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
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

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
      {loading && (
        <p style={{ color: "#007ACC", fontWeight: "500" }}>
          🔄 Synchronizing catalog array indices...
        </p>
      )}

      {/* 2. DYNAMIC MAIN CORE ROUTING LOGIC BLOCK */}
      {!loading && !error && (
        <div style={{ width: "100%" }}>
          {selectedProduct ? (
            <ProductDetail
              product={selectedProduct}
              onBack={() => setSelectedProduct(null)}
              onAddToCart={addToCart}
            />
          ) : (
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
                      <div
                        onClick={() => setSelectedProduct(product)}
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
                          cursor: "pointer",
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
                            }}
                          >
                            🎬 VIEW DETAILS
                          </div>
                        )}
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
                          }}
                        >
                          {product.format}
                        </span>
                      </div>

                      <div
                        style={{
                          flex: 1,
                          padding: "0 0.25rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <h3
                          onClick={() => setSelectedProduct(product)}
                          style={{
                            margin: "0 0 0.25rem 0",
                            color: "#fff",
                            fontSize: "1rem",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            cursor: "pointer",
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
                          Year: {product.releaseYear || "N/A"}
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
      )}

      {/* 3. FLOATING SIDEBAR DRAWER OVERLAY WRAPPER PANEL */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: isCartOpen ? 0 : "-420px",
          width: "100%",
          maxWidth: "400px",
          height: "100vh",
          backgroundColor: "#1e1e1e",
          borderLeft: "1px solid #333",
          boxSizing: "border-box",
          padding: "2rem 1.5rem",
          boxShadow: "-8px 0 24px rgba(0,0,0,0.5)",
          zIndex: 2000,
          transition: "right 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)",
          overflowY: "auto",
        }}
      >
        <button
          onClick={() => setIsCartOpen(false)}
          style={{
            background: "none",
            border: "none",
            color: "#aaa",
            fontSize: "0.9rem",
            cursor: "pointer",
            fontWeight: "bold",
            padding: 0,
            marginBottom: "1.5rem",
            textTransform: "uppercase",
          }}
        >
          ✕ Close Cart Drawer
        </button>
        <CartSummary
          cart={cart}
          onRemove={removeFromCart}
          onCheckout={handleCheckoutIntent}
        />
      </div>

      {/* 4. MODAL AUTH CONTAINER OVERLAY */}
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
            zIndex: 3000,
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
                zIndex: 3010,
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
