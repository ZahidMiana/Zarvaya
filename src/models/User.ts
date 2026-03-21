import { model, models, Schema, type HydratedDocument, type Model, type Types } from "mongoose";

export interface IUserModelShape {
  email: string;
  name: string;
  passwordHash: string;
  role: "admin" | "customer";
  phone?: string;
  wishlist: Types.ObjectId[];
  orderHistory: Types.ObjectId[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUserModelShape>;
export type UserModel = Model<IUserModelShape>;

const UserSchema = new Schema<IUserModelShape, UserModel>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "customer"], default: "customer", index: true },
    phone: { type: String, trim: true },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    orderHistory: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    isActive: { type: Boolean, default: true, index: true },
    lastLogin: { type: Date },
  },
  { timestamps: true },
);

UserSchema.index({ role: 1, isActive: 1 });

const User = (models.User as UserModel) || model<IUserModelShape, UserModel>("User", UserSchema);

export default User;
