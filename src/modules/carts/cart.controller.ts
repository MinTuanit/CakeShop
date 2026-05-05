import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartService } from './cart.service';

type AuthenticatedRequest = Request & {
  user?: {
    userId?: string;
  };
};

@ApiTags('cart')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Lay gio hang cua nguoi dung hien tai' })
  @ApiOkResponse({
    description: 'Gio hang cua nguoi dung hien tai',
    type: CartResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Chua dang nhap hoac token khong hop le',
  })
  @Get()
  getMyCart(@Req() req: AuthenticatedRequest) {
    return this.cartService.getMyCart(this.getUserId(req));
  }

  @ApiOperation({ summary: 'Them san pham vao gio hang' })
  @ApiBody({ type: AddCartItemDto })
  @ApiCreatedResponse({
    description: 'Gio hang sau khi them san pham',
    type: CartResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Du lieu khong hop le, san pham khong kha dung hoac vuot ton kho',
  })
  @ApiUnauthorizedResponse({
    description: 'Chua dang nhap hoac token khong hop le',
  })
  @ApiNotFoundResponse({
    description: 'Khong tim thay nguoi dung hoac san pham',
  })
  @Post('items')
  addItem(
    @Req() req: AuthenticatedRequest,
    @Body() addCartItemDto: AddCartItemDto,
  ) {
    return this.cartService.addItem(this.getUserId(req), addCartItemDto);
  }

  @ApiOperation({ summary: 'Cap nhat so luong san pham trong gio hang' })
  @ApiParam({
    name: 'productId',
    example: '662f4f493b5b36574e9f4a91',
    description: 'MongoDB ObjectId cua san pham trong gio hang',
  })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiOkResponse({
    description: 'Gio hang sau khi cap nhat so luong',
    type: CartResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'ID hoac so luong khong hop le, san pham khong kha dung hoac vuot ton kho',
  })
  @ApiUnauthorizedResponse({
    description: 'Chua dang nhap hoac token khong hop le',
  })
  @ApiNotFoundResponse({ description: 'Khong tim thay gio hang hoac san pham' })
  @Patch('items/:productId')
  updateItem(
    @Req() req: AuthenticatedRequest,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(
      this.getUserId(req),
      productId,
      updateCartItemDto,
    );
  }

  @ApiOperation({ summary: 'Xoa mot san pham khoi gio hang' })
  @ApiParam({
    name: 'productId',
    example: '662f4f493b5b36574e9f4a91',
    description: 'MongoDB ObjectId cua san pham trong gio hang',
  })
  @ApiOkResponse({
    description: 'Gio hang sau khi xoa san pham',
    type: CartResponseDto,
  })
  @ApiBadRequestResponse({ description: 'ID san pham khong hop le' })
  @ApiUnauthorizedResponse({
    description: 'Chua dang nhap hoac token khong hop le',
  })
  @ApiNotFoundResponse({ description: 'Khong tim thay gio hang hoac san pham' })
  @Delete('items/:productId')
  removeItem(
    @Req() req: AuthenticatedRequest,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(this.getUserId(req), productId);
  }

  @ApiOperation({ summary: 'Xoa toan bo gio hang' })
  @ApiOkResponse({
    description: 'Gio hang sau khi xoa tat ca san pham',
    type: CartResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Chua dang nhap hoac token khong hop le',
  })
  @Delete()
  clearCart(@Req() req: AuthenticatedRequest) {
    return this.cartService.clearCart(this.getUserId(req));
  }

  private getUserId(req: AuthenticatedRequest): string {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('Chua dang nhap');
    }

    return userId;
  }
}
