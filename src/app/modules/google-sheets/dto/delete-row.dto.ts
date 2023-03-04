import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class DeleteRowDto {
  @IsNotEmpty()
  @IsString()
  spreadSheetId: string;

  @IsOptional()
  @IsString()
  sheetName: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  rowNumber: number;
}
