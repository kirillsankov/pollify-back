import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from './enities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { IToken } from './interfaces/jwt.interface';
import { RefreshDocument } from './enities/refresh.enity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @InjectModel('Refresh')
    private readonly refreshModel: Model<RefreshDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<IToken> {
    const { username, password, email } = registerDto;
    const user = new this.userModel({ username, password, email });
    await user.save();
    return this.generateToken(user);
  }

  async login(loginDto: LoginDto): Promise<IToken> {
    const { username, password } = loginDto;
    const user = await this.userModel.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateToken(user);
  }

  async refreshToken(token: string): Promise<IToken> {
    const refresh = await this.refreshModel.findOneAndDelete({
      token: token.toString(),
      exp: { $gte: new Date() },
    });
    if (!refresh) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.userModel.findById(refresh.userId).exec();

    return this.generateToken(user as UserDocument);
  }

  private async generateToken(user: UserDocument): Promise<IToken> {
    const payload = { username: user.username, sub: user._id };
    const tokenRefresh = uuidv4();
    await this.storeRefreshToken(tokenRefresh, (user._id as string).toString());
    return {
      access_token: this.jwtService.sign(payload),
      refreshToken: tokenRefresh,
    };
  }

  private async storeRefreshToken(token: string, userId: string) {
    const exp = new Date();
    exp.setDate(exp.getDate() + 3);
    const refresh = await this.refreshModel.create({ token, userId, exp });
    return refresh;
  }
}
