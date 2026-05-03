export const getReorderSuggestion = (product, demandData) => {
  const shouldReorder = product.stock <= product.lowStockLimit || demandData.level === "High";
  const historicalVelocity = Math.max(
    Number(demandData.averageSoldQuantity || 0),
    Number(product.totalSold || 0) / 12,
    demandData.level === "High" ? 2 : demandData.level === "Medium" ? 1 : 0
  );

  const demandMultiplier =
    demandData.level === "High" ? 3 :
      demandData.level === "Medium" ? 2 : 1;

  const targetStock = Math.ceil(product.lowStockLimit + historicalVelocity * demandMultiplier);
  const minimumTopUp = product.stock <= product.lowStockLimit ? product.lowStockLimit + 1 - product.stock : 0;
  const recommendedReorderQty = shouldReorder
    ? Math.max(minimumTopUp, Math.ceil(targetStock - product.stock), 1)
    : 0;

  return {
    shouldReorder,
    recommendedReorderQty,
    reason:
      product.stock <= product.lowStockLimit
        ? "Stock is below the low-stock threshold."
        : demandData.level === "High"
          ? "Demand prediction is high."
          : "Stock level is healthy."
  };
};
