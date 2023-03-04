import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';

@Injectable()
export class GoogleSheetsService {
  private readonly sheets: sheets_v4.Sheets;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        private_key: PRIVATE_KEY,
        client_email: CLIENT_EMAIL,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    this.sheets = sheets;
  }

  /**
   * Find list of rows in a specific range
   * @param spreadSheetId
   * @param sheetName
   * @param range
   * @returns list of rows
   */
  async findAll(
    spreadSheetId: string,
    sheetName: string,
    range: string,
  ): Promise<string[][]> {
    try {
      const result = await this.sheets.spreadsheets.values.get({
        spreadsheetId: spreadSheetId,
        range: `${sheetName}!${range}`,
      });

      if (!result.data.values) {
        throw new HttpException(
          'NOT FOUND DATA IN THAT RANGE',
          HttpStatus.NOT_FOUND,
        );
      }

      return result.data.values;
    } catch (e) {
      console.error(e.message);
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Filter row by column and value.
   * NOTE: spreadsheets cannot contain more than 1000 rows
   * @param spreadSheetId 
   * @param sheetName 
   * @param range 
   * @param column 
   * @param valueToSearch 
   * @returns list of rows
   */
  async filter(
    spreadSheetId: string,
    sheetName: string,
    range: string,
    column: number,
    valueToSearch: string,
  ): Promise<string[][]> {
    try {
      console.log('column->', column);
      console.log('valueToSearch->', valueToSearch);
      const rows = await this.findAll(spreadSheetId, sheetName, range);
      console.log('rows->', rows);
      const filteredData: string[][] = rows.filter(
        (row) => row[column - 1] === valueToSearch,
      );
      console.log('filteredData->', filteredData);
      if (filteredData.length === 0)
        throw new HttpException('ROWS NOT FOUND', HttpStatus.NOT_FOUND);
      filteredData.unshift(rows[0])
      return filteredData;
    } catch (e) {
      console.error(e.message);
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Append a Row at the end of the Sheet
   * @param spreadsheetId
   * @param sheetName
   * @param range
   * @param fields
   * @returns message and range
   */
  async append(
    spreadsheetId: string,
    sheetName: string,
    range: string,
    fields: unknown[],
  ): Promise<{ message: string; updatedRange: string }> {
    try {
      const result = await this.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!${range}`,
        valueInputOption: 'USER_ENTERED', // or RAW
        requestBody: {
          values: [fields],
        },
      });

      const updatedRange = result?.data?.updates?.updatedRange;

      return { message: 'Row Appended', updatedRange };
    } catch (e) {
      console.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update a field Row in a specific range
   * @param spreadsheetId
   * @param sheetName
   * @param range
   * @param fields
   * @returns message and range
   */
  async update(
    spreadsheetId: string,
    sheetName: string,
    range: string,
    fields: unknown[],
  ): Promise<{ message: string; updatedRange: string }> {
    try {
      const result = await this.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!${range}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [fields],
        },
      });

      if (!result.data) {
        throw new HttpException(
          'NOT FOUND DATA IN THAT RANGE',
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedRange = result?.data?.updatedRange;

      return { message: 'Row Updated', updatedRange };
    } catch (e) {
      console.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Delete a specific Row
   * @param spreadsheetId
   * @param sheetName
   * @param rowNumber
   * @returns message
   */
  async delete(
    spreadsheetId: string,
    sheetName: string,
    rowNumber: number,
  ): Promise<{ message: string }> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: false,
      });
      const sheetList = response.data.sheets;
      const sheetFound = sheetList.find(
        (sheet) => sheet.properties.title === sheetName,
      );
      if (!sheetFound)
        throw new HttpException('SHEET NOT FOUND', HttpStatus.NOT_FOUND);
      const sheetId = sheetFound.properties.sheetId;

      const request = {
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowNumber - 1,
            endIndex: rowNumber,
          },
        },
      };

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [request],
        },
      });

      return { message: 'Row Deleted' };
    } catch (e) {
      console.error(e);
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Converts the rows returned by google sheet to
   * a list of objects, where the keys of the objects
   * will be the first row
   * @param rows - rows list returned by google sheet
   * @returns Rows list mapped to objet list
   */
  mapRowsToObjectList(rows: string[][]): object[] {
    const [keys, ...values] = rows;
    return values.map((valuesArr) => {
      return valuesArr.reduce((obj, value, index) => {
        obj[keys[index]] = value;
        return obj;
      }, {});
    });
  }

  /**
   * Converts an Objet to a Google Sheet Row
   * @param object - any object
   * @returns Row
   */
  mapObjectToRow(object: object): unknown[] {
    return Object.values(object);
  }
}
