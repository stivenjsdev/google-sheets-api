import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { GoogleSheetsService } from './google-sheets.service';

@Controller('google-sheets')
export class GoogleSheetsController {
  constructor(private gsService: GoogleSheetsService) {}

  @Get()
  async getAll(): Promise<object[]> {
    const spreadSheetId = '1ZR_P9KseivejdptQbJo3E0Qtod6zlYmsJMs2xX3KkPA';
    const sheetName = 'Hoja 1';
    const range = 'A:C';
    const rows = await this.gsService.findAll(spreadSheetId, sheetName, range);
    return this.gsService.mapRowsToObjectList(rows);
  }

  @Get(':field')
  async filter(@Param('field') field: string): Promise<unknown> {
    const spreadSheetId = '1ZR_P9KseivejdptQbJo3E0Qtod6zlYmsJMs2xX3KkPA';
    const sheetName = 'Hoja 1';
    const range = 'A:C';
    const column = 3;
    const valueToSearch = 'Michi'
    const rows = await this.gsService.filter(spreadSheetId, sheetName, range, column, valueToSearch);
    return this.gsService.mapRowsToObjectList(rows);
  }

  @Post()
  async append(): Promise<unknown> {
    const spreadSheetId = '1ZR_P9KseivejdptQbJo3E0Qtod6zlYmsJMs2xX3KkPA';
    const sheetName = 'Hoja 1';
    const range = 'A:C'; // de esta forma traemos todas las filas de estas columnas
    const data = {
      nombre: 'prueba2',
      apellido: 'prueba2',
    };
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
  async update(): Promise<unknown> {
    const spreadSheetId = '1ZR_P9KseivejdptQbJo3E0Qtod6zlYmsJMs2xX3KkPA';
    const sheetName = 'Hoja 1';
    const range = 'C2'; // debe especificar que columnas se van a modificar
    const data = {
      sexualidad: 'mujer2',
      comida: 'perro'
    };
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
  async delete(): Promise<unknown> {
    const spreadSheetId = '1ZR_P9KseivejdptQbJo3E0Qtod6zlYmsJMs2xX3KkPA';
    const sheetName = 'Hoja 13';
    const rowNumber = 1;

    const result = await this.gsService.delete(
      spreadSheetId,
      sheetName,
      rowNumber,
    );

    return result
  }
}
