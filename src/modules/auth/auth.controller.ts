import { Controller, Post, Body, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto, RegisterResponseDto } from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({ summary: 'Dang ky tai khoan' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'Tai khoan da duoc tao',
    type: RegisterResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Du lieu dang ky khong hop le hoac phone da ton tai' })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Dang nhap tai khoan' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Dang nhap thanh cong, access_token va refresh_token duoc luu vao cookie',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Du lieu dang nhap khong hop le' })
  @ApiUnauthorizedResponse({ description: 'Sai thong tin dang nhap' })
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    // Lưu access_token và refresh_token vào cookie (httpOnly)
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 ngày
    });
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 ngày
    });
    // Trả về user, không trả về token
    return { user: result.user };
  }

  @Post('refresh-token')
  async refreshToken(@Body('refresh_token') refreshToken: string, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.refreshToken(refreshToken);
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 ngày
    });
    return { user: result.user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { message: 'Đăng xuất thành công' };
  }
}
