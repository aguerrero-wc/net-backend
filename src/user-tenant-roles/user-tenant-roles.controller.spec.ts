import { Test, TestingModule } from '@nestjs/testing';
import { UserTenantRolesController } from './user-tenant-roles.controller';

describe('UserTenantRolesController', () => {
  let controller: UserTenantRolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserTenantRolesController],
    }).compile();

    controller = module.get<UserTenantRolesController>(UserTenantRolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
