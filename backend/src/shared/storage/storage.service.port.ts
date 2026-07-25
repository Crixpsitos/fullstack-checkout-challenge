export const STORAGE_SERVICE = 'STORAGE_SERVICE';

export class StorageFileInput {
  constructor(
    public readonly buffer: Buffer,
    public readonly originalname: string,
    public readonly mimetype: string,
  ) {}
}

export abstract class IStorageService {
  abstract saveMany(files: StorageFileInput[], folder: string): Promise<string[]>;
  abstract deleteMany(urls: string[]): Promise<void>;
  abstract isLocalUrl(url: string): boolean;
}
