import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { MeResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Lay thong tin tai khoan hien tai' })
  @ApiOkResponse({
    description: 'Thong tin tai khoan hien tai',
    type: MeResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Chua dang nhap hoac token khong hop le' })
  @Get('me')
  async getMe(@Req() req: Request & { user?: { userId?: string } }) {

    const userId = req.user?.userId;
    if (!userId) return { user: null };
    const user = await this.userModel.findById(userId).select('-password -refreshToken');
    return { user };
  }
}
