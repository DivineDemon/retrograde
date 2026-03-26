import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const yenFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

export function formatMenuPriceYen(amountYen: number): string {
  return yenFormatter.format(amountYen);
}

type ImgbbUploadOptions = {
  imageBase64: string;
  apiKey?: string;
  expiration?: number;
};

type ImgbbUploadResponse = {
  data: {
    id: string;
    url: string;
    display_url: string;
    delete_url: string;
    title: string;
    expiration: string;
    width: string;
    height: string;
    size: string;
    time: string;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium?: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
  };
  success: boolean;
  status: number;
};

export async function uploadImageToImgbb({
  imageBase64,
  apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY,
  expiration = 600,
}: ImgbbUploadOptions): Promise<ImgbbUploadResponse> {
  if (!apiKey) {
    throw new Error(
      "Missing imgbb API key. Set NEXT_PUBLIC_IMGBB_API_KEY, or pass apiKey.",
    );
  }

  const searchParams = new URLSearchParams({
    expiration: String(expiration),
    key: apiKey,
  });

  const formData = new FormData();
  formData.append("image", imageBase64);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?${searchParams}`,
    {
      method: "POST",
      body: formData,
    },
  );

  const payload = (await response.json()) as ImgbbUploadResponse;

  if (!response.ok || !payload.success) {
    throw new Error(`imgbb upload failed (status ${response.status}).`);
  }

  return payload;
}
