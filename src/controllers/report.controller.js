import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Bill from '../models/Bill.js';
import Product from '../models/Product.js';

// GET /api/v1/reports/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayBills = await Bill.find({ createdAt: { $gte: startOfDay } });
  const todaySales = todayBills.reduce((sum, b) => sum + b.grandTotal, 0);
  const totalBillsCount = await Bill.countDocuments();
  const lowStockProducts = await Product.find({ isActive: true }).then((products) =>
    products.filter((p) => p.stockQuantity <= p.lowStockThreshold)
  );
  const recentBills = await Bill.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('cashier', 'name');
  return res.status(200).json(
    new ApiResponse(200, {
      todaySalesCount: todayBills.length,
      todaySalesTotal: todaySales,
      totalBillsCount,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentBills
    }, 'Dashboard stats fetched')
  );
});

// GET /api/v1/reports/sales?from=&to=
const getSalesReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = {};
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }
  const report = await Bill.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalSales: { $sum: '$grandTotal' },
        billCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  return res.status(200).json(new ApiResponse(200, report, 'Sales report fetched'));
});

// GET /api/v1/reports/top-products?from=&to=&limit=10
const getTopProducts = asyncHandler(async (req, res) => {
  const { from, to, limit = 10 } = req.query;
  const match = {};
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }
  const topProducts = await Bill.aggregate([
    { $match: match },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        totalQuantitySold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.total' }
      }
    },
    { $sort: { totalQuantitySold: -1 } },
    { $limit: Number(limit) }
  ]);
  return res.status(200).json(new ApiResponse(200, topProducts, 'Top products fetched'));
});

export { getDashboardStats, getSalesReport, getTopProducts };