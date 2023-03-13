import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { sheets_v4 } from 'googleapis';
import { GoogleSheetsService } from './google-sheets.service';
import googleConfig from '../../../config/google.config';

jest.mock('googleapis');
import { google } from 'googleapis';
import { HttpException } from '@nestjs/common';

describe('GoogleSheetsService', () => {
  let service: GoogleSheetsService;
  let sheets: any;

  beforeEach(async () => {
    sheets = {
      spreadsheets: {
        values: {
          get: jest.fn(),
        },
      },
    };

    jest.spyOn(google.auth, 'GoogleAuth').mockReturnValue({} as any);

    jest.spyOn(google, 'sheets').mockReturnValue(sheets as sheets_v4.Sheets);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [googleConfig],
        }),
      ],
      providers: [GoogleSheetsService],
    }).compile();

    service = module.get<GoogleSheetsService>(GoogleSheetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(service.findAll).toBeDefined();
    });

    describe('given a spreadSheetId, sheetName and range', () => {
      it('should return an array of arrays of strings', async () => {
        const spreadSheetId = 'asfd';
        const sheetName = 'Hoja 1';
        const range = 'A:D';

        const result = {
          data: {
            values: [
              ['name', 'age'],
              ['stiven', '30'],
            ],
          },
        };

        jest.spyOn(sheets.spreadsheets.values, 'get').mockResolvedValue(result);

        const response = await service.findAll(spreadSheetId, sheetName, range);

        expect(response).toEqual(result.data.values);
      });

      it('should throw an error with status 404 when range do not have data', async () => {
        const spreadSheetId = 'asfd';
        const sheetName = 'Hoja 1';
        const range = 'K:Z';

        const result = {
          data: {
            values: [],
          },
        };

        jest.spyOn(sheets.spreadsheets.values, 'get').mockResolvedValue(result);

        try {
          await service.findAll(spreadSheetId, sheetName, range);
        } catch (error) {
          expect(error.status).toBe(404);
          expect(error.message).toBe('NOT FOUND DATA IN THAT RANGE');
        }
      });

      it('should throw an error with status 400, when spreadSheetId, sheetName or range are wrong', async () => {
        const spreadSheetId = 'error';
        const sheetName = 'error';
        const range = 'error';

        const findAllError = new HttpException('any message', 400);
        const sheetsError = new Error('any message');

        jest
          .spyOn(sheets.spreadsheets.values, 'get')
          .mockRejectedValue(sheetsError);

        try {
          await service.findAll(spreadSheetId, sheetName, range);
        } catch (error) {
          expect(error).toEqual(findAllError);
        }
      });
    });

    describe('when spreadSheetId, sheetName and range are missing', () => {
      it('should throw an httpException error with status: 400 and message: ... is required', async () => {
        const fields = [
          { spreadSheetId: undefined, sheetName: undefined, range: undefined },
          { spreadSheetId: undefined, sheetName: 'Hoja 1', range: 'A:D' },
          { spreadSheetId: 'asfd', sheetName: undefined, range: 'A:D' },
          { spreadSheetId: 'asfd', sheetName: 'Hoja 1', range: undefined },
        ];
        const sheetsError = new Error('any message');

        jest
          .spyOn(sheets.spreadsheets.values, 'get')
          .mockRejectedValue(sheetsError);

        for (const params of fields) {
          try {
            await service.findAll(
              params.spreadSheetId,
              params.sheetName,
              params.range,
            );
          } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error.status).toBe(400);
            expect(error.message).toEqual(
              expect.stringContaining('is required'),
            );
          }
        }
      });
    });
  });
});
