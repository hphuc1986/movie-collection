import { useEffect, useState } from "react";
import { getOrderHistory, type OrderHistoryEntry } from "../services/api";
import "./OrderHistory.css";

interface OrderHistoryProps {
  accessToken: string;
  onBack: () => void;
}

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export function OrderHistory({ accessToken, onBack }: OrderHistoryProps) {
  const [orders, setOrders] = useState<OrderHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await getOrderHistory(accessToken));
    } catch (requestError: any) {
      const status = requestError.response?.status;
      const responseData = requestError.response?.data;
      const serverMessage =
        typeof responseData === "string"
          ? undefined
          : responseData?.message || responseData?.error;
      setError(
        status === 404
          ? "Order history is not deployed yet. Deploy the updated backend Worker, then try again."
          : serverMessage ||
              "Could not load your order history. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, [accessToken]);

  return (
    <main className="order-history">
      <div className="order-history-heading">
        <div>
          <p className="order-history-eyebrow">Your account</p>
          <h2>Order history</h2>
        </div>
        <button className="order-history-back" type="button" onClick={onBack}>
          Back to store
        </button>
      </div>

      {loading ? (
        <p className="order-history-message" role="status">
          Loading your orders…
        </p>
      ) : error ? (
        <div className="order-history-message order-history-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => void loadOrders()}>
            Try again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="order-history-empty">
          <h3>No orders yet</h3>
          <p>Your completed test orders will appear here.</p>
          <button type="button" onClick={onBack}>
            Browse movies
          </button>
        </div>
      ) : (
        <div className="order-history-list">
          {orders.map((order) => (
            <article className="order-history-entry" key={order.Id}>
              <header className="order-history-entry-header">
                <div>
                  <span>Order placed</span>
                  <strong>{formatDate(order.CreatedAt)}</strong>
                </div>
                <div>
                  <span>Order number</span>
                  <strong className="order-history-id">{order.Id}</strong>
                </div>
                <div className="order-history-total-block">
                  <span>Total</span>
                  <strong>{currency.format(Number(order.Total))}</strong>
                </div>
              </header>

              <div className="order-history-status-row">
                <span className="order-history-status">
                  {order.OrderStatus}
                </span>
                <span className="order-history-payment">
                  Payment: {order.PaymentStatus}
                </span>
                {order.DiscountCode && (
                  <span className="order-history-payment">
                    Promo: {order.DiscountCode}
                  </span>
                )}
              </div>

              <ul className="order-history-items">
                {order.OrderItems.map((item) => (
                  <li key={item.Id}>
                    <span>{item.ProductTitle}</span>
                    <span>
                      {item.Quantity} ×{" "}
                      {currency.format(Number(item.UnitPrice))}
                    </span>
                    <strong>{currency.format(Number(item.LineTotal))}</strong>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
