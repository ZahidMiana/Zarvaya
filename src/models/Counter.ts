import { model, models, Schema, type HydratedDocument, type Model } from "mongoose";

export interface ICounter {
  _id: string;
  seq: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CounterDocument = HydratedDocument<ICounter>;
export type CounterModel = Model<ICounter>;

const CounterSchema = new Schema<ICounter, CounterModel>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Counter = (models.Counter as CounterModel) || model<ICounter, CounterModel>("Counter", CounterSchema);

export default Counter;
