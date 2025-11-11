import { Module, Global } from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import { CommonService } from './common.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [CommonService],
  exports: [CommonService]
})
export class CommonModule {}
