import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UserSchema } from './enities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenSchema } from './enities/refresh.enity';

@Module({
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule],
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Refresh', schema: RefreshTokenSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class AuthModule {}
