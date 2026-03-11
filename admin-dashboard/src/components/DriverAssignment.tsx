import { Driver, Order } from "../types";

interface DriverAssignmentProps {
  order: Order;
  drivers: Driver[];
  onAssign: (driverId: string) => void;
}

export const DriverAssignment = ({ order, drivers, onAssign }: DriverAssignmentProps) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <h3 className="font-display text-xl text-ink-900">Assign Driver</h3>
    <p className="mt-1 text-sm text-slate-500">Order {order.orderNumber}</p>
    <div className="mt-4 grid gap-2">
      {drivers.map((driver) => (
        <button
          key={driver.id}
          type="button"
          onClick={() => onAssign(driver.id)}
          className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
            order.driver?.id === driver.id
              ? "border-mint-500 bg-mint-100 text-mint-700"
              : "border-slate-200 text-slate-700 hover:border-mint-500 hover:bg-mint-100/50"
          }`}
        >
          <span className="block font-semibold">{driver.name}</span>
          <span className="block text-xs">{driver.phone}</span>
        </button>
      ))}
    </div>
  </article>
);
