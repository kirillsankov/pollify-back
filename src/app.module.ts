import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';

const mogoConnection = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@pollify-mongo:27017`;
console.log(mogoConnection);
@Module({
  imports: [AuthModule, MongooseModule.forRoot(mogoConnection)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
