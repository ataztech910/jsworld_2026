import { memo, useCallback, useState } from 'react';
import { generateMockOrders, type Order, type OrderStatus } from '../data/mockOrders';
import { measureAction, measureAsyncAction } from '../measurement/api';
import { MetricsPanel } from '../measurement/MetricsPanel';
import {
  useMeasuredComputation,
  useRenderMeasurement,
} from '../measurement/hooks';
import { OrderRow } from './OrderRow';

// AST fix applied: stable handlers via useCallback + React.memo on rows
const MemoOrderRow = memo(OrderRow);

type SortField = 'createdAt' | 'customerName' | 'total' | 'priority' | 'score';
type SortDirection = 'asc' | 'desc';

interface ScoredOrder {
  order: Order;
  total: number;
  score: number;
}

function calculateExpensiveScore(order: Order) {
  let score = 0;

  for (let i = 0; i < 240; i += 1) {
    const weight = (i % 7) + 1;
    const wave = Math.sin((order.quantity + i) / 3) + Math.cos((order.priority + i) / 5);
    const volatility = Math.sqrt(order.unitPrice * weight) * (1 - order.discountRate);
    score += wave * volatility;
  }

  score += order.status === 'cancelled' ? -400 : 100;
  score += order.region.length * 7;
  return score;
}

export function OrdersDashboardFixed() {
  useRenderMeasurement('OrdersDashboard');
  const measureComputation = useMeasuredComputation();

  const [orders, setOrders] = useState<Order[]>(() => generateMockOrders(600));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncRuns, setSyncRuns] = useState(0);

  // AST fix: stable handlers — functional state updates, no stale closure deps
  const handleSelectOrder = useCallback((orderId: string) => {
    measureAction('actions.toggleOrderSelection', () => {
      setSelectedOrderIds(prev =>
        prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
      );
    }, { kind: 'user', orderId });
  }, []);

  const handleBumpPriority = useCallback((orderId: string) => {
    measureAction('actions.bumpOrderPriority', () => {
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, priority: Math.min(order.priority + 1, 5) } : order
        )
      );
    }, { kind: 'user', orderId });
  }, []);

  console.log('OrdersDashboardFixed render');

  const scoredOrders: ScoredOrder[] = measureComputation('orders.mapScoredOrders', () =>
    orders.map((order) => {
      const total = order.quantity * order.unitPrice * (1 - order.discountRate);
      const score = measureComputation('orders.calculateExpensiveScore', () =>
        calculateExpensiveScore(order)
      );
      return { order, total, score };
    })
  );

  const filteredOrders = measureComputation('orders.filterBySearchAndStatus', () =>
    scoredOrders.filter((entry) => {
      const customerMatches = entry.order.customerName
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());
      const statusMatches = statusFilter === 'all' || entry.order.status === statusFilter;
      return customerMatches && statusMatches;
    })
  );

  const sortedOrders = measureComputation('orders.sortFilteredOrders', () => {
    const nextOrders = [...filteredOrders];

    nextOrders.sort((a, b) => {
      let diff = 0;

      if (sortField === 'customerName') {
        diff = a.order.customerName.localeCompare(b.order.customerName);
      } else if (sortField === 'createdAt') {
        diff = new Date(a.order.createdAt).getTime() - new Date(b.order.createdAt).getTime();
      } else if (sortField === 'priority') {
        diff = a.order.priority - b.order.priority;
      } else if (sortField === 'score') {
        diff = a.score - b.score;
      } else {
        diff = a.total - b.total;
      }

      return sortDirection === 'asc' ? diff : -diff;
    });

    return nextOrders;
  });

  const totalNet = measureComputation('summary.totalNet', () =>
    sortedOrders.reduce((sum, entry) => sum + entry.total, 0)
  );

  const totalQuantity = measureComputation('summary.totalQuantity', () =>
    sortedOrders.reduce((sum, entry) => sum + entry.order.quantity, 0)
  );

  const groupedByStatus = measureComputation('summary.groupedByStatus', () =>
    sortedOrders.reduce(
      (acc, entry) => {
        const key = entry.order.status;
        acc[key].count += 1;
        acc[key].total += entry.total;
        return acc;
      },
      {
        pending: { count: 0, total: 0 },
        processing: { count: 0, total: 0 },
        shipped: { count: 0, total: 0 },
        cancelled: { count: 0, total: 0 },
      }
    )
  );

  const expensiveCombinedScore = measureComputation('summary.expensiveCombinedScore', () =>
    sortedOrders.reduce((sum, entry) => sum + entry.score, 0)
  );

  return (
    <section className="dashboard">
      <div className="toolbar">
        <label>
          Search customer
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Type customer name"
          />
        </label>

        <label>
          Status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | OrderStatus)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <label>
          Sort by
          <select value={sortField} onChange={(event) => setSortField(event.target.value as SortField)}>
            <option value="createdAt">Created Date</option>
            <option value="customerName">Customer</option>
            <option value="total">Total</option>
            <option value="priority">Priority</option>
            <option value="score">Expensive Score</option>
          </select>
        </label>

        <label>
          Direction
          <select
            value={sortDirection}
            onChange={(event) => setSortDirection(event.target.value as SortDirection)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>

        <button
          style={{ color: 'black' }}
          onClick={async () => {
            setIsSyncing(true);
            const start = Date.now();
            try {
              await new Promise((resolve) => setTimeout(resolve, 1100));
              setOrders(prev =>
                prev.map((order, index) =>
                  index % 17 === 0
                    ? { ...order, status: order.status === 'pending' ? 'processing' : order.status }
                    : order
                )
              );
              setSyncRuns(prev => prev + 1);
            } finally {
              setIsSyncing(false);
              measureAsyncAction('actions.fakeAsyncSync', async () => {}, {
                kind: 'async', durationMs: Date.now() - start,
              });
            }
          }}
          disabled={isSyncing}
        >
          {isSyncing ? 'Syncing...' : 'Run Fake Async Sync'}
        </button>
      </div>

      <MetricsPanel />

      <div className="metrics-grid">
        <article>
          <h2>Derived Summary</h2>
          <p>Visible orders: {sortedOrders.length}</p>
          <p>Selected orders: {selectedOrderIds.length}</p>
          <p>Sync runs: {syncRuns}</p>
          <p>Total quantity: {totalQuantity}</p>
          <p>Total net: ${totalNet.toFixed(2)}</p>
          <p>Combined expensive score: {expensiveCombinedScore.toFixed(2)}</p>
        </article>

        <article>
          <h2>Grouped by Status</h2>
          <p>
            Pending: {groupedByStatus.pending.count} (${groupedByStatus.pending.total.toFixed(2)})
          </p>
          <p>
            Processing: {groupedByStatus.processing.count} (${groupedByStatus.processing.total.toFixed(2)})
          </p>
          <p>
            Shipped: {groupedByStatus.shipped.count} (${groupedByStatus.shipped.total.toFixed(2)})
          </p>
          <p>
            Cancelled: {groupedByStatus.cancelled.count} (${groupedByStatus.cancelled.total.toFixed(2)})
          </p>
        </article>
      </div>

      <section className="orders-list">
        {sortedOrders.map((entry) => (
          <MemoOrderRow
            key={entry.order.id}
            order={entry.order}
            score={entry.score}
            isSelected={selectedOrderIds.includes(entry.order.id)}
            onSelect={() => handleSelectOrder(entry.order.id)}
            onBumpPriority={() => handleBumpPriority(entry.order.id)}
          />
        ))}
      </section>
    </section>
  );
}
