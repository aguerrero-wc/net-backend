// update-service-config.dto.ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateServiceConfigDto } from './create-service-config.dto';

export class UpdateServiceConfigDto extends PartialType(
  OmitType(CreateServiceConfigDto, ['tenantId', 'serviceType'] as const)
) {
  // No se puede cambiar tenantId ni serviceType en un update
}