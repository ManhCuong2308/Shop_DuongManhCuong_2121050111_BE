import Order from "../models/Order.js";
import { v4 as uuidv4 } from "uuid";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: "No order items" });
      return;
    }

    const order = new Order({
      // user: req.user._id,
      orderId: uuidv4(),
      user: "684d2267fd52435d7587d730",
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      order.status = status; // Cập nhật trạng thái đơn hàng
      order.updatedAt = Date.now(); // Cập nhật thời gian sửa đổi
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.orderId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "id name");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tính doanh thu tuần và chi tiết khách hàng
// @route   GET /api/orders/revenue/week
// @access  Private/Admin
export const getRevenueWeek = async (req, res) => {
  try {
    // 1) Tính startOfWeek và reset về 00:00
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // lùi về Chủ nhật tuần này
    startOfWeek.setHours(0, 0, 0, 0); // về đầu ngày

    console.log("Start of week:", startOfWeek);

    // 2) Query các đơn từ startOfWeek trở đi
    const weeklyOrders = await Order.find({
      createdAt: { $gte: startOfWeek },
    }).populate("user", "name email address");

    console.log(`Found ${weeklyOrders.length} orders this week`);

    const weeklyRevenue = weeklyOrders.reduce(
      (acc, order) => acc + order.totalPrice,
      0
    );
    const totalOrders = weeklyOrders.length;
    const uniqueCustomers = new Set(
      weeklyOrders.map((o) => o.user._id.toString())
    ).size;
    const averageOrderValue = totalOrders
      ? (weeklyRevenue / totalOrders).toFixed(2)
      : 0;

    const customerDetails = weeklyOrders.map((o) => ({
      customer: o.user,
      orderId: o._id,
      totalPrice: o.totalPrice,
      createdAt: o.createdAt,
    }));

    return res.json({
      weeklyRevenue,
      totalOrders,
      uniqueCustomers,
      averageOrderValue,
      customerDetails,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Tính doanh thu tháng và chi tiết khách hàng
// @route   GET /api/orders/revenue/month
// @access  Private/Admin
export const getRevenueMonth = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1); // Bắt đầu tháng

    const monthlyOrders = await Order.find({
      createdAt: { $gte: startOfMonth },
    }).populate("user", "name email"); // Lấy thông tin khách hàng (name, email)

    const monthlyRevenue = monthlyOrders.reduce(
      (acc, order) => acc + order.totalPrice,
      0
    );
    const totalOrders = monthlyOrders.length;
    const uniqueCustomers = new Set(
      monthlyOrders.map((order) => order.user._id)
    ).size;
    const averageOrderValue =
      totalOrders > 0 ? (monthlyRevenue / totalOrders).toFixed(2) : 0;

    // Lấy danh sách khách hàng đã mua hàng trong tháng
    const customerDetails = monthlyOrders.map((order) => ({
      customer: order.user,
      orderId: order._id,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
    }));

    res.json({
      monthlyRevenue,
      totalOrders,
      uniqueCustomers,
      averageOrderValue,
      customerDetails, // Danh sách chi tiết khách hàng
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy tất cả đơn hàng của khách hàng
// @route   GET /api/orders/customer/:customerId
// @access  Private/Admin
export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.params.customerId;

    const orders = await Order.find({ user: customerId });

    if (orders.length > 0) {
      res.json(orders);
    } else {
      res
        .status(404)
        .json({ message: "Không tìm thấy đơn hàng của khách hàng này" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tính doanh thu 7 ngày qua
// @route   GET /api/orders/revenue/7days
// @access  Private/Admin
export const getRevenue7Days = async (req, res) => {
  try {
    const today = new Date();
    const last7Days = [];

    // Tạo danh sách 7 ngày qua
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      last7Days.push(date.toISOString().split("T")[0]); // Lấy ngày dạng YYYY-MM-DD
    }

    const revenueData = await Promise.all(
      last7Days.map(async (date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0); // Bắt đầu ngày
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999); // Kết thúc ngày

        const orders = await Order.find({
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        });

        const dailyRevenue = orders.reduce(
          (acc, order) => acc + order.totalPrice,
          0
        );

        return {
          date,
          revenue: dailyRevenue,
        };
      })
    );

    res.json(revenueData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
