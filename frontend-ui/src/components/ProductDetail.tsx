import React from "react";
import { type Movie } from "../services/api";

interface ProductDetailProps {
  product: any;
  onBack: () => void;
  onAddToCart: (product: any) => void;
}

export function ProductDetail({
  product,
  onBack,
  onAddToCart,
}: ProductDetailProps) {
  const isOutOfStock = product.stockQuantity <= 0;

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
        {/* Left Column: High-Res Media Poster Art Frame */}
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
              🎬 POSTER ART FRAME
            </div>
          )}
        </div>

        {/* Right Column: Complete E-Commerce Inventory Specifications Data */}
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
            <p style={{ color: "#00bc8c", fontSize: "0.9rem", margin: 0 }}>
              Released Catalog Tracking: {product.releaseYear || "N/A"}
            </p>
          </div>

          <div
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#fff",
              margin: "0.25rem 0",
            }}
          >
            ${(product.price || 14.99).toFixed(2)}
          </div>

          <div
            style={{
              color: !isOutOfStock ? "#00bc8c" : "#ff4d4d",
              fontWeight: "bold",
              fontSize: "0.95rem",
            }}
          >
            {!isOutOfStock
              ? "🟢 In Stock - Ready to Ship"
              : "🔴 Sorry! This product is currently out of stock"}
          </div>

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
                "A premium edition release selection. Full relational retail inventory specs and streaming configuration mappings are active for this product module block."}
            </p>
          </div>

          <div
            style={{
              borderTop: "1px solid #333",
              paddingTop: "1.25rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              backgroundColor: "#181818",
              padding: "1rem",
              borderRadius: "6px",
              border: "1px solid #222",
            }}
          >
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "#777",
                  textTransform: "uppercase",
                  marginBottom: "0.2rem",
                }}
              >
                Format Type
              </span>
              <strong style={{ fontSize: "0.9rem", color: "#ccc" }}>
                {product.format}
              </strong>
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "#777",
                  textTransform: "uppercase",
                  marginBottom: "0.2rem",
                }}
              >
                Studio Distribution
              </span>
              <strong style={{ fontSize: "0.9rem", color: "#ccc" }}>
                Well Go USA / Universal
              </strong>
            </div>
          </div>

          <button
            onClick={() => !isOutOfStock && onAddToCart(product)}
            disabled={isOutOfStock}
            style={{
              padding: "0.9rem 2rem",
              backgroundColor: isOutOfStock ? "#252525" : "#E50914",
              color: isOutOfStock ? "#555" : "#fff",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              fontSize: "0.95rem",
              cursor: isOutOfStock ? "not-allowed" : "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginTop: "1rem",
              width: "260px",
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
