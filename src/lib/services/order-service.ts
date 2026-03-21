import mongoose, { type Types } from "mongoose";
import { sendAdminWhatsApp, sendCustomerEmail, sendCustomerWhatsAppUpdate } from "@/lib/notifications";
import { getPrimaryImageUrl } from "@/lib/utils";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { OrderStatus, type IOrder, type IProduct } from "@/types";

export class ServiceError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

type CreateOrderInput = {
  customer: {
    name: string;
    phone: string;
    email?: string;
    whatsapp?: string;
  };
  shippingAddress: {
    street?: string;
    area?: string;
    city: string;
    province: string;
    postalCode?: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentMethod: "cod" | "easypaisa" | "jazzcash" | "bank-transfer";
  notes?: string;
};

type OrderAdminQuery = {
  status?: string;
  paymentStatus?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  search?: string;
};

function isTransactionUnsupportedError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return /Transaction numbers are only allowed on a replica set member or mongos/i.test(error.message);
}

type OrderItemEntity = {
  product: unknown;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  discountPrice?: number;
};

type OrderStatusHistoryEntity = {
  status: OrderStatus;
  timestamp: Date | string;
  note?: string;
};

type OrderEntity = {
  _id: unknown;
  orderNumber: string;
  customer: IOrder["customer"];
  shippingAddress: IOrder["shippingAddress"];
  items: OrderItemEntity[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: IOrder["paymentMethod"];
  paymentStatus: IOrder["paymentStatus"];
  orderStatus: IOrder["orderStatus"];
  trackingNumber?: string;
  courier?: IOrder["courier"];
  notes?: string;
  adminNotes?: string;
  statusHistory?: OrderStatusHistoryEntity[];
  isWhatsAppNotified: boolean;
  isEmailNotified: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

function toOrderPayload(order: OrderEntity): IOrder {
  return {
    ...(order as IOrder),
    _id: String(order._id),
    createdAt: new Date(order.createdAt).toISOString(),
    updatedAt: new Date(order.updatedAt).toISOString(),
    items: order.items.map((item) => ({
      ...item,
      product: String(item.product),
    })),
    statusHistory: (order.statusHistory ?? []).map((entry) => ({
      ...entry,
      timestamp: new Date(entry.timestamp).toISOString(),
    })),
  };
}

export async function createOrder(input: CreateOrderInput): Promise<IOrder> {
  const productIds = input.items.map((item) => item.productId);
  const objectIds: Types.ObjectId[] = [];

  for (const id of productIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ServiceError(400, `Invalid product id: ${id}`);
    }

    objectIds.push(new mongoose.Types.ObjectId(id));
  }

  const persistOrder = async (session?: mongoose.ClientSession): Promise<IOrder> => {
    const productsQuery = Product.find({
      _id: { $in: objectIds },
      isAvailable: true,
    });
    const products = session ? await productsQuery.session(session) : await productsQuery;

    if (products.length !== objectIds.length) {
      throw new ServiceError(400, "One or more products are unavailable.");
    }

    const productMap = new Map(products.map((product) => [String(product._id), product]));

    const orderItems = input.items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new ServiceError(400, `Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw new ServiceError(400, `Insufficient stock for ${product.name}.`);
      }

      return {
        product: product._id,
        productName: product.name,
        productImage: getPrimaryImageUrl(product as unknown as IProduct),
        quantity: item.quantity,
        price: product.price,
        discountPrice: product.discountPrice,
      };
    });

    const subtotal = orderItems.reduce((total, item) => {
      const effectivePrice = item.discountPrice ?? item.price;
      return total + effectivePrice * item.quantity;
    }, 0);

    const shippingCost = subtotal < 3000 ? 150 : 0;
    const total = subtotal + shippingCost;

    const order = new Order({
      customer: input.customer,
      shippingAddress: input.shippingAddress,
      items: orderItems,
      paymentMethod: input.paymentMethod,
      notes: input.notes,
      subtotal,
      shippingCost,
      total,
      orderStatus: OrderStatus.PLACED,
    });

    order.$locals.skipSoldCountUpdate = true;

    if (session) {
      await order.save({ session });
    } else {
      await order.save();
    }

    const stockOps = input.items.map((item) => ({
      updateOne: {
        filter: {
          _id: item.productId,
          stock: { $gte: item.quantity },
          isAvailable: true,
        },
        update: {
          $inc: {
            stock: -item.quantity,
            soldCount: item.quantity,
          },
        },
      },
    }));

    const stockResult = session
      ? await Product.bulkWrite(stockOps, { session })
      : await Product.bulkWrite(stockOps);

    if (stockResult.matchedCount !== input.items.length) {
      throw new ServiceError(409, "Stock changed during checkout. Please retry order.");
    }

    if (session) {
      await Product.updateMany(
        {
          _id: { $in: objectIds },
          stock: { $lte: 0 },
        },
        {
          $set: { isAvailable: false },
        },
        { session },
      );
    } else {
      await Product.updateMany(
        {
          _id: { $in: objectIds },
          stock: { $lte: 0 },
        },
        {
          $set: { isAvailable: false },
        },
      );
    }

    return toOrderPayload(order.toObject() as OrderEntity);
  };

  const finalize = async (payload: IOrder): Promise<IOrder> => {
    sendAdminWhatsApp(payload);
    sendCustomerWhatsAppUpdate(payload, `Your order status is now ${payload.orderStatus}.`);
    await sendCustomerEmail(payload);
    return payload;
  };

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payload = await persistOrder(session);
    await session.commitTransaction();
    return await finalize(payload);
  } catch (error) {
    await session.abortTransaction();

    if (isTransactionUnsupportedError(error)) {
      const payload = await persistOrder();
      return await finalize(payload);
    }

    if (error instanceof ServiceError) {
      throw error;
    }

    throw new ServiceError(500, error instanceof Error ? error.message : "Failed to create order.");
  } finally {
    session.endSession();
  }
}

export async function getOrderForTracking(orderNumber: string): Promise<Partial<IOrder> | null> {
  const order = await Order.findOne({ orderNumber })
    .select({
      orderNumber: 1,
      customer: 1,
      shippingAddress: 1,
      items: 1,
      total: 1,
      paymentMethod: 1,
      paymentStatus: 1,
      orderStatus: 1,
      trackingNumber: 1,
      courier: 1,
      statusHistory: 1,
      createdAt: 1,
      updatedAt: 1,
    })
    .lean();

  if (!order) {
    return null;
  }

  return toOrderPayload(order);
}

function buildAdminFilter(query: OrderAdminQuery): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  if (query.status) {
    filter.orderStatus = query.status;
  }

  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus;
  }

  if (query.city) {
    filter["shippingAddress.city"] = new RegExp(query.city, "i");
  }

  if (query.dateFrom || query.dateTo) {
    const dateFilter: Record<string, Date> = {};

    if (query.dateFrom) {
      const from = new Date(query.dateFrom);
      if (!Number.isNaN(from.getTime())) {
        dateFilter.$gte = from;
      }
    }

    if (query.dateTo) {
      const to = new Date(query.dateTo);
      if (!Number.isNaN(to.getTime())) {
        dateFilter.$lte = to;
      }
    }

    if (Object.keys(dateFilter).length > 0) {
      filter.createdAt = dateFilter;
    }
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filter.$or = [
      { orderNumber: searchRegex },
      { "customer.name": searchRegex },
      { "customer.phone": searchRegex },
    ];
  }

  return filter;
}

export async function getAdminOrders(query: OrderAdminQuery) {
  const rawPage = Number(query.page ?? 1);
  const rawLimit = Number(query.limit ?? 20);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, Math.floor(rawLimit)) : 20;
  const skip = (page - 1) * limit;
  const filter = buildAdminFilter(query);

  const [orders, total, statsRows] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
    Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [
                { $in: ["$orderStatus", ["placed", "confirmed", "processing", "packed", "shipped"]] },
                1,
                0,
              ],
            },
          },
          delivered: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0],
            },
          },
          revenue: {
            $sum: {
              $cond: [{ $ne: ["$orderStatus", "cancelled"] }, "$total", 0],
            },
          },
        },
      },
    ]),
  ]);

  const stats = statsRows[0] ?? {
    totalOrders: 0,
    pending: 0,
    delivered: 0,
    revenue: 0,
  };

  return {
    orders: orders.map((order) => toOrderPayload(order)),
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
    stats,
  };
}

export async function updateOrderStatus(
  orderNumber: string,
  payload: {
    status: string;
    note?: string;
    trackingNumber?: string;
    courier?: string;
  },
): Promise<IOrder> {
  const update: Record<string, unknown> = {
    orderStatus: payload.status,
  };

  if (payload.trackingNumber) {
    update.trackingNumber = payload.trackingNumber;
  }

  if (payload.courier) {
    update.courier = payload.courier;
  }

  const order = await Order.findOneAndUpdate(
    { orderNumber },
    {
      $set: update,
      $push: {
        statusHistory: {
          status: payload.status,
          timestamp: new Date(),
          note: payload.note,
        },
      },
    },
    { returnDocument: "after" },
  ).lean();

  if (!order) {
    throw new ServiceError(404, "Order not found.");
  }

  const result = toOrderPayload(order);

  sendCustomerWhatsAppUpdate(result, `Your order status is now ${result.orderStatus}.`);
  await sendCustomerEmail(result);

  return result;
}
