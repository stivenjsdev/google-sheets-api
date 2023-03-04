import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleSheetsModule } from './app/modules/google-sheets/google-sheets.module';
import googleConfig from './config/google.config'

@Module({
  imports: [
    GoogleSheetsModule,
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.dev'],
      isGlobal: true,
      load: [googleConfig]
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
