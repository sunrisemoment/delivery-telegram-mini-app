import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onRemove: (productId: string) => void;
  quantity: number;
}

export const ProductCard = ({ product, onAdd, onRemove, quantity }: ProductCardProps) => (
  <article className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-sm backdrop-blur">
    {product.imageUrl ? (
      <img src={product.imageUrl} alt={product.name} className="h-36 w-full object-cover" />
    ) : (
      <div className="h-36 w-full bg-gradient-to-r from-brand-100 to-peach-100" />
    )}
    <div className="space-y-3 p-4">
      <div>
        <h3 className="font-display text-lg text-slate-900">{product.name}</h3>
        {product.description ? <p className="mt-1 text-sm text-slate-600">{product.description}</p> : null}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-display text-base text-brand-900">${Number(product.price).toFixed(2)}</span>
        {quantity > 0 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRemove(product.id)}
              className="grid h-8 w-8 place-items-center rounded-full border border-brand-600 text-brand-700 transition hover:bg-brand-50"
            >
              -
            </button>
            <span className="min-w-6 text-center text-sm font-semibold text-slate-800">{quantity}</span>
            <button
              type="button"
              onClick={() => onAdd(product)}
              className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-900"
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900"
          >
            Add
          </button>
        )}
      </div>
    </div>
  </article>
);
