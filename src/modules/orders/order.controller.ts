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
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrderService } from './order.service';

type AuthenticatedRequest = Request & {
  user?: {
    userId?: string;
  };
};

@ApiTags('orders')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Tao don hang tu danh sach san pham' })
  @ApiBody({ type: CreateOrderDto })
  @ApiCreatedResponse({
    description: 'Don hang da duoc tao',
    type: OrderResponseDto,
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
  @Post()
  createOrder(
    @Req() req: AuthenticatedRequest,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.create(this.getUserId(req), createOrderDto);
  }

  @ApiOperation({ summary: 'Tao don hang tu gio hang hien tai' })
  @ApiBody({ type: CreateOrderFromCartDto })
  @ApiCreatedResponse({
    description: 'Don hang da duoc tao va gio hang duoc lam trong',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Gio hang trong, du lieu khong hop le hoac vuot ton kho san pham',
  })
  @ApiUnauthorizedResponse({
    description: 'Chua dang nhap hoac token khong hop le',
  })
  @ApiNotFoundResponse({
    description: 'Khong tim thay nguoi dung hoac san pham',
  })
  @Post('from-cart')
  createOrderFromCart(
    @Req() req: AuthenticatedRequest,
    @Body() createOrderFromCartDto: CreateOrderFromCartDto,
  ) {
    return this.orderService.createFromCart(
      this.getUserId(req),
      createOrderFromCartDto,
    );
  }

  @ApiOperation({ summary: 'Lay danh sach don hang cua nguoi dung hien tai' })
  @ApiOkResponse({
    description: 'Danh sach don hang cua nguoi dung hien tai',
    type: OrderResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'Chua dang nhap hoac token khong hop le',
  })
  @Get()
  getMyOrders(@Req() req: AuthenticatedRequest) {
    return this.orderService.getMyOrders(this.getUserId(req));
  }

  @ApiOperation({ summary: 'Lay chi tiet don hang cua nguoi dung hien tai' })
  @ApiParam({
    name: 'orderId',
    example: '6630a1a93b5b36574e9f4b12',
    description: 'MongoDB ObjectId cua don hang',
  })
  @ApiOkResponse({
    description: 'Chi tiet don hang',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({ description: 'ID don hang khong hop le' })
  @ApiUnauthorizedResponse({
    description: 'Chua dang nhap hoac token khong hop le',
  })
  @ApiNotFoundResponse({ description: 'Khong tim thay don hang' })
  @Get(':orderId')
  getMyOrder(
    @Req() req: AuthenticatedRequest,
    @Param('orderId') orderId: string,
  ) {
    return this.orderService.getMyOrder(this.getUserId(req), orderId);
  }

  @ApiOperation({ summary: 'Cap nhat so luong san pham trong don hang' })
  @ApiParam({
    name: 'orderId',
    example: '6630a1a93b5b36574e9f4b12',
    description: 'MongoDB ObjectId cua don hang',
  })
  @ApiParam({
    name: 'productId',
    example: '662f4f493b5b36574e9f4a91',
    description: 'MongoDB ObjectId cua san pham trong don hang',
  })
  @ApiBody({ type: UpdateOrderItemDto })
  @ApiOkResponse({
    description: 'Don hang sau khi cap nhat so luong',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'ID hoac so luong khong hop le, don hang khong the sua hoac vuot ton kho',
  })
  @ApiUnauthorizedResponse({
    description: 'Chua dang nhap hoac token khong hop le',
  })
  @ApiNotFoundResponse({
    description: 'Khong tim thay don hang hoac san pham',
  })
  @Patch(':orderId/items/:productId')
  updateItem(
    @Req() req: AuthenticatedRequest,
    @Param('orderId') orderId: string,
    @Param('productId') productId: string,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ) {
    return this.orderService.updateItem(
      this.getUserId(req),
      orderId,
      productId,
      updateOrderItemDto,
    );
  }

  @ApiOperation({ summary: 'Xoa mot san pham khoi don hang' })
  @ApiParam({
    name: 'orderId',
    example: '6630a1a93b5b36574e9f4b12',
    description: 'MongoDB ObjectId cua don hang',
  })
  @ApiParam({
    name: 'productId',
    example: '662f4f493b5b36574e9f4a91',
    description: 'MongoDB ObjectId cua san pham trong don hang',
  })
  @ApiOkResponse({
    description: 'Don hang sau khi xoa san pham',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'ID khong hop le hoac don hang khong the sua',
  })
  @ApiUnauthorizedResponse({
    description: 'Chua dang nhap hoac token khong hop le',
  })
  @ApiNotFoundResponse({
    description: 'Khong tim thay don hang hoac san pham',
  })
  @Delete(':orderId/items/:productId')
  removeItem(
    @Req() req: AuthenticatedRequest,
    @Param('orderId') orderId: string,
    @Param('productId') productId: string,
  ) {
    return this.orderService.removeItem(
      this.getUserId(req),
      orderId,
      productId,
    );
  }

  @ApiOperation({ summary: 'Huy don hang' })
  @ApiParam({
    name: 'orderId',
    example: '6630a1a93b5b36574e9f4b12',
    description: 'MongoDB ObjectId cua don hang',
  })
  @ApiOkResponse({
    description: 'Don hang sau khi huy',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Don hang khong the huy' })
  @ApiUnauthorizedResponse({
    description: 'Chua dang nhap hoac token khong hop le',
  })
  @ApiNotFoundResponse({ description: 'Khong tim thay don hang' })
  @Patch(':orderId/cancel')
  cancelOrder(
    @Req() req: AuthenticatedRequest,
    @Param('orderId') orderId: string,
  ) {
    return this.orderService.cancelOrder(this.getUserId(req), orderId);
  }

  private getUserId(req: AuthenticatedRequest): string {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('Chua dang nhap');
    }

    return userId;
  }
}
