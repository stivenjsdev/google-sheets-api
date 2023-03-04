import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateFieldsRowDto {
  @IsNotEmpty()
  @IsString()
  spreadSheetId: string;

  @IsOptional()
  @IsString()
  sheetName: string;

  @IsNotEmpty()
  @IsString()
  range: string;

  @IsNotEmpty()
  @IsNotEmptyObject()
  @IsObject()
  data: object;
}
