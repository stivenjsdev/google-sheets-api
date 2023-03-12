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
    it('should return a list of rows represented by objects, where its keys are the first row', async () => {
      const query = {
        spreadSheetId: 'asdf',
        sheetName: 'Hoja 1',
        range: 'A:D',
      };
      const rowsArr = [['name', 'age'], ['stiven', '30']];
      const objRowsArr = [{name: 'stiven', age: '30'}]

      jest
        .spyOn(service, 'findAll')
        // .mockImplementation(() => Promise.resolve(rowsArr));
        .mockResolvedValue(rowsArr);

      const response = await controller.getAll(query);

      expect(response).toEqual(objRowsArr);
    });

    it('if it only finds one row it should return an empty array.', async () => {
      const query = {
        spreadSheetId: 'asdf',
        sheetName: 'Hoja 1',
        range: 'A1:D1',
      };
      const rowsArr = [['name', 'age']];
      const objRowsArr = []

      jest
        .spyOn(service, 'findAll')
        .mockResolvedValue(rowsArr);

      const response = await controller.getAll(query);
      console.log({response})

      expect(response).toEqual(objRowsArr);
    });

    // it('An array of three empty arrays, should return an array with two objects', async () => {
    //   const result = [[], [], []];
    //   jest
    //     .spyOn(service, 'findAll')
    //     .mockImplementation(() => Promise.resolve(result));

    //   expect(
    //     await controller.getAll({
    //       spreadSheetId: 'asdf',
    //       sheetName: 'asdf',
    //       range: 'asdf',
    //     }),
    //   ).toEqual([{}, {}]);
    // });
  });
});
