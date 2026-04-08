import { useRef } from 'react';
import type { Order } from '../data/mockOrders';
import { useRenderMeasurement } from '../measurement/hooks';

interface OrderRowProps {
  order: Order;
  score: number;
  isSelected: boolean;
  onSelect: () => void;
  onBumpPriority: () => void;
}

export function OrderRow({ order, score, isSelected, onSelect, onBumpPriority }: OrderRowProps) {
  useRenderMeasurement('OrderRow');
  const localRenderCount = useRef(0);
  localRenderCount.current += 1;

  const gross = order.quantity * order.unitPrice;
  const net = gross * (1 - order.discountRate);
  const marginGuess = net * 0.18 - order.priority * 8;

  return (
    <article className="order-row">
      <div className="order-row-main">
        <h3>{order.id}</h3>
        <p>
          {order.customerName} · {order.region} · {new Date(order.createdAt).toLocaleDateString()}
        </p>
        <p>
          Qty {order.quantity} · Unit ${order.unitPrice.toFixed(2)} · Net ${net.toFixed(2)}
        </p>
        <p>Status: {order.status}</p>
        <p>Score: {score.toFixed(2)}</p>
        <p>Margin guess: ${marginGuess.toFixed(2)}</p>
      </div>

      <div className="order-row-actions">
        <button onClick={onSelect}>{isSelected ? 'Unselect' : 'Select'}</button>
        <button onClick={onBumpPriority}>Increase Priority</button>
        <p>Row renders: {localRenderCount.current}</p>
      </div>
    </article>
  );
}
