const COMMISSION_RATE = 0.1;

function createVendorPayouts(items) {
  const byVendor = new Map();

  items.forEach((item) => {
    const current = byVendor.get(item.vendorId) || {
      vendorId: item.vendorId,
      vendor: item.vendor,
      grossSales: 0,
      commissionRate: COMMISSION_RATE,
      commission: 0,
      netEarnings: 0,
      status: 'Pending',
      paidAt: null,
    };

    current.grossSales += item.subtotal;
    byVendor.set(item.vendorId, current);
  });

  return [...byVendor.values()].map((payout) => ({
    ...payout,
    commission: payout.grossSales * payout.commissionRate,
    netEarnings: payout.grossSales * (1 - payout.commissionRate),
  }));
}

function isOrderPayable(order) {
  return order.status !== 'Cancelled' && order.payment?.status === 'Paid';
}

function getVendorPayoutRecords(order, vendorId) {
  return (order.vendorPayouts || []).filter((payout) => payout.vendorId === vendorId);
}

function getVendorSummary(orders, vendorId) {
  const payouts = orders
    .filter((order) => isOrderPayable(order))
    .flatMap((order) =>
      getVendorPayoutRecords(order, vendorId).map((payout) => ({
        ...payout,
        orderId: order.orderId,
      })),
    );

  return {
    vendorId,
    commissionRate: COMMISSION_RATE,
    grossSales: payouts.reduce((total, payout) => total + payout.grossSales, 0),
    commission: payouts.reduce((total, payout) => total + payout.commission, 0),
    netEarnings: payouts.reduce((total, payout) => total + payout.netEarnings, 0),
    pendingPayout: payouts
      .filter((payout) => payout.status === 'Pending')
      .reduce((total, payout) => total + payout.netEarnings, 0),
    paidPayout: payouts
      .filter((payout) => payout.status === 'Paid')
      .reduce((total, payout) => total + payout.netEarnings, 0),
    payouts,
  };
}

export {
  COMMISSION_RATE,
  createVendorPayouts,
  getVendorPayoutRecords,
  getVendorSummary,
  isOrderPayable,
};
