import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import googleConfig from '../../../config/google.config';
import { GoogleSheetsController } from './google-sheets.controller';
import { GoogleSheetsService } from './google-sheets.service';

describe('GoogleSheetsController', () => {
  let controller: GoogleSheetsController;
  let service: GoogleSheetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [googleConfig],
        }),
      ],
      controllers: [GoogleSheetsController],
      providers: [
        GoogleSheetsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GoogleSheetsService>(GoogleSheetsService);
    controller = module.get<GoogleSheetsController>(GoogleSheetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('An array of two empty arrays, should return an array with a single object', async () => {
      const result = [[], []];
      jest
        .spyOn(service, 'findAll')
        .mockImplementation(() => Promise.resolve(result));
  
      expect(await controller.getAll('Asdf123asdf', 'Hoja 1', 'A:Z')).toEqual([
        {},
      ]);
    });
  
    it('An array of three empty arrays, should return an array with two objects', async () => {
      const result = [[], [], []];
      jest
        .spyOn(service, 'findAll')
        .mockImplementation(() => Promise.resolve(result));
  
      expect(await controller.getAll('Asdf123asdf', 'Hoja 1', 'A:Z')).toEqual([
        {},
        {},
      ]);
    });

  })


});
