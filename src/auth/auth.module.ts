import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './enities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenSchema } from './enities/refresh.enity';
import { ResetPasswordSchema } from './enities/reset-password.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailVerificationSchema } from './enities/email-verification.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Refresh', schema: RefreshTokenSchema },
      { name: 'ResetPassword', schema: ResetPasswordSchema },
      { name: 'EmailVerification', schema: EmailVerificationSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'sankovkirill077@gmail.com',
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          // accessToken: process.env.ACCESS_TOKEN,
          // expires: 3599,
        },
        debug: true,
      },
      defaults: {
        from: '"Pollify App" <sankovkirill077@gmail.com>',
      },
      template: {
        dir: join(__dirname, '../templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
