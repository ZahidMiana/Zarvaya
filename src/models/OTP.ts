import { model, models, Schema, type HydratedDocument, type Model } from "mongoose";

export interface IOTPModelShape {
  phone: string;
  otp: string;
  purpose: "login" | "verify" | "reset";
  attempts: number;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type OTPDocument = HydratedDocument<IOTPModelShape>;
export type OTPModel = Model<IOTPModelShape>;

const OTPSchema = new Schema<IOTPModelShape, OTPModel>(
  {
    phone: { type: String, required: true, trim: true, index: true },
    otp: { type: String, required: true, select: false },
    purpose: { type: String, enum: ["login", "verify", "reset"], required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OTPSchema.index({ phone: 1, purpose: 1 });

const OTP = (models.OTP as OTPModel) || model<IOTPModelShape, OTPModel>("OTP", OTPSchema);

export default OTP;
