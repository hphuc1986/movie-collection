import { useState, type FormEvent } from "react";
import {
  createTestOrder,
  getCoverImageUrl,
  type TestOrderResponse,
} from "../services/api";
import "./CheckoutPage.css";

interface CheckoutCartItem {
  product: any;
  quantity: number;
}

interface CheckoutPageProps {
  cart: CheckoutCartItem[];
  user: any;
  discountCode: string | null;
  onBack: (orderPlaced: boolean) => void;
  onOrderPlaced: () => void;
}

interface CheckoutForm {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  address1: string;
  address2: string;
  city: string;
  region: string;
  postalCode: string;
  phone: string;
}

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

export function CheckoutPage({
  cart,
  user,
  discountCode,
  onBack,
  onOrderPlaced,
}: CheckoutPageProps) {
  const nameParts = String(user?.fullName || "")
    .trim()
    .split(/\s+/);
  const [form, setForm] = useState<CheckoutForm>({
    email: user?.email || "",
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" "),
    country: "Canada",
    address1: "",
    address2: "",
    city: "",
    region: "",
    postalCode: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TestOrderResponse | null>(null);

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.product.price || 14.99) * item.quantity,
    0,
  );
  const previewDiscount = discountCode === "MOVIEDEAL20" ? subtotal * 0.2 : 0;

  const updateField = (field: keyof CheckoutForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await createTestOrder({
        customerId: user?.id || null,
        customerName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        shippingAddress: {
          address1: form.address1.trim(),
          address2: form.address2.trim() || undefined,
          city: form.city.trim(),
          region: form.region.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country,
        },
        items: cart.map((item) => ({
          productId: Number(item.product.id),
          quantity: item.quantity,
        })),
        discountCode,
      });

      setOrder(result);
      onOrderPlaced();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.error ||
          "We couldn't save this test order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        {!order && (
          <button type="button" onClick={() => onBack(false)}>
            ← Back to cart
          </button>
        )}
        <span className="checkout-brand">CineStore</span>
        <span className="checkout-secure-label">Secure checkout</span>
      </header>

      {order ? (
        <section className="checkout-success" aria-live="polite">
          <span className="checkout-success-mark" aria-hidden="true">
            ✓
          </span>
          <p className="checkout-eyebrow">Test order recorded</p>
          <h1>Thanks, {form.firstName}.</h1>
          <p>Your order was saved successfully. No payment was taken.</p>
          <dl>
            <div>
              <dt>Order number</dt>
              <dd>{order.orderId}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{currency.format(order.total)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>Test order</dd>
            </div>
          </dl>
          <button type="button" onClick={() => onBack(true)}>
            Continue shopping
          </button>
        </section>
      ) : (
        <form className="checkout-layout" onSubmit={handleSubmit}>
          <main className="checkout-form-column">
            <section className="checkout-section">
              <div className="checkout-section-heading">
                <h1>Contact</h1>
                {!user && <span>Guest checkout</span>}
              </div>
              <label className="checkout-field">
                <span>Email address</span>
                <input
                  autoComplete="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  required
                />
              </label>
            </section>

            <section className="checkout-section">
              <h2>Delivery</h2>
              <label className="checkout-field">
                <span>Country or region</span>
                <select
                  value={form.country}
                  onChange={(event) =>
                    updateField("country", event.target.value)
                  }
                >
                  <option>Canada</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                </select>
              </label>
              <div className="checkout-field-row">
                <label className="checkout-field">
                  <span>First name</span>
                  <input
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={(event) =>
                      updateField("firstName", event.target.value)
                    }
                    required
                  />
                </label>
                <label className="checkout-field">
                  <span>Last name</span>
                  <input
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={(event) =>
                      updateField("lastName", event.target.value)
                    }
                    required
                  />
                </label>
              </div>
              <label className="checkout-field">
                <span>Address</span>
                <input
                  autoComplete="address-line1"
                  value={form.address1}
                  onChange={(event) =>
                    updateField("address1", event.target.value)
                  }
                  required
                />
              </label>
              <label className="checkout-field">
                <span>Apartment, suite, etc. (optional)</span>
                <input
                  autoComplete="address-line2"
                  value={form.address2}
                  onChange={(event) =>
                    updateField("address2", event.target.value)
                  }
                />
              </label>
              <div className="checkout-field-row checkout-city-row">
                <label className="checkout-field">
                  <span>City</span>
                  <input
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(event) =>
                      updateField("city", event.target.value)
                    }
                    required
                  />
                </label>
                <label className="checkout-field">
                  <span>Province / state</span>
                  <input
                    autoComplete="address-level1"
                    value={form.region}
                    onChange={(event) =>
                      updateField("region", event.target.value)
                    }
                    required
                  />
                </label>
                <label className="checkout-field">
                  <span>Postal code</span>
                  <input
                    autoComplete="postal-code"
                    value={form.postalCode}
                    onChange={(event) =>
                      updateField("postalCode", event.target.value)
                    }
                    required
                  />
                </label>
              </div>
              <label className="checkout-field">
                <span>Phone (optional)</span>
                <input
                  autoComplete="tel"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                />
              </label>
            </section>

            <section className="checkout-section checkout-shipping-section">
              <h2>Shipping method</h2>
              <div className="checkout-shipping-option">
                <span>Standard shipping</span>
                <strong>Test checkout</strong>
              </div>
            </section>

            <section className="checkout-section checkout-payment-section">
              <h2>Payment</h2>
              <p>
                Test mode is on. No card details are collected and no payment is
                processed.
              </p>
              <div className="checkout-test-badge">Test order · No charge</div>
            </section>

            {error && (
              <div className="checkout-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="checkout-pay-button"
              type="submit"
              disabled={submitting || cart.length === 0}
            >
              {submitting ? "Saving order…" : "Pay now"}
            </button>
            <p className="checkout-no-charge-note">
              Pay now records a test order only.
            </p>
          </main>

          <aside className="checkout-order-summary" aria-label="Order summary">
            <div className="checkout-summary-items">
              {cart.map((item) => (
                <article
                  className="checkout-summary-item"
                  key={item.product.id}
                >
                  <div className="checkout-summary-image">
                    {getCoverImageUrl(item.product.frontCover) ? (
                      <img
                        src={getCoverImageUrl(item.product.frontCover)}
                        alt=""
                      />
                    ) : (
                      <span aria-hidden="true">Film</span>
                    )}
                    <span className="checkout-summary-quantity">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="checkout-summary-title">
                    {item.product.title}
                  </div>
                  <strong>
                    {currency.format(
                      Number(item.product.price || 14.99) * item.quantity,
                    )}
                  </strong>
                </article>
              ))}
            </div>
            <div className="checkout-summary-totals">
              <div>
                <span>
                  Subtotal ·{" "}
                  {cart.reduce((count, item) => count + item.quantity, 0)} items
                </span>
                <strong>{currency.format(subtotal)}</strong>
              </div>
              {discountCode && (
                <div>
                  <span>Discount · {discountCode}</span>
                  <strong>−{currency.format(previewDiscount)}</strong>
                </div>
              )}
              <div>
                <span>Shipping</span>
                <strong>Test checkout</strong>
              </div>
              <div className="checkout-total-row">
                <span>Total</span>
                <strong>{currency.format(subtotal - previewDiscount)}</strong>
              </div>
            </div>
          </aside>
        </form>
      )}
    </div>
  );
}
