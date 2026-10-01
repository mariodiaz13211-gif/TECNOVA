"use client";

import { useCart } from "./cart-context";

export function CartBadge() {
  const { totalCount } = useCart();
  if (totalCount === 0) return null;
  return (
    <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan px-1.5 text-xs font-medium text-ink">
      {totalCount}
    </span>
  );
}
