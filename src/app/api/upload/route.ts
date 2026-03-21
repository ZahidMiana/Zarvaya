import { NextRequest, NextResponse } from "next/server";
import type { UploadApiResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";
import { AuthHttpError, verifyAdmin } from "@/lib/admin-auth";
import type { ApiResponse } from "@/types";

export const runtime = "nodejs";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFiles = 5;
const maxFileSize = 5 * 1024 * 1024;

type UploadedImage = {
  url: string;
  publicId: string;
  width: number;
  height: number;
};

async function uploadBuffer(buffer: Buffer): Promise<UploadedImage> {
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "zarvaya-jewels/products",
        resource_type: "image",
        transformation: [
          {
            width: 1200,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, response) => {
        if (error || !response) {
          reject(error ?? new Error("Upload failed."));
          return;
        }

        resolve(response);
      },
    );

    uploadStream.end(buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

export async function POST(request: NextRequest) {
  try {
    verifyAdmin(request);

    const formData = await request.formData();
    const values = formData.getAll("files");
    const files = values.filter((value): value is File => value instanceof File);

    if (files.length === 0) {
      const single = formData.get("file");
      if (single instanceof File) {
        files.push(single);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No files provided.",
        } satisfies ApiResponse<null>,
        { status: 400 },
      );
    }

    if (files.length > maxFiles) {
      return NextResponse.json(
        {
          success: false,
          message: `Maximum ${maxFiles} files are allowed per request.`,
        } satisfies ApiResponse<null>,
        { status: 400 },
      );
    }

    for (const file of files) {
      if (!allowedMimeTypes.has(file.type)) {
        return NextResponse.json(
          {
            success: false,
            message: `Unsupported file type: ${file.type}. Use jpeg/png/webp only.`,
          } satisfies ApiResponse<null>,
          { status: 400 },
        );
      }

      if (file.size > maxFileSize) {
        return NextResponse.json(
          {
            success: false,
            message: `File ${file.name} exceeds 5MB size limit.`,
          } satisfies ApiResponse<null>,
          { status: 400 },
        );
      }
    }

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return uploadBuffer(Buffer.from(arrayBuffer));
      }),
    );

    return NextResponse.json({
      success: true,
      message: "Files uploaded successfully.",
      data: uploaded,
    } satisfies ApiResponse<UploadedImage[]>);
  } catch (error) {
    if (error instanceof AuthHttpError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        } satisfies ApiResponse<null>,
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to upload files.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    verifyAdmin(request);

    const body = (await request.json()) as { publicId?: string };

    if (!body.publicId) {
      return NextResponse.json(
        {
          success: false,
          message: "publicId is required.",
        } satisfies ApiResponse<null>,
        { status: 400 },
      );
    }

    await cloudinary.uploader.destroy(body.publicId);

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully.",
      data: { publicId: body.publicId },
    } satisfies ApiResponse<{ publicId: string }>);
  } catch (error) {
    if (error instanceof AuthHttpError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        } satisfies ApiResponse<null>,
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete image.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}
