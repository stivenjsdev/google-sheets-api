import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { AppendRowDto } from './dto/append-row.dto';
import { DeleteRowDto } from './dto/delete-row.dto';
import { UpdateFieldsRowDto } from './dto/update-fields-row.dto';
// import { FastifyRequest, FastifyReply } from 'fastify';
import { GoogleSheetsService } from './google-sheets.service';

@Controller('google-sheets')
export class GoogleSheetsController {
  constructor(private gsService: GoogleSheetsService) {}

  @Get()
  async getAll(
    @Query('spreadSheetId') spreadSheetId: string,
    @Query('sheetName') sheetName: string = 'Hoja 1',
    @Query('range') range: string = 'A:Z',
  ): Promise<object[]> {
    if (!spreadSheetId)
      throw new HttpException(
        'THE QUERY PARAM spreadSheetId IS REQUIRED',
        HttpStatus.BAD_REQUEST,
      );

    const rows = await this.gsService.findAll(spreadSheetId, sheetName, range);
    return this.gsService.mapRowsToObjectList(rows);
  }

  @Get(':column/:value')
  async filter(
    @Query('spreadSheetId') spreadSheetId: string,
    @Query('sheetName') sheetName: string = 'Hoja 1',
    @Query('range') range: string = 'A:Z',
    @Param('column') column: number,
    @Param('value') valueToSearch: string,
  ): Promise<object[]> {
    if (!spreadSheetId)
      throw new HttpException(
        'THE QUERY PARAM spreadSheetId IS REQUIRED',
        HttpStatus.BAD_REQUEST,
      );

    const rows = await this.gsService.filter(
      spreadSheetId,
      sheetName,
      range,
      column,
      valueToSearch,
    );
    return this.gsService.mapRowsToObjectList(rows);
  }

  @Post()
  async append(@Body() appendRowDto: AppendRowDto): Promise<{
    message: string;
    updatedRange: string;
  }> {
    let { spreadSheetId, sheetName, range, data } = appendRowDto;

    if (!sheetName) sheetName = 'Hoja 1';
    if (!range) range = 'A:Z';

    const fields = this.gsService.mapObjectToRow(data);

    const result = await this.gsService.append(
      spreadSheetId,
      sheetName,
      range,
      fields,
    );

    return result;
  }

  @Patch()
  async update(@Body() updateFieldsRowDto: UpdateFieldsRowDto): Promise<{
    message: string;
    updatedRange: string;
  }> {
    let { spreadSheetId, sheetName, range, data } = updateFieldsRowDto;

    if (!sheetName) sheetName = 'Hoja 1';

    const fields = this.gsService.mapObjectToRow(data);

    const result = await this.gsService.update(
      spreadSheetId,
      sheetName,
      range,
      fields,
    );

    return result;
  }

  @Delete()
  async delete(
    @Body() deleteRowDto: DeleteRowDto
  ): Promise<{
    message: string;
  }> {
    let { spreadSheetId, sheetName, rowNumber } = deleteRowDto;

    if (!sheetName) sheetName = 'Hoja 1';

    const result = await this.gsService.delete(
      spreadSheetId,
      sheetName,
      rowNumber,
    );

    return result;
  }
}
