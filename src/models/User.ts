import bcrypt from "bcryptjs";
import { model, models, Schema, type HydratedDocument, type Model, type Types } from "mongoose";

export interface IUserAddress {
  _id?: Types.ObjectId;
  label: string;
  street?: string;
  area?: string;
  city: string;
  province?: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface IUserCartItem {
  product: Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

export interface IUserModelShape {
  passwordHash?: string;
  googleId?: string;
  phone?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  authProvider: "email" | "google" | "phone";

  name: string;
  email?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: "female" | "male" | "other" | "prefer-not-to-say";

  savedAddresses: IUserAddress[];

  wishlist: Types.ObjectId[];
  cart: IUserCartItem[];
  orderHistory: Types.ObjectId[];

  role: "admin" | "customer";
  isActive: boolean;
  lastLoginAt?: Date;
  lastLoginMethod?: "email" | "google" | "phone";

  resetToken?: string;
  resetTokenExpiry?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface UserMethods {
  comparePassword(plain: string): Promise<boolean>;
  getDefaultAddress(): IUserAddress | null;
}

export interface UserStatics {
  findByEmailOrPhone(identifier: string): Promise<UserDocument | null>;
}

export type UserDocument = HydratedDocument<IUserModelShape, UserMethods>;
export type UserModel = Model<IUserModelShape, UserStatics, UserMethods>;

const UserAddressSchema = new Schema<IUserAddress>(
  {
    label: { type: String, default: "Home", trim: true, maxlength: 40 },
    street: { type: String, trim: true, maxlength: 220 },
    area: { type: String, trim: true, maxlength: 220 },
    city: { type: String, required: true, trim: true, maxlength: 120 },
    province: { type: String, trim: true, maxlength: 80 },
    postalCode: { type: String, trim: true, maxlength: 25 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const UserCartItemSchema = new Schema<IUserCartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, min: 1, default: 1, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const UserSchema = new Schema<IUserModelShape, UserModel, UserMethods>(
  {
    passwordHash: { type: String, select: false },
    googleId: { type: String, trim: true },
    phone: { type: String, trim: true },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    authProvider: {
      type: String,
      enum: ["email", "google", "phone"],
      required: true,
      default: "email",
    },

    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, lowercase: true, trim: true },
    avatar: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ["female", "male", "other", "prefer-not-to-say"],
    },

    savedAddresses: { type: [UserAddressSchema], default: [] },

    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    cart: { type: [UserCartItemSchema], default: [] },
    orderHistory: [{ type: Schema.Types.ObjectId, ref: "Order" }],

    role: { type: String, enum: ["admin", "customer"], default: "customer", index: true },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date },
    lastLoginMethod: { type: String, enum: ["email", "google", "phone"] },

    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1, isActive: 1 });

UserSchema.methods.comparePassword = async function comparePassword(plain: string): Promise<boolean> {
  if (!this.passwordHash) {
    return false;
  }

  return bcrypt.compare(plain, this.passwordHash);
};

UserSchema.methods.getDefaultAddress = function getDefaultAddress(): IUserAddress | null {
  if (!this.savedAddresses || this.savedAddresses.length === 0) {
    return null;
  }

  return this.savedAddresses.find((address) => address.isDefault) ?? this.savedAddresses[0] ?? null;
};

UserSchema.statics.findByEmailOrPhone = function findByEmailOrPhone(identifier: string) {
  const value = identifier.trim();
  const lowered = value.toLowerCase();

  return this.findOne({
    $or: [
      { email: lowered },
      { phone: value.replace(/\s+/g, "") },
    ],
  });
};

const User = (models.User as UserModel) || model<IUserModelShape, UserModel>("User", UserSchema);

export default User;
