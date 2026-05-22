export const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  return String(value).trim().toLowerCase() === "true";
};

export const computeSalePrice = (price: number, salePercent: number, rawSalePrice?: number): number => {
  if (rawSalePrice && rawSalePrice > 0 && rawSalePrice < price) {
    return Number(rawSalePrice.toFixed(2));
  }

  if (salePercent > 0) {
    return Number((price - (price * salePercent) / 100).toFixed(2));
  }

  return Number(price.toFixed(2));
};

export const computeDiscountAmount = (price: number, salePrice: number): number =>
  Number(Math.max(price - salePrice, 0).toFixed(2));
