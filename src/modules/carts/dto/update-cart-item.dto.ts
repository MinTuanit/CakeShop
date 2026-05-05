import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    example: 3,
    minimum: 1,
    description: 'So luong moi cua san pham trong gio hang',
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}
