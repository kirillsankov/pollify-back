import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from './enities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { IToken } from './interfaces/jwt.interface';
import { RefreshDocument } from './enities/refresh.enity';
import { v4 as uuidv4 } from 'uuid';
import { Cron } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDocument } from './enities/reset-password.entity';
import { EmailVerificationDocument } from './enities/email-verification.entity';
// Добавим новый интерфейс для ответа с информацией о куках
export interface TokenWithCookieOptions extends IToken {
  cookieOptions: {
    name: string;
    value: string;
    options: {
      httpOnly: boolean;
      secure: boolean;
      expires: Date;
      sameSite: 'strict' | 'lax' | 'none';
      path: string;
    };
  };
}
@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @InjectModel('Refresh')
    private readonly refreshModel: Model<RefreshDocument>,
    @InjectModel('ResetPassword')
    private readonly resetPasswordModel: Model<ResetPasswordDocument>,
    @InjectModel('EmailVerification')
    private readonly emailVerificationModel: Model<EmailVerificationDocument>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { password, email } = registerDto;

    const findUser = await this.userModel.findOne({ email }).exec();
    if (findUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const user = new this.userModel({
      password,
      email,
      isEmailVerified: false,
    });
    await user.save();

    await this.sendVerificationCode(user);

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  async login(loginDto: LoginDto): Promise<TokenWithCookieOptions> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Email not verified. Please verify your email first.',
      );
    }

    return this.generateTokenWithCookieOptions(user);
  }

  async refreshToken(token: string): Promise<TokenWithCookieOptions> {
    const refresh = await this.refreshModel.findOneAndDelete({
      token: token.toString(),
      exp: { $gte: new Date() },
    });
    if (!refresh) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.userModel.findById(refresh.userId).exec();

    return this.generateTokenWithCookieOptions(user as UserDocument);
  }

  private async generateTokenWithCookieOptions(
    user: UserDocument,
  ): Promise<TokenWithCookieOptions> {
    const { token, refreshToken } = await this.generateToken(user);

    const expires = new Date();
    expires.setDate(expires.getDate() + 3);

    return {
      token,
      refreshToken,
      cookieOptions: {
        name: 'refresh_token',
        value: refreshToken,
        options: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          expires,
          sameSite: 'strict',
          path: '/',
        },
      },
    };
  }
  private async sendVerificationCode(user: UserDocument): Promise<void> {
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 15);

    await this.emailVerificationModel.deleteMany({ userId: user._id }).exec();

    await this.emailVerificationModel.create({
      userId: user._id,
      code: verificationCode,
      exp: expiration,
    });

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Email Verification Code',
      template: 'email-verification',
      context: {
        name: user.email,
        code: verificationCode,
      },
    });
  }

  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const verificationRecord = await this.emailVerificationModel
      .findOneAndDelete({
        userId: user._id,
        code,
        exp: { $gte: new Date() },
      })
      .exec();

    if (!verificationRecord) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    user.isEmailVerified = true;
    await user.save();

    return { message: 'Email verified successfully' };
  }

  async resendVerificationCodeEmail(
    email: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.sendVerificationCode(user);

    return { message: 'Verification code has been sent to your email' };
  }

  @Cron('0 */15 * * * *')
  async cleanupExpiredVerificationCodes() {
    const now = new Date();

    const expiredVerifications = await this.emailVerificationModel
      .find({
        exp: { $lt: now },
      })
      .exec();

    for (const verification of expiredVerifications) {
      const user = await this.userModel.findById(verification.userId).exec();

      if (user && !user.isEmailVerified) {
        await this.refreshModel.deleteMany({ userId: user._id }).exec();
        await this.resetPasswordModel.deleteMany({ userId: user._id }).exec();

        await user.deleteOne();
        console.log(`Deleted unverified user: ${user.email}`);
      }
    }

    await this.emailVerificationModel
      .deleteMany({
        exp: { $lt: now },
      })
      .exec();
  }

  private async generateToken(user: UserDocument): Promise<IToken> {
    const payload = { email: user.email, sub: user._id };
    const tokenRefresh = uuidv4();
    const refreshTokenDB = await this.refreshModel
      .findOne({
        userId: (user._id as string).toString(),
        exp: { $gte: new Date() },
      })
      .exec();

    if (!refreshTokenDB) {
      await this.cleanupExpiredTokens((user._id as string).toString());
      await this.storeRefreshToken(
        tokenRefresh,
        (user._id as string).toString(),
      );
    }

    return {
      token: this.jwtService.sign(payload),
      refreshToken: refreshTokenDB?.token || tokenRefresh,
    };
  }

  private async cleanupExpiredTokens(userId: string) {
    const now = new Date();
    await this.refreshModel
      .deleteMany({
        userId,
        exp: { $lt: now },
      })
      .exec();
  }

  private async storeRefreshToken(token: string, userId: string) {
    const exp = new Date();
    exp.setDate(exp.getDate() + 3);
    const refresh = await this.refreshModel.create({ token, userId, exp });
    return refresh;
  }

  @Cron('0 0 * * *')
  async handleCronCleanupTokens() {
    const now = new Date();
    await this.refreshModel
      .deleteMany({
        exp: { $lt: now },
      })
      .exec();
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    if (!user.isEmailVerified) {
      throw new BadRequestException(
        'Email not verified. Please verify your email first.',
      );
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 15);

    await this.resetPasswordModel.deleteMany({ userId: user._id }).exec();

    await this.resetPasswordModel.create({
      userId: user._id,
      code: resetCode,
      exp: expiration,
    });

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Code',
      template: 'reset-password',
      context: {
        name: user.email,
        code: resetCode,
      },
    });

    return { message: 'Password reset code has been sent to your email' };
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const resetRecord = await this.resetPasswordModel
      .findOneAndDelete({
        userId: user._id,
        code,
        exp: { $gte: new Date() },
      })
      .exec();

    if (!resetRecord) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    user.password = newPassword;
    await user.save();

    await this.refreshModel.deleteMany({ userId: user._id }).exec();

    return { message: 'Password has been reset successfully' };
  }

  @Cron('0 */15 * * * *')
  async cleanupExpiredResetCodes() {
    const now = new Date();
    await this.resetPasswordModel
      .deleteMany({
        exp: { $lt: now },
      })
      .exec();
  }
}
