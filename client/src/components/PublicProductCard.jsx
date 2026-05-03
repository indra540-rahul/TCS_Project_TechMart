import { ShoppingCart, Star } from "lucide-react";

const PublicProductCard = ({ product, badge, onAddToCart }) => {
  const rating = Math.min(5, Math.max(4.1, 4 + (product.totalSold || 0) / 200)).toFixed(1);

  return (
    <article className="glass-card group overflow-hidden rounded-[1.7rem] border border-white/70 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_40px_rgba(15,23,42,0.12)]">
      <div className="relative overflow-hidden">
        {badge && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-[linear-gradient(90deg,#1d4ed8_0%,#2563eb_100%)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
            {badge}
          </span>
        )}
        <img src={product.image} alt={product.name} className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">{product.category?.name || product.sector}</p>
          <h3 className="mt-2 text-lg font-bold text-slate-950">{product.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{product.description}</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-black tracking-tight text-slate-950">Rs. {Number(product.price || 0).toLocaleString()}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {rating} ({product.totalSold || 0} sold)
            </p>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(115deg,#18CAFF,#00A7FF)] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <ShoppingCart size={16} />
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
};

export default PublicProductCard;
