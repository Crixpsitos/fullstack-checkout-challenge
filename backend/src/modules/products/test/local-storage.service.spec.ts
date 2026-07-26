import { mkdir, writeFile, unlink } from 'fs/promises';
import { LocalStorageService } from '../infrastructure/storage/local-storage.service';
import type { StorageFileInput } from '../../../../shared/storage/storage.service.port';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('test-uuid-1234'),
}));

const mkdirMock = mkdir as jest.MockedFunction<typeof mkdir>;
const writeFileMock = writeFile as jest.MockedFunction<typeof writeFile>;
const unlinkMock = unlink as jest.MockedFunction<typeof unlink>;

const makeFile = (overrides: Partial<StorageFileInput> = {}): StorageFileInput => ({
  buffer: Buffer.from('fake-image-data'),
  originalname: 'photo.jpg',
  mimetype: 'image/jpeg',
  ...overrides,
});

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    service = new LocalStorageService();
    jest.clearAllMocks();
  });

  describe('isLocalUrl()', () => {
    it('retorna true para URLs locales (/uploads/...)', () => {
      expect(service.isLocalUrl('/uploads/products/img.jpg')).toBe(true);
    });

    it('retorna false para URLs externas (https://...)', () => {
      expect(service.isLocalUrl('https://picsum.photos/800/600')).toBe(false);
    });

    it('retorna false para string vacío', () => {
      expect(service.isLocalUrl('')).toBe(false);
    });
  });

  describe('saveMany()', () => {
    it('crea el directorio con mkdir antes de guardar', async () => {
      await service.saveMany([makeFile()], 'products');
      expect(mkdirMock).toHaveBeenCalledWith(
        expect.stringContaining('uploads/products'),
        { recursive: true },
      );
    });

    it('llama writeFile por cada archivo', async () => {
      await service.saveMany([makeFile(), makeFile({ originalname: 'other.png' })], 'products');
      expect(writeFileMock).toHaveBeenCalledTimes(2);
    });

    it('retorna URLs con formato /uploads/{folder}/{uuid}.{ext}', async () => {
      const urls = await service.saveMany([makeFile()], 'products');
      expect(urls).toHaveLength(1);
      expect(urls[0]).toBe('/uploads/products/test-uuid-1234.jpg');
    });

    it('extrae la extensión correctamente del originalname', async () => {
      const urls = await service.saveMany([makeFile({ originalname: 'imagen.png' })], 'avatars');
      expect(urls[0]).toMatch(/\.png$/);
    });

    it('usa "bin" como extensión cuando el originalname es vacío', async () => {
      const urls = await service.saveMany([makeFile({ originalname: '' })], 'products');
      expect(urls[0]).toMatch(/\.bin$/);
    });

    it('retorna array vacío si no se pasan archivos', async () => {
      const urls = await service.saveMany([], 'products');
      expect(urls).toEqual([]);
      expect(writeFileMock).not.toHaveBeenCalled();
    });
  });

  describe('deleteMany()', () => {
    it('llama a unlink solo para URLs locales', async () => {
      await service.deleteMany([
        '/uploads/products/img.jpg',
        'https://external.com/img.jpg',
      ]);
      expect(unlinkMock).toHaveBeenCalledTimes(1);
      expect(unlinkMock).toHaveBeenCalledWith(expect.stringContaining('uploads/products/img.jpg'));
    });

    it('no lanza error si unlink falla (archivo ya eliminado)', async () => {
      unlinkMock.mockRejectedValueOnce(new Error('ENOENT'));
      await expect(
        service.deleteMany(['/uploads/products/img.jpg']),
      ).resolves.toBeUndefined();
    });

    it('no llama a unlink si todas son URLs externas', async () => {
      await service.deleteMany(['https://picsum.photos/img.jpg']);
      expect(unlinkMock).not.toHaveBeenCalled();
    });

    it('no hace nada con array vacío', async () => {
      await service.deleteMany([]);
      expect(unlinkMock).not.toHaveBeenCalled();
    });
  });
});
