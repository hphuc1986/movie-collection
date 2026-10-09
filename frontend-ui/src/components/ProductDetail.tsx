import React, { useState } from "react";

interface ProductDetailProps {
  product: any;
  onBack: () => void;
  onAddToCart: (product: any, quantity: number) => void; // Expanded to support variable quantity inputs!
}

export function ProductDetail({
  product,
  onBack,
  onAddToCart,
}: ProductDetailProps) {
  const isOutOfStock = product.stockQuantity <= 0;

  // Interactive Local Item Quantity Counter Hook
  const [quantity, setQuantity] = useState<number>(1);

  const incrementQty = () => {
    if (quantity < (product.stockQuantity || 99))
      setQuantity((prev) => prev + 1);
  };

  const decrementQty = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  // Helper format module to make ISO timestamp string arrays clean and legible for users
  const formatReleaseDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return dateString.split("T")[0];
    } catch {
      return dateString;
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.25s ease-out" }}>
      {/* Back to Catalog Breadcrumb Link */}
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "#00bc8c",
          cursor: "pointer",
          fontSize: "0.95rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          padding: 0,
          fontWeight: "bold",
        }}
      >
        ← Back to Catalog Products
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 360px) 1fr",
          gap: "3rem",
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: HIGH-RES COVER FRAMING CONTAINER */}
        <div
          style={{
            borderRadius: "6px",
            overflow: "hidden",
            backgroundColor: "#1e1e1e",
            border: "1px solid #282828",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            aspectRatio: "2/3",
          }}
        >
          {product.posterUrl ? (
            <img
              src={product.posterUrl}
              alt={product.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#444",
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              🎬 POSTER CONTAINER
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: RICH PRODUCTION METRICS SPECIFICATIONS PANEL */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div>
            <span
              style={{
                backgroundColor: "#2d2d2d",
                color: "#ffc107",
                padding: "0.35rem 0.75rem",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: "bold",
                border: "1px solid #444",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {product.format || "4K Ultra HD"}
            </span>
            <h2
              style={{
                fontSize: "2.2rem",
                fontWeight: "bold",
                margin: "0.75rem 0 0.25rem 0",
                color: "#fff",
                lineHeight: "1.2",
              }}
            >
              {product.title}
            </h2>
            <p style={{ color: "#aaa", fontSize: "0.9rem", margin: 0 }}>
              Released Catalog Tracking Year:{" "}
              <strong>{product.releaseYear || "N/A"}</strong>
            </p>
          </div>

          <div
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#fff",
              margin: "0.1rem 0",
            }}
          >
            \${(product.price || 14.99).toFixed(2)}
          </div>

          <div
            style={{
              color: !isOutOfStock ? "#00bc8c" : "#ff4d4d",
              fontWeight: "bold",
              fontSize: "0.95rem",
            }}
          >
            {!isOutOfStock
              ? "🟢 In Stock - Usually ships within 24 hours"
              : "🔴 Sorry! This product is currently out of stock"}
          </div>

          {/* QUANTITY CONTROL INCREMENT MATRIX */}
          {!isOutOfStock && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                borderTop: "1px solid #333",
                paddingTop: "1.25rem",
                marginBottom: "0.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#aaa",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Quantity
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #444",
                  borderRadius: "4px",
                  backgroundColor: "#2d2d2d",
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={decrementQty}
                  style={{
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#fff",
                    width: "36px",
                    height: "36px",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                  }}
                >
                  -
                </button>
                <div
                  style={{
                    width: "40px",
                    textAlign: "center",
                    fontSize: "0.95rem",
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                >
                  {quantity}
                </div>
                <button
                  type="button"
                  onClick={incrementQty}
                  style={{
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#fff",
                    width: "36px",
                    height: "36px",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div style={{ borderTop: "1px solid #333", paddingTop: "1.25rem" }}>
            <h4
              style={{
                margin: "0 0 0.5rem 0",
                color: "#aaa",
                textTransform: "uppercase",
                fontSize: "0.8rem",
                letterSpacing: "0.5px",
              }}
            >
              Description
            </h4>
            <p
              style={{
                margin: 0,
                color: "#ddd",
                fontSize: "1.05rem",
                lineHeight: "1.6",
              }}
            >
              {product.description ||
                "A highly sought cinematic catalog choice. Full structural specifications are mapped into this cloud metadata distribution entry point."}
            </p>
          </div>

          {/* COMPREHENSIVE SPECIFICATIONS METRIC TABLE GRID */}
          <div style={{ borderTop: "1px solid #333", paddingTop: "1.25rem" }}>
            <h4
              style={{
                margin: "0 0 0.75rem 0",
                color: "#aaa",
                textTransform: "uppercase",
                fontSize: "0.8rem",
                letterSpacing: "0.5px",
              }}
            >
              Info Details:
            </h4>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                backgroundColor: "#181818",
                padding: "1.25rem",
                borderRadius: "6px",
                border: "1px solid #222",
                fontSize: "0.9rem",
              }}
            >
              <div>
                <span
                  style={{
                    color: "#777",
                    display: "block",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Format Type:
                </span>{" "}
                <strong style={{ color: "#ccc" }}>
                  {product.format || "UHD"}
                </strong>
              </div>
              <div>
                <span
                  style={{
                    color: "#777",
                    display: "block",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Catalog No:
                </span>{" "}
                <strong style={{ color: "#ccc" }}>
                  {product.catalogNo || "1000863251"}
                </strong>
              </div>
              <div>
                <span
                  style={{
                    color: "#777",
                    display: "block",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  UPC Barcode:
                </span>{" "}
                <strong style={{ color: "#ccc" }}>
                  {product.upc || "826663269147"}
                </strong>
              </div>
              <div>
                <span
                  style={{
                    color: "#777",
                    display: "block",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Rating:
                </span>{" "}
                <strong style={{ color: "#ccc" }}>
                  {product.rating ? `${product.rating}A` : "NR"}
                </strong>
              </div>
              <div>
                <span
                  style={{
                    color: "#777",
                    display: "block",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Release Date:
                </span>{" "}
                <strong style={{ color: "#ccc" }}>
                  {formatReleaseDate(product.releaseDate)}
                </strong>
              </div>
              <div>
                <span
                  style={{
                    color: "#777",
                    display: "block",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Studio Description:
                </span>{" "}
                <strong style={{ color: "#ccc" }}>
                  {product.studio || "Shout! Factory"}
                </strong>
              </div>
              <div>
                <span
                  style={{
                    color: "#777",
                    display: "block",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Region Coding:
                </span>{" "}
                <strong style={{ color: "#ccc" }}>
                  {product.region || "Region A"}
                </strong>
              </div>
              <div>
                <span
                  style={{
                    color: "#777",
                    display: "block",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Running Time:
                </span>{" "}
                <strong style={{ color: "#ccc" }}>
                  {product.runningTime ? `${product.runningTime} mins` : "N/A"}
                </strong>
              </div>
              <div>
                <span
                  style={{
                    color: "#777",
                    display: "block",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Discs Counts:
                </span>{" "}
                <strong style={{ color: "#ccc" }}>{product.discs || 1}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => !isOutOfStock && onAddToCart(product, quantity)}
            disabled={isOutOfStock}
            style={{
              padding: "0.9rem 2rem",
              backgroundColor: isOutOfStock ? "#252525" : "#00bc8c",
              color: isOutOfStock ? "#555" : "#fff",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              fontSize: "0.95rem",
              cursor: isOutOfStock ? "not-allowed" : "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginTop: "1rem",
              width: "280px",
              transition: "background-color 0.2s",
            }}
          >
            {isOutOfStock ? "🚫 Out of Stock" : "🛒 Add to Basket"}
          </button>
        </div>
      </div>
    </div>
  );
}
