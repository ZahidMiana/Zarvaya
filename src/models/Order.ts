import {
  model,
  models,
  Schema,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";
import Counter from "@/models/Counter";
import Product from "@/models/Product";
import { Courier, OrderProvince, OrderStatus, PaymentMethod } from "@/types";

interface IOrderCustomer {
  name: string;
  email?: string;
  phone: string;
  whatsapp?: string;
}

interface IShippingAddress {
  street?: string;
  area?: string;
  city: string;
  province: OrderProvince;
  postalCode?: string;
}

interface IOrderItem {
  product: Types.ObjectId;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  discountPrice?: number;
}

interface IOrderStatusHistory {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

export interface IOrderModelShape {
  orderNumber: string;
  customer: IOrderCustomer;
  shippingAddress: IShippingAddress;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: OrderStatus;
  trackingNumber?: string;
  courier?: Courier;
  notes?: string;
  adminNotes?: string;
  statusHistory: IOrderStatusHistory[];
  isWhatsAppNotified: boolean;
  isEmailNotified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderDocument = HydratedDocument<IOrderModelShape>;
export type OrderModel = Model<IOrderModelShape>;

const pakistanPhoneRegex = /^03\d{9}$/;

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true, trim: true, maxlength: 200 },
    productImage: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    discountPrice: {
      type: Number,
      min: 0,
      validate: {
        validator(value: number | undefined) {
          if (value === undefined || value === null) {
            return true;
          }

          return value <= (this as { price: number }).price;
        },
        message: "Item discount price cannot exceed item price.",
      },
    },
  },
  { _id: false },
);

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    status: { type: String, enum: Object.values(OrderStatus), required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true, maxlength: 300 },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrderModelShape, OrderModel>(
  {
    orderNumber: { type: String, unique: true, index: true },
    customer: {
      name: { type: String, required: true, trim: true, maxlength: 120 },
      email: { type: String, trim: true, lowercase: true },
      phone: {
        type: String,
        required: true,
        trim: true,
        validate: {
          validator(value: string) {
            return pakistanPhoneRegex.test(value);
          },
          message: "Phone number must be in format 03XXXXXXXXX.",
        },
      },
      whatsapp: { type: String, trim: true },
    },
    shippingAddress: {
      street: { type: String, trim: true, maxlength: 220 },
      area: { type: String, trim: true, maxlength: 220 },
      city: { type: String, required: true, trim: true, maxlength: 120 },
      province: {
        type: String,
        required: true,
        enum: Object.values(OrderProvince),
      },
      postalCode: { type: String, trim: true, maxlength: 25 },
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator(value: IOrderItem[]) {
          return value.length > 0;
        },
        message: "Order must include at least one item.",
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      required: true,
      enum: Object.values(PaymentMethod),
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PLACED,
      index: true,
    },
    trackingNumber: { type: String, trim: true, maxlength: 80 },
    courier: { type: String, enum: Object.values(Courier) },
    notes: { type: String, trim: true, maxlength: 500 },
    adminNotes: { type: String, trim: true, maxlength: 1200 },
    statusHistory: { type: [OrderStatusHistorySchema], default: [] },
    isWhatsAppNotified: { type: Boolean, default: false },
    isEmailNotified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ "customer.phone": 1 });
OrderSchema.index({ paymentStatus: 1, orderStatus: 1 });

async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const key = `order-${year}`;
  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
  ).lean();

  const sequence = String(counter.seq).padStart(5, "0");
  return `ZJ-${year}-${sequence}`;
}

OrderSchema.pre("save", async function orderPreSave(this: OrderDocument) {
  this.$locals.wasNew = this.isNew;

  if (!this.orderNumber) {
    this.orderNumber = await generateOrderNumber();
  }

  if (!this.subtotal || this.isModified("items")) {
    this.subtotal = this.items.reduce((total, item) => {
      const effectivePrice = item.discountPrice ?? item.price;
      return total + effectivePrice * item.quantity;
    }, 0);
  }

  if (this.isModified("subtotal") || this.shippingCost === undefined || this.shippingCost === null) {
    this.shippingCost = this.subtotal < 3000 ? 150 : 0;
  }

  this.total = this.subtotal + this.shippingCost;

  if (this.isNew) {
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date(),
      note: "Order placed",
    });
  } else if (this.isModified("orderStatus")) {
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date(),
      note: `Status updated to ${this.orderStatus}`,
    });
  }
});

OrderSchema.post("save", async function orderPostSave(this: OrderDocument) {
  if (this.$locals.skipSoldCountUpdate) {
    return;
  }

  if (!this.$locals.wasNew) {
    return;
  }

  if (this.orderStatus === OrderStatus.CANCELLED) {
    return;
  }

  const operations = this.items.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: {
        $inc: { soldCount: item.quantity },
      },
    },
  }));

  if (operations.length > 0) {
    await Product.bulkWrite(operations);
  }
});

const Order = (models.Order as OrderModel) || model<IOrderModelShape, OrderModel>("Order", OrderSchema);

export default Order;
