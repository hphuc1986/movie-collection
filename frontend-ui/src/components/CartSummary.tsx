import React, { useState } from "react";
import { getCoverImageUrl } from "../services/api";
import "./CartSummary.css";

interface CartItem {
  product: any;
  quantity: number;
}

interface CartSummaryProps {
  cart: CartItem[];
  onRemove: (id: number) => void;
  onQuantityChange: (id: number, quantity: number) => void;
  onCheckout: (discountCode: string | null) => void;
}

export function CartSummary({
  cart,
  onRemove,
  onQuantityChange,
  onCheckout,
}: CartSummaryProps) {
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
    <div className="cart-summary">
      {cart.length === 0 ? (
        <div className="cart-empty-state">
          <p>Your cart is empty.</p>
          <span>Add a title to get started.</span>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <article className="cart-item" key={item.product.id}>
                <div className="cart-item-image">
                  {getCoverImageUrl(item.product.frontCover) ? (
                    <img
                      src={getCoverImageUrl(item.product.frontCover)}
                      alt={item.product.title}
                    />
                  ) : (
                    <span aria-hidden="true">No cover</span>
                  )}
                </div>
                <div className="cart-item-content">
                  <div className="cart-item-heading">
                    <h3>{item.product.title}</h3>
                    <button
                      className="cart-remove-button"
                      type="button"
                      onClick={() => onRemove(item.product.id)}
                      aria-label={`Remove ${item.product.title} from cart`}
                      title="Remove item"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                  <div className="cart-item-meta">
                    {item.product.format && <span>{item.product.format}</span>}
                  </div>
                  <div className="cart-item-bottom">
                    <div
                      className="cart-quantity-control"
                      aria-label={`Quantity: ${item.quantity}`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onQuantityChange(item.product.id, item.quantity - 1)
                        }
                        aria-label={`Decrease quantity of ${item.product.title}`}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          onQuantityChange(item.product.id, item.quantity + 1)
                        }
                        aria-label={`Increase quantity of ${item.product.title}`}
                      >
                        +
                      </button>
                    </div>
                    <strong className="cart-item-price">
                      $
                      {((item.product.price || 14.99) * item.quantity).toFixed(
                        2,
                      )}
                    </strong>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <footer className="cart-footer">
            <details className="cart-promo">
              <summary>
                {appliedDiscount
                  ? `Code applied: ${appliedDiscount.code}`
                  : "Have a promo code?"}
              </summary>
              <form onSubmit={handleApplyPromo}>
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Promo code"
                  aria-label="Promo code"
                />
                <button type="submit">Apply</button>
              </form>
            </details>
            <div className="cart-subtotal">
              <span>{appliedDiscount ? "Total:" : "Subtotal:"}</span>
              <strong>${grandTotal.toFixed(2)}</strong>
            </div>
            {appliedDiscount && (
              <p className="cart-discount-note">
                {appliedDiscount.percent}% discount applied (−$
                {discountAmount.toFixed(2)})
              </p>
            )}
            <button
              className="cart-checkout-button"
              onClick={() => onCheckout(appliedDiscount?.code ?? null)}
            >
              <span aria-hidden="true">🔒</span> Checkout
            </button>
            <p className="cart-shipping-note">
              Taxes &amp; shipping calculated at checkout
            </p>
          </footer>
        </>
      )}
    </div>
  );
}
