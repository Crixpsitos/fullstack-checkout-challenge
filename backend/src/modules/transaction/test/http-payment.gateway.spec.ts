import { of, throwError } from 'rxjs';
import { HttpPaymentGateway } from '../infrastructure/gateway/http-payment.gateway';
import { type HttpService } from '@nestjs/axios';
import { type ConfigService } from '@nestjs/config';
import { PaymentGatewayError, PaymentGatewayTimeoutError } from '../domain/errors/payment-gateway.errors';
import * as crypto from 'crypto';

const INTEGRITY_SECRET = 'test_integrity_secret_abc123';
const BASE_URL = 'https://api-sandbox.test.dev/v1';
const API_KEY = 'prv_test_key_abc123';

const mockHttpService = (): jest.Mocked<Pick<HttpService, 'post' | 'get'>> => ({
  post: jest.fn(),
  get: jest.fn(),
});

const mockConfigService = (): jest.Mocked<Pick<ConfigService, 'getOrThrow'>> => ({
  getOrThrow: jest.fn().mockImplementation((key: string) => {
    const map: Record<string, unknown> = {
      'gateway.baseUrl': BASE_URL,
      'gateway.apiKey': API_KEY,
      'gateway.integritySecret': INTEGRITY_SECRET,
    };
    if (!(key in map)) throw new Error(`Missing config: ${key}`);
    return map[key];
  }),
});

const makeGatewayInput = () => ({
  reference: 'REF-ABCD1234',
  amountInCents: 500_000,
  cardToken: 'tok_test_abc123',
  acceptanceToken: 'acceptance_tok_xyz',
  customerEmail: 'test@example.com',
  customerName: 'Juan Pérez',
});

const buildExpectedSignature = (reference: string, amountInCents: number) => {
  const raw = `${reference}${amountInCents}COP${INTEGRITY_SECRET}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
};

describe('HttpPaymentGateway', () => {
  let gateway: HttpPaymentGateway;
  let httpService: jest.Mocked<Pick<HttpService, 'post' | 'get'>>;
  let configService: jest.Mocked<Pick<ConfigService, 'getOrThrow'>>;

  beforeEach(() => {
    httpService = mockHttpService();
    configService = mockConfigService();
    gateway = new HttpPaymentGateway(
      httpService as unknown as HttpService,
      configService as unknown as ConfigService,
    );
  });

  describe('createTransaction()', () => {
    it('retorna gatewayId, cardLastFour y cardBrand desde la respuesta', async () => {
      httpService.post.mockReturnValue(
        of({
          data: {
            data: {
              id: 'gw-ext-001',
              payment_method: { extra: { last_four: '4242', brand: 'VISA' } },
            },
          },
        }) as any,
      );

      const result = await gateway.createTransaction(makeGatewayInput());

      expect(result.gatewayId).toBe('gw-ext-001');
      expect(result.cardLastFour).toBe('4242');
      expect(result.cardBrand).toBe('VISA');
    });

    it('incluye la firma SHA-256 correcta en el body', async () => {
      let capturedBody: Record<string, unknown> = {};
      httpService.post.mockImplementation((_url, body) => {
        capturedBody = body as Record<string, unknown>;
        return of({ data: { data: { id: 'gw-1', payment_method: { extra: {} } } } }) as any;
      });

      const input = makeGatewayInput();
      await gateway.createTransaction(input);

      const expectedSig = buildExpectedSignature(input.reference, input.amountInCents);
      expect(capturedBody['signature']).toBe(expectedSig);
    });

    it('envía customer_email al nivel raíz y full_name dentro de customer_data', async () => {
      let capturedBody: Record<string, unknown> = {};
      httpService.post.mockImplementation((_url, body) => {
        capturedBody = body as Record<string, unknown>;
        return of({ data: { data: { id: 'gw-1', payment_method: { extra: {} } } } }) as any;
      });

      const input = makeGatewayInput();
      await gateway.createTransaction(input);

      expect(capturedBody['customer_email']).toBe('test@example.com');
      expect((capturedBody['customer_data'] as any)?.['full_name']).toBe('Juan Pérez');
    });

    it('envía currency COP', async () => {
      let capturedBody: Record<string, unknown> = {};
      httpService.post.mockImplementation((_url, body) => {
        capturedBody = body as Record<string, unknown>;
        return of({ data: { data: { id: 'gw-1', payment_method: { extra: {} } } } }) as any;
      });

      await gateway.createTransaction(makeGatewayInput());

      expect(capturedBody['currency']).toBe('COP');
    });

    it('envía payment_method con tipo CARD e installments 1', async () => {
      let capturedBody: Record<string, unknown> = {};
      httpService.post.mockImplementation((_url, body) => {
        capturedBody = body as Record<string, unknown>;
        return of({ data: { data: { id: 'gw-1', payment_method: { extra: {} } } } }) as any;
      });

      await gateway.createTransaction(makeGatewayInput());

      expect((capturedBody['payment_method'] as any)?.type).toBe('CARD');
      expect((capturedBody['payment_method'] as any)?.installments).toBe(1);
    });

    it('lanza PaymentGatewayError cuando la pasarela responde con error 422', async () => {
      const axiosError = {
        code: 'ERR_BAD_RESPONSE',
        message: 'Request failed with status code 422',
        response: {
          status: 422,
          data: {
            error: {
              type: 'VALIDATION_ERROR',
              messages: { acceptance_token: ['is invalid'] },
            },
          },
        },
      };
      httpService.post.mockReturnValue(throwError(() => axiosError) as any);

      await expect(gateway.createTransaction(makeGatewayInput())).rejects.toThrow(
        PaymentGatewayError,
      );
    });

    it('el mensaje del error incluye la info de validación de la pasarela', async () => {
      const axiosError = {
        code: 'ERR_BAD_RESPONSE',
        message: 'Request failed with status code 422',
        response: {
          status: 422,
          data: {
            error: {
              type: 'VALIDATION_ERROR',
              messages: { customer_email: ['No está presente'] },
            },
          },
        },
      };
      httpService.post.mockReturnValue(throwError(() => axiosError) as any);

      let caught: Error | null = null;
      try {
        await gateway.createTransaction(makeGatewayInput());
      } catch (e) {
        caught = e as Error;
      }

      expect(caught).toBeInstanceOf(PaymentGatewayError);
      expect(caught!.message).toContain('customer_email');
    });

    it('lanza PaymentGatewayError cuando la pasarela responde con 401', async () => {
      const axiosError = {
        code: 'ERR_BAD_RESPONSE',
        message: 'Request failed with status code 401',
        response: {
          status: 401,
          data: { error: { type: 'INVALID_ACCESS_TOKEN' } },
        },
      };
      httpService.post.mockReturnValue(throwError(() => axiosError) as any);

      await expect(gateway.createTransaction(makeGatewayInput())).rejects.toThrow(
        PaymentGatewayError,
      );
    });

    it('lanza PaymentGatewayTimeoutError cuando Axios lanza ECONNABORTED', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      };
      httpService.post.mockReturnValue(throwError(() => timeoutError) as any);

      await expect(gateway.createTransaction(makeGatewayInput())).rejects.toThrow(
        PaymentGatewayTimeoutError,
      );
    });

    it('lanza PaymentGatewayTimeoutError cuando Axios lanza ETIMEDOUT', async () => {
      const timeoutError = { code: 'ETIMEDOUT', message: 'connect ETIMEDOUT' };
      httpService.post.mockReturnValue(throwError(() => timeoutError) as any);

      await expect(gateway.createTransaction(makeGatewayInput())).rejects.toThrow(
        PaymentGatewayTimeoutError,
      );
    });
    it('re-lanza el error si no es un AxiosError en createTransaction', async () => {
      const plainError = new Error('unexpected internal error');
      httpService.post.mockReturnValue(throwError(() => plainError) as any);

      await expect(gateway.createTransaction(makeGatewayInput())).rejects.toBe(plainError);
    });
  });

  describe('pollStatus()', () => {
    const gatewayId = 'gw-ext-001';

    it.each([
      ['APPROVED', 'APPROVED'],
      ['DECLINED', 'DECLINED'],
      ['VOIDED', 'VOIDED'],
      ['ERROR', 'ERROR'],
    ] as const)('mapea status %s correctamente', async (gatewayStatus, expected) => {
      httpService.get.mockReturnValue(
        of({ data: { data: { status: gatewayStatus } } }) as any,
      );

      const result = await gateway.pollStatus(gatewayId);

      expect(result).toBe(expected);
    });

    it('retorna null para un status desconocido', async () => {
      httpService.get.mockReturnValue(
        of({ data: { data: { status: 'UNKNOWN_STATUS' } } }) as any,
      );

      const result = await gateway.pollStatus(gatewayId);

      expect(result).toBeNull();
    });

    it('retorna null cuando el status no está presente', async () => {
      httpService.get.mockReturnValue(of({ data: { data: {} } }) as any);

      const result = await gateway.pollStatus(gatewayId);

      expect(result).toBeNull();
    });

    it('retorna null (no lanza) cuando la pasarela falla', async () => {
      httpService.get.mockReturnValue(
        throwError(() => ({ code: 'ERR_BAD_RESPONSE', message: 'error', response: { status: 500, data: {} } })) as any,
      );

      const result = await gateway.pollStatus(gatewayId);

      expect(result).toBeNull();
    });

    it('re-lanza el error si no es un AxiosError en pollStatus', async () => {
      const plainError = new Error('unexpected error in poll');
      httpService.get.mockReturnValue(throwError(() => plainError) as any);

      await expect(gateway.pollStatus(gatewayId)).rejects.toBe(plainError);
    });

    it('llama al endpoint correcto', async () => {
      httpService.get.mockReturnValue(of({ data: { data: { status: 'APPROVED' } } }) as any);

      await gateway.pollStatus('my-gateway-id');

      expect(httpService.get).toHaveBeenCalledWith(
        `${BASE_URL}/transactions/my-gateway-id`,
        expect.any(Object),
      );
    });
  });
});
