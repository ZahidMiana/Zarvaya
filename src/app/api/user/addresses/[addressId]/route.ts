import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const addressPatchSchema = z.object({
  label: z.string().trim().min(2).optional(),
  street: z.string().trim().optional(),
  area: z.string().trim().optional(),
  city: z.string().trim().min(2).optional(),
  province: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  isDefault: z.boolean().optional(),
});

type Context = {
  params: {
    addressId: string;
  };
};

export async function PATCH(request: Request, context: Context) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = addressPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid address payload",
          errors: parsed.error.issues.map((issue) => issue.message),
        },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).exec();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const target = user.savedAddresses.find((address) => String(address._id) === context.params.addressId);
    if (!target) {
      return NextResponse.json({ success: false, message: "Address not found" }, { status: 404 });
    }

    if (parsed.data.isDefault) {
      user.savedAddresses = user.savedAddresses.map((address) => ({
        ...address,
        isDefault: false,
      }));
    }

    if (parsed.data.label !== undefined) target.label = parsed.data.label;
    if (parsed.data.street !== undefined) target.street = parsed.data.street;
    if (parsed.data.area !== undefined) target.area = parsed.data.area;
    if (parsed.data.city !== undefined) target.city = parsed.data.city;
    if (parsed.data.province !== undefined) target.province = parsed.data.province;
    if (parsed.data.postalCode !== undefined) target.postalCode = parsed.data.postalCode;
    if (parsed.data.isDefault !== undefined) target.isDefault = parsed.data.isDefault;

    await user.save();

    return NextResponse.json({ success: true, message: "Address updated", data: user.savedAddresses });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update address",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: Context) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).exec();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    user.savedAddresses = user.savedAddresses.filter((address) => String(address._id) !== context.params.addressId);
    await user.save();

    return NextResponse.json({ success: true, message: "Address deleted", data: user.savedAddresses });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete address",
      },
      { status: 500 },
    );
  }
}
