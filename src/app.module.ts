import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb://0.0.0.0:27017/auth_module'), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
