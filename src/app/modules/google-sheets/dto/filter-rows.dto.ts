import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class FilterRowsDto {
  @IsString()
  @IsNotEmpty()
  spreadSheetId: string;

  @IsString()
  @IsNotEmpty()
  sheetName: string;

  @IsString()
  @IsNotEmpty()
  range: string;
}
