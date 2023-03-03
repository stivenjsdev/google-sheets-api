import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleSheetsModule } from './app/modules/google-sheets/google-sheets.module';

@Module({
  imports: [GoogleSheetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
