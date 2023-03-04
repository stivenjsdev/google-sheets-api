import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class AppendRowDto {
  @IsNotEmpty()
  @IsString()
  spreadSheetId: string;

  @IsOptional()
  @IsString()
  sheetName: string;

  @IsOptional()
  @IsString()
  range: string;

  @IsNotEmpty()
  @IsNotEmptyObject()
  @IsObject()
  data: object;
}
