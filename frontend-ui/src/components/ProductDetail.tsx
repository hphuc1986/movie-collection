import { useState } from "react";
import { getCoverImageUrl } from "../services/api";
import "./ProductDetail.css";

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
  const [activeCover, setActiveCover] = useState<"front" | "back">("front");
  const frontCoverUrl = getCoverImageUrl(product.frontCover);
  const backCoverUrl = getCoverImageUrl(product.backCover);
  const displayedCover =
    activeCover === "back" && backCoverUrl
      ? "back"
      : frontCoverUrl
        ? "front"
        : backCoverUrl
          ? "back"
          : "front";
  const displayedCoverUrl =
    displayedCover === "back" ? backCoverUrl : frontCoverUrl;

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
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return dateString;
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className="product-detail"
      style={{ animation: "fadeIn 0.25s ease-out" }}
    >
      {/* Back to Catalog Breadcrumb Link */}
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "#6847ff",
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
        ← Back to Catalog
      </button>

      <div
        className="product-detail-layout"
        style={{
          display: "grid",
          gap: "3rem",
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: FRONT AND BACK COVER GALLERY */}
        <div className="product-detail-cover-column">
          <div className="product-detail-poster">
            {displayedCoverUrl ? (
              <img
                src={displayedCoverUrl}
                alt={`${product.title} ${displayedCover} cover`}
                className="product-detail-cover-image"
              />
            ) : (
              <div className="product-detail-cover-placeholder">
                {displayedCover === "front" ? "Front" : "Back"} cover image
                unavailable
              </div>
            )}
          </div>
          <div
            className="product-detail-cover-toggle"
            role="group"
            aria-label="Choose product cover"
          >
            <button
              type="button"
              className={displayedCover === "front" ? "is-active" : ""}
              onClick={() => setActiveCover("front")}
              aria-pressed={displayedCover === "front"}
              disabled={!frontCoverUrl}
            >
              Front Cover
            </button>
            <button
              type="button"
              className={displayedCover === "back" ? "is-active" : ""}
              onClick={() => setActiveCover("back")}
              aria-pressed={displayedCover === "back"}
              disabled={!backCoverUrl}
            >
              Back Cover
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: RICH PRODUCTION METRICS SPECIFICATIONS PANEL */}
        <div
          className="product-detail-information"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div>
            <span
              style={{
                backgroundColor: "#f1efff",
                color: "#6847ff",
                padding: "0.35rem 0.75rem",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: "bold",
                border: "1px solid #e1dcff",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {product.format || "4K Ultra HD"}
            </span>
            <h2
              className="product-detail-title"
              style={{
                fontWeight: "bold",
                margin: "0.75rem 0 0.25rem 0",
                color: "#262238",
                lineHeight: "1.2",
              }}
            >
              {product.title}
            </h2>
          </div>

          <div className="product-detail-price">
            ${(product.price || 14.99).toFixed(2)}
          </div>

          <div
            className={`product-detail-stock${isOutOfStock ? " is-out-of-stock" : ""}`}
          >
            <strong>
              {isOutOfStock
                ? "Out of stock"
                : `${product.stockQuantity} In stock`}
            </strong>
            {!isOutOfStock && (
              <span>Usually shipped within 24 hours</span>
            )}
          </div>

          {/* QUANTITY CONTROL INCREMENT MATRIX */}
          {!isOutOfStock && (
            <div className="product-detail-purchase-row">
              <span className="product-detail-quantity-label">Quantity</span>
              <div className="product-detail-quantity-control">
                <button
                  type="button"
                  onClick={decrementQty}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <div className="product-detail-quantity-value">{quantity}</div>
                <button
                  type="button"
                  onClick={incrementQty}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                className="product-detail-add-button"
                onClick={() => onAddToCart(product, quantity)}
              >
                Add to cart
              </button>
            </div>
          )}

          <div className="product-detail-section">
            <h4
              style={{
                margin: "0 0 0.5rem 0",
                color: "#6847ff",
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
                color: "#383641",
                fontSize: "1.05rem",
                lineHeight: "1.6",
              }}
            >
              {product.description ||
                "A highly sought cinematic catalog choice. Full structural specifications are mapped into this cloud metadata distribution entry point."}
            </p>
          </div>

          {/* COMPREHENSIVE SPECIFICATIONS METRIC TABLE GRID */}
          <div className="product-detail-section">
            <h4
              style={{
                margin: "0 0 0.75rem 0",
                color: "#6847ff",
                textTransform: "uppercase",
                fontSize: "0.8rem",
                letterSpacing: "0.5px",
              }}
            >
              Info Details:
            </h4>

            <div
              className="product-detail-specs"
              style={{
                display: "grid",
                gap: "0.75rem",
                backgroundColor: "#faf9fc",
                padding: "1.25rem",
                borderRadius: "6px",
                border: "1px solid #eceaf0",
                fontSize: "0.9rem",
              }}
            >
              <div>
                <span
                  style={{
                    color: "#5b5865",
                    display: "block",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Format Type:
                </span>{" "}
                <strong>{product.format || "UHD"}</strong>
              </div>
              <div>
                <span
                  style={{
                    color: "#5b5865",
                    display: "block",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Release Date:
                </span>{" "}
                <strong>{formatReleaseDate(product.releaseDate)}</strong>
              </div>
              <div>
                <span
                  style={{
                    color: "#5b5865",
                    display: "block",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Studio Description:
                </span>{" "}
                <strong>{product.studio || "Shout! Factory"}</strong>
              </div>
              <div>
                <span
                  style={{
                    color: "#5b5865",
                    display: "block",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Region Coding:
                </span>{" "}
                <strong>{product.region || "Region A"}</strong>
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

        </div>
      </div>
    </div>
  );
}
