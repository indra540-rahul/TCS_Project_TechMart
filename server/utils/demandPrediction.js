const classifyDemand = (score) => {
  if (score >= 40) return "High";
  if (score >= 15) return "Medium";
  return "Low";
};

export const predictDemand = (product, relatedOrders = []) => {
  const historicalQuantity = relatedOrders.reduce((sum, order) => {
    const item = order.items.find((entry) => String(entry.product) === String(product._id));
    return sum + (item?.quantity || 0);
  }, 0);

  const averageSoldQuantity = relatedOrders.length ? historicalQuantity / relatedOrders.length : 0;
  const score = product.totalSold * 0.6 + averageSoldQuantity * 4;

  return {
    level: classifyDemand(score),
    score: Number(score.toFixed(2)),
    averageSoldQuantity: Number(averageSoldQuantity.toFixed(2))
  };
};
