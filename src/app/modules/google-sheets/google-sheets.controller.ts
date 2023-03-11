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
import { FilterRowsDto } from './dto/filter-rows.dto';
import { GetRowsDto } from './dto/get-rows.dto';
import { UpdateFieldsRowDto } from './dto/update-fields-row.dto';
// import { FastifyRequest, FastifyReply } from 'fastify';
import { GoogleSheetsService } from './google-sheets.service';

@Controller('google-sheets')
export class GoogleSheetsController {
  constructor(private gsService: GoogleSheetsService) {}

  @Get()
  async getAll(@Query() query: GetRowsDto): Promise<object[]> {
    const { spreadSheetId, sheetName, range } = query;

    const rows = await this.gsService.findAll(spreadSheetId, sheetName, range);

    return this.gsService.mapRowsToObjectList(rows);
  }

  @Get(':column/:value')
  async filter(
    @Query() query: FilterRowsDto,
    @Param('column') column: number,
    @Param('value') valueToSearch: string,
  ): Promise<object[]> {
    const { spreadSheetId, sheetName, range } = query;

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

    const { updatedRange } = await this.gsService.append(
      spreadSheetId,
      sheetName,
      range,
      fields,
    );

    return { message: 'Row Appended', updatedRange };
  }

  @Patch()
  async update(@Body() updateFieldsRowDto: UpdateFieldsRowDto): Promise<{
    message: string;
    updatedRange: string;
  }> {
    let { spreadSheetId, sheetName, range, data } = updateFieldsRowDto;

    if (!sheetName) sheetName = 'Hoja 1';

    const fields = this.gsService.mapObjectToRow(data);

    const { updatedRange } = await this.gsService.update(
      spreadSheetId,
      sheetName,
      range,
      fields,
    );

    return {
      message: 'Row Updated',
      updatedRange,
    };
  }

  @Delete()
  async delete(@Body() deleteRowDto: DeleteRowDto): Promise<{
    message: string;
  }> {
    let { spreadSheetId, sheetName, rowNumber } = deleteRowDto;

    if (!sheetName) sheetName = 'Hoja 1';

    await this.gsService.delete(spreadSheetId, sheetName, rowNumber);

    return { message: 'Row Deleted' };
  }
}
