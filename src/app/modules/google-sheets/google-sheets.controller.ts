import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify'

@Controller('google-sheets')
export class GoogleSheetsController {

  @Post()
  hello(@Body() body: any): string {
    console.log(body)
    return 'test controller'
  }
}
