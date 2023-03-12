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

  it('findAll method should return an array of arrays of strings', async () => {
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

  it('if range do not have data should throw an error with status 404', async () => {
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

  it('if spreadSheetId, sheetName or range are wrong should throw an error with status 400', async () => {
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
