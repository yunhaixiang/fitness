(function (root) {
  'use strict';
  const cents = value => Math.round(Number(value) * 100);
  function calculateShoppingCosts(items, config) {
    const goods = items.reduce((sum, item) => sum + cents(item.weeklyCost || 0), 0);
    const taxableGoods = items.filter(item => config.taxable_price_ids.includes(String(item.id)))
      .reduce((sum, item) => sum + cents(item.weeklyCost || 0), 0);
    const orders = config.orders_per_week;
    const tip = cents(config.tip_per_order_cad) * orders;
    const delivery = cents(config.delivery_per_order_cad) * orders;
    const service = cents(config.service_per_order_cad) * orders;
    const tax = Math.round((taxableGoods + delivery + service) * config.hst_rate);
    return { goods, tip, delivery, service, tax, total: goods + tip + delivery + service + tax };
  }
  if (typeof module === 'object' && module.exports) module.exports = { calculateShoppingCosts };
  else root.fitnessShoppingCosts = { calculateShoppingCosts };
})(typeof window === 'undefined' ? globalThis : window);
