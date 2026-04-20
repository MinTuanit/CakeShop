import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../users/schema/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { name, phone, password } = registerDto;
    const existing = await this.userModel.findOne({ phone });
    if (existing) throw new BadRequestException('Số điện thoại đã tồn tại');
    const hash = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({ name, phone, password: hash });
    return { _id: user._id, name: user.name, phone: user.phone };
  }

  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;
    const user = await this.userModel.findOne({ phone });
    if (!user) throw new UnauthorizedException('Sai thông tin đăng nhập');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Sai thông tin đăng nhập');
    // Cập nhật lastLogin
    user.lastLogin = new Date();

    // Tạo refresh token
    const refreshPayload = { sub: user._id, phone: user.phone, role: user.role, type: 'refresh' };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, { expiresIn: '7d' });
    user.refreshToken = refreshToken;
    await user.save();

    const payload = { sub: user._id, phone: user.phone, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);
    return {
      access_token,
      refresh_token: refreshToken,
      user: { _id: user._id, name: user.name, phone: user.phone, role: user.role }
    };
  }

  async refreshToken(refreshToken: string) {
    interface RefreshPayload { sub: string; phone: string; role: string; type: string; }
    let payload: RefreshPayload | undefined;
    try {
      payload = this.jwtService.verify<RefreshPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
    if (!payload || payload.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
    const user = await this.userModel.findById(payload.sub);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const accessPayload = { sub: user._id, phone: user.phone, role: user.role };
    const access_token = await this.jwtService.signAsync(accessPayload);
    return {
      access_token,
      user: { _id: user._id, name: user.name, phone: user.phone, role: user.role }
    };
  }
}
