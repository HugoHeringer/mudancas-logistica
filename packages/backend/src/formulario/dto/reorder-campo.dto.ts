import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CampoOrdemItem {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ordem: number;
}

export class ReorderCamposDto {
  @ApiProperty({ type: [CampoOrdemItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampoOrdemItem)
  items: CampoOrdemItem[];
}
