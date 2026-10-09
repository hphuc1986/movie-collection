import React, { useState } from "react";

interface CartItem {
  product: any;
  quantity: number;
}

interface CartSummaryProps {
  cart: CartItem[];
  onRemove: (id: number) => void;
}

export function CartSummary({ cart, onRemove }: CartSummaryProps) {
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    percent: number;
  } | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = discountCode.trim().toUpperCase();
    if (cleanCode === "MOVIEDEAL20") {
      setAppliedDiscount({ code: "MOVIEDEAL20", percent: 20 });
      setDiscountCode("");
    } else {
      alert("Invalid promotional discount code.");
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.product.price || 14.99) * item.quantity,
    0,
  );
  const discountAmount = appliedDiscount
    ? subtotal * (appliedDiscount.percent / 100)
    : 0;
  const grandTotal = subtotal - discountAmount;

  return (
    <div
      style={{
        backgroundColor: "#1e1e1e",
        padding: "1.5rem",
        borderRadius: "8px",
        border: "1px solid #2d2d2d",
        boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          fontSize: "1.25rem",
          color: "#E50914",
          borderBottom: "1px solid #333",
          paddingBottom: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        🛒 Shopping Cart
      </h2>

      {cart.length === 0 ? (
        <p
          style={{
            color: "#aaa",
            fontSize: "0.9rem",
            textAlign: "center",
            padding: "2rem 0",
          }}
        >
          Your cart is empty. Add movies to get started!
        </p>
      ) : (
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginBottom: "1.5rem",
              maxHeight: "250px",
              overflowY: "auto",
            }}
          >
            {cart.map((item) => (
              <div
                key={item.product.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.9rem",
                  backgroundColor: "#2d2d2d",
                  padding: "0.5rem",
                  borderRadius: "4px",
                }}
              >
                <div style={{ maxWidth: "65%" }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.product.title}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#aaa" }}>
                    {item.quantity} x ${item.product.price.toFixed(2)}
                  </div>
                </div>
                <button
                  onClick={() => onRemove(item.product.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ff4d4d",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleApplyPromo}
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1.5rem",
              borderTop: "1px solid #333",
              paddingTop: "1rem",
            }}
          >
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="PROMO CODE"
              style={{
                flex: 1,
                padding: "0.4rem",
                borderRadius: "4px",
                border: "1px solid #444",
                backgroundColor: "#2d2d2d",
                color: "#fff",
                fontSize: "0.85rem",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.4rem 0.8rem",
                backgroundColor: "#00bc8c",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </form>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              fontSize: "0.9rem",
              borderTop: "1px solid #333",
              paddingTop: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#aaa" }}>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {appliedDiscount && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#00bc8c",
                }}
              >
                <span>Discount ({appliedDiscount.code}):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.1rem",
                fontWeight: "bold",
                borderTop: "1px solid #444",
                paddingTop: "0.5rem",
                marginTop: "0.25rem",
              }}
            >
              Total:
              <span style={{ color: "#ffc107" }}>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() =>
              alert(
                "Proceeding to integrated Stripe test payment routing gateway...",
              )
            }
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#00bc8c",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            💳 Secure Checkout
          </button>
        </div>
      )}
    </div>
  );
}
