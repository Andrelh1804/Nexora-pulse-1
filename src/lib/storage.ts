export type StorageBucket =
  | "avatars"
  | "campaign-assets"
  | "generated-images"
  | "creative-files"
  | "documents"
  | "exports"
  | "backups"
  | "site-assets";

export interface StorageFile {
  id: string;
  bucket: StorageBucket;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  tenantId: string;
  uploadedBy: string;
  uploadedAt: Date;
  metadata?: Record<string, string>;
  isPublic: boolean;
}

export interface UploadOptions {
  bucket: StorageBucket;
  filename: string;
  mimeType: string;
  tenantId: string;
  uploadedBy: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

class StorageService {
  private files: StorageFile[] = [];

  async upload(data: Blob | string, options: UploadOptions): Promise<StorageFile> {
    const size = typeof data === "string" ? new Blob([data]).size : data.size;
    const id = `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    let url: string;
    if (typeof data === "string" && data.startsWith("data:")) {
      url = data;
    } else if (data instanceof Blob) {
      url = URL.createObjectURL(data);
    } else {
      url = `https://storage.nexorapulse.io/${options.bucket}/${options.tenantId}/${id}/${options.filename}`;
    }

    const file: StorageFile = {
      id,
      bucket: options.bucket,
      filename: `${id}_${options.filename}`,
      originalName: options.filename,
      mimeType: options.mimeType,
      size,
      url,
      tenantId: options.tenantId,
      uploadedBy: options.uploadedBy,
      uploadedAt: new Date(),
      metadata: options.metadata,
      isPublic: options.isPublic ?? false,
    };

    this.files.push(file);
    return file;
  }

  async delete(fileId: string, tenantId: string): Promise<boolean> {
    const idx = this.files.findIndex((f) => f.id === fileId && f.tenantId === tenantId);
    if (idx === -1) return false;
    const file = this.files[idx];
    if (file.url.startsWith("blob:")) URL.revokeObjectURL(file.url);
    this.files.splice(idx, 1);
    return true;
  }

  getFiles(tenantId: string, bucket?: StorageBucket): StorageFile[] {
    return this.files.filter(
      (f) => f.tenantId === tenantId && (!bucket || f.bucket === bucket)
    );
  }

  getFile(fileId: string): StorageFile | undefined {
    return this.files.find((f) => f.id === fileId);
  }

  getStats(tenantId?: string) {
    const files = tenantId ? this.files.filter((f) => f.tenantId === tenantId) : this.files;
    const byBucket = files.reduce((acc, f) => {
      acc[f.bucket] = (acc[f.bucket] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const totalSize = files.reduce((s, f) => s + f.size, 0);
    return { totalFiles: files.length, totalSizeBytes: totalSize, byBucket };
  }

  getBuckets(): StorageBucket[] {
    return ["avatars", "campaign-assets", "generated-images", "creative-files", "documents", "exports", "backups", "site-assets"];
  }
}

export const storageService = new StorageService();
export default storageService;
