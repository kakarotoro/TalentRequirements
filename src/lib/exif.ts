import exifr from "exifr";

export interface ExifPhotoMetadata {
  takenAt?: Date;
  latitude?: number;
  longitude?: number;
  make?: string;
  model?: string;
}

export async function parsePhotoExif(
  buffer: Buffer
): Promise<ExifPhotoMetadata> {
  try {
    const data = await exifr.parse(buffer, {
      tiff: true,
      exif: true,
      gps: true,
    });

    if (!data) return {};

    const takenAt = data.DateTimeOriginal || data.CreateDate || data.ModifyDate;

    return {
      takenAt: takenAt instanceof Date ? takenAt : takenAt ? new Date(takenAt) : undefined,
      latitude: data.latitude,
      longitude: data.longitude,
      make: data.Make,
      model: data.Model,
    };
  } catch (error) {
    console.warn("Could not read EXIF data:", error);
    return {};
  }
}
