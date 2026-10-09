import { useEffect, useState } from "react";
import { getCoverImageUrl, getMovies, type Movie } from "./services/api";
import { AuthForm } from "./components/AuthForm";
import { CartSummary } from "./components/CartSummary";
import { CheckoutPage } from "./components/CheckoutPage";
import { OrderHistory } from "./components/OrderHistory";
import { ProductDetail } from "./components/ProductDetail";
import "./catalog.css";

interface CartItem {
  product: Movie;
  quantity: number;
}

const catalogCategories = ["All", "Steelbooks", "4K", "Blu-ray", "DVD"];

function App() {
  const [products, setProducts] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Identity Session Hooks
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("All");

  // UX Interaction State Controls
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [checkoutDiscountCode, setCheckoutDiscountCode] = useState<string | null>(null);

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
      setAccessToken(savedToken);
    }
    fetchCatalog();
  }, []);

  // Update your addToCart function inside frontend-ui/src/App.tsx to match this:
  const addToCart = (product: any, selectedQty: number = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + selectedQty }
            : item,
        );
      }
      return [...prevCart, { product, quantity: selectedQty }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId),
    );
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const handleCheckoutIntent = (discountCode: string | null) => {
    if (cart.length === 0) return;
    setCheckoutDiscountCode(discountCode);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setAccessToken(null);
    setCart([]);
    setIsCartOpen(false);
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const catalogProducts = Array.isArray(products) ? products : [];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = catalogProducts.filter((product: any) => {
    const searchableText = [
      product.title,
      product.description,
      product.format,
      product.studio,
      product.catalogNo,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const normalizedFormat = String(product.format || "").toLowerCase();
    const categoryText = `${searchableText} ${normalizedFormat}`;
    const matchesCategory = (() => {
      switch (selectedFormat) {
        case "Steelbooks":
          return categoryText.includes("steelbook");
        case "4K":
          return /\b4k\b|uhd/.test(normalizedFormat);
        case "Blu-ray":
          return /blu[ -]?ray/.test(normalizedFormat);
        case "DVD":
          return /\bdvd\b/.test(normalizedFormat);
        default:
          return true;
      }
    })();

    return matchesCategory && searchableText.includes(normalizedQuery);
  });

  // Leave your cursor right here at the bottom and copy Part 2 immediately below!
  return (
    <div
      style={{
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: isCheckoutOpen ? "#fff" : "#121212",
        color: isCheckoutOpen ? "#24252a" : "#fff",
        minHeight: "100vh",
        padding: isCheckoutOpen ? 0 : "clamp(1rem, 4vw, 2rem)",
        boxSizing: "border-box",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* 1. APP NAVBAR HEADER */}
      {!isCheckoutOpen && <header
        className="app-header"
        style={{
          borderBottom: "1px solid #333",
          paddingBottom: "1rem",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "clamp(1rem, 4vw, 3.5rem)",
        }}
      >
        <div
          style={{ cursor: "pointer" }}
          onClick={() => setSelectedProduct(null)}
        >
          <h1
            style={{
              color: "#E50914",
              margin: 1,
              letterSpacing: "0.5px",
              fontSize: "clamp(1.25rem, 6vw, 2.25rem)",
              whiteSpace: "nowrap",
            }}
          >
            CineStore
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(0.4rem, 2vw, 1.5rem)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              backgroundColor: "#222",
              border: "1px solid #444",
              color: "#fff",
              padding: "0.5rem clamp(0.35rem, 1.4vw, 1rem)",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            🛒 Cart{" "}
            <span
              style={{
                backgroundColor: "#E50914",
                color: "#fff",
                padding: "0.1rem 0.35rem",
                borderRadius: "10px",
                fontSize: "0.75rem",
              }}
            >
              {totalCartItems}
            </span>
          </button>

          {user ? (
            <div
              className="signed-in-actions"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(0.4rem, 2vw, 1rem)",
              }}
            >
              <span
                className="signed-in-greeting"
                style={{
                  marginRight: "1rem",
                  fontSize: "0.95rem",
                  color: "#00bc8c",
                }}
              >
                👋 <strong>{user.fullName}</strong>
              </span>
              {!String(user.email || "").endsWith("@cinestore.invalid") && (
                <button
                  className="orders-nav-button"
                  onClick={() => {
                    setIsOrderHistoryOpen(true);
                    setIsCartOpen(false);
                  }}
                  style={{
                    padding: "0.4rem 0.75rem",
                    backgroundColor: "#222",
                    color: "#fff",
                    border: "1px solid #444",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Orders
                </button>
              )}
              <button
                className="logout-nav-button"
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
                padding: "0.5rem clamp(0.5rem, 2vw, 1.2rem)",
                backgroundColor: "#E50914",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>}

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
          {isCheckoutOpen ? (
            <CheckoutPage
              cart={cart}
              user={user}
              accessToken={accessToken}
              discountCode={checkoutDiscountCode}
              onBack={(orderPlaced) => {
                setIsCheckoutOpen(false);
                if (orderPlaced) {
                  setCheckoutDiscountCode(null);
                } else {
                  setIsCartOpen(true);
                }
              }}
              onOrderPlaced={() => {
                setCart([]);
                setCheckoutDiscountCode(null);
              }}
            />
          ) : isOrderHistoryOpen && accessToken ? (
            <OrderHistory
              accessToken={accessToken}
              onBack={() => setIsOrderHistoryOpen(false)}
            />
          ) : selectedProduct ? (
            <ProductDetail
              product={selectedProduct}
              onBack={() => setSelectedProduct(null)}
              onAddToCart={addToCart}
            />
          ) : (
            <div>
              <section
                className="catalog-controls"
                aria-label="Catalog search and filters"
              >
                <label className="catalog-search">
                  <span className="catalog-search-icon" aria-hidden="true">
                    ⌕
                  </span>
                  <span className="visually-hidden">Search movies</span>
                  <input
                    type="search"
                    placeholder="Find a movie, format, or studio"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </label>
                <div
                  className="catalog-format-filters"
                  role="group"
                  aria-label="Filter movies by category"
                >
                  {catalogCategories.map((format) => (
                    <button
                      key={format}
                      type="button"
                      className={selectedFormat === format ? "is-active" : ""}
                      aria-pressed={selectedFormat === format}
                      onClick={() => setSelectedFormat(format)}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </section>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "2rem",
                }}
              >
                {filteredProducts.map((product: any) => {
                  const isOutOfStock = product.stockQuantity <= 0;
                  const frontCoverUrl = getCoverImageUrl(product.frontCover);

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
                          aspectRatio: "6/7",
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
                        {frontCoverUrl ? (
                          <img
                            src={frontCoverUrl}
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
              {filteredProducts.length === 0 && (
                <p className="catalog-empty-state">
                  No titles match these filters. Try another search or format.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. SLIDE-OUT CART DRAWER */}
      <button
        className={`cart-backdrop${isCartOpen ? " is-open" : ""}`}
        type="button"
        aria-label="Close cart"
        tabIndex={isCartOpen ? 0 : -1}
        onClick={() => setIsCartOpen(false)}
      />
      <aside
        className={`cart-drawer${isCartOpen ? " is-open" : ""}`}
        aria-label="Shopping cart"
        aria-hidden={!isCartOpen}
      >
        <header className="cart-drawer-header">
          <h2>Cart</h2>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart drawer"
            title="Close cart"
          >
            ×
          </button>
        </header>
        <CartSummary
          cart={cart}
          onRemove={removeFromCart}
          onQuantityChange={updateCartQuantity}
          onCheckout={handleCheckoutIntent}
        />
      </aside>

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
                setAccessToken(t);
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
