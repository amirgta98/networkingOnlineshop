export interface ProcessedImageResult {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  width: number;
  height: number;
  mimeType: string;
}

export interface ProcessedIconResult {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface CropOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface IImageProcessingService {
  processAndSaveProductImage(
    buffer: Buffer,
    originalName: string,
    cropOptions?: CropOptions,
  ): Promise<ProcessedImageResult>;

  processAndSaveFeatureIcon(
    buffer: Buffer,
    originalName: string,
    mimeType?: string,
  ): Promise<ProcessedIconResult>;

  processAndSaveCarrierIcon(
    buffer: Buffer,
    originalName: string,
    mimeType?: string,
  ): Promise<ProcessedIconResult>;

  deleteProductImage(filename: string): Promise<boolean>;

  deleteFeatureIcon(filename: string): Promise<boolean>;

  deleteCarrierIcon(filename: string): Promise<boolean>;
}
