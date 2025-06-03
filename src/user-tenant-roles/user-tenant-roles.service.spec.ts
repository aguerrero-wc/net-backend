import { Test, TestingModule } from '@nestjs/testing';
import { UserTenantRolesService } from './user-tenant-roles.service';

describe('UserTenantRolesService', () => {
  let service: UserTenantRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserTenantRolesService],
    }).compile();

    service = module.get<UserTenantRolesService>(UserTenantRolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
