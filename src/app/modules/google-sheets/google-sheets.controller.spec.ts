import { Test, TestingModule } from '@nestjs/testing';
import { GoogleSheetsController } from './google-sheets.controller';

describe('GoogleSheetsController', () => {
  let controller: GoogleSheetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleSheetsController],
    }).compile();

    controller = module.get<GoogleSheetsController>(GoogleSheetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
