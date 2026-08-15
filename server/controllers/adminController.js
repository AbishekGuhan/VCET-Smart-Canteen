const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');
const Inventory = require('../models/Inventory');

// ---------------------------------------------------------------------------
// @desc    Get Admin Dashboard Statistics
// @route   GET /api/admin/dashboard
// @access  Private / Admin
// ---------------------------------------------------------------------------
const getAdminDashboardStats = async (req, res) => {
  try {
    // 1. Total Orders
    const totalOrdersPromise = Order.countDocuments();

    // 2. Today's Orders (from start of current local/server day)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayOrdersPromise = Order.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    // 3. Pending Orders
    const pendingOrdersPromise = Order.countDocuments({
      orderStatus: { $in: ['PLACED', 'CONFIRMED', 'PREPARING'] },
    });

    // 4. Completed Orders
    const completedOrdersPromise = Order.countDocuments({
      orderStatus: 'COMPLETED',
    });

    // 5. Total Sales (aggregate sum of totalAmount for non-cancelled orders)
    const totalSalesPromise = Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: 'CANCELLED' },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    // 6. Available Food Items count
    const availableFoodPromise = FoodItem.countDocuments({
      isAvailable: true,
    });

    // 7. Low-Stock Inventory Items (currentStock <= minThreshold)
    const lowStockItemsPromise = Inventory.countDocuments({
      $expr: { $lte: ['$currentStock', '$minThreshold'] },
    });

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      completedOrders,
      salesResult,
      availableFood,
      lowStockItems,
    ] = await Promise.all([
      totalOrdersPromise,
      todayOrdersPromise,
      pendingOrdersPromise,
      completedOrdersPromise,
      totalSalesPromise,
      availableFoodPromise,
      lowStockItemsPromise,
    ]);

    const totalSales = salesResult.length > 0 ? parseFloat(salesResult[0].total.toFixed(2)) : 0;

    return res.status(200).json({
      totalOrders,
      todayOrders,
      pendingOrders,
      completedOrders,
      totalSales,
      availableFood,
      lowStockItems,
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error.message);
    return res.status(500).json({
      message: 'Server error fetching admin dashboard statistics',
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------
// @desc    Get Detailed Sales Analytics & Reports
// @route   GET /api/admin/sales
// @access  Private / Admin
// ---------------------------------------------------------------------------
const getAdminSalesAnalytics = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Total sales & completed orders overall
    const overallStatsPromise = Order.aggregate([
      {
        $match: { orderStatus: { $ne: 'CANCELLED' } },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'COMPLETED'] }, 1, 0] },
          },
        },
      },
    ]);

    // 2. Today's sales & today's orders
    const todayStatsPromise = Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: 'CANCELLED' },
          createdAt: { $gte: startOfToday },
        },
      },
      {
        $group: {
          _id: null,
          todaySales: { $sum: '$totalAmount' },
          todayOrders: { $sum: 1 },
        },
      },
    ]);

    // 3. Most ordered food items (unwind items, group by food item name)
    const mostOrderedPromise = Order.aggregate([
      {
        $match: { orderStatus: { $ne: 'CANCELLED' } },
      },
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      {
        $sort: { totalQuantity: -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // 4. Sales by Date (grouped by YYYY-MM-DD for the last 14 days/records)
    const salesByDatePromise = Order.aggregate([
      {
        $match: { orderStatus: { $ne: 'CANCELLED' } },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 30,
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: 1,
          orderCount: 1,
        },
      },
    ]);

    const [overallStats, todayStats, mostOrdered, salesByDate] = await Promise.all([
      overallStatsPromise,
      todayStatsPromise,
      mostOrderedPromise,
      salesByDatePromise,
    ]);

    const totalSales = overallStats.length > 0 ? parseFloat(overallStats[0].totalSales.toFixed(2)) : 0;
    const totalOrders = overallStats.length > 0 ? overallStats[0].totalOrders : 0;
    const completedOrders = overallStats.length > 0 ? overallStats[0].completedOrders : 0;

    const todaySales = todayStats.length > 0 ? parseFloat(todayStats[0].todaySales.toFixed(2)) : 0;
    const todayOrders = todayStats.length > 0 ? todayStats[0].todayOrders : 0;

    return res.status(200).json({
      totalSales,
      todaySales,
      totalOrders,
      todayOrders,
      completedOrders,
      mostOrderedFood: mostOrdered,
      salesByDate,
    });
  } catch (error) {
    console.error('Admin sales analytics error:', error.message);
    return res.status(500).json({
      message: 'Server error fetching sales analytics',
      error: error.message,
    });
  }
};

module.exports = {
  getAdminDashboardStats,
  getAdminSalesAnalytics,
};
