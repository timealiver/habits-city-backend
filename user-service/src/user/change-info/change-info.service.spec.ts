import { Test, TestingModule } from '@nestjs/testing';
import { ChangeInfoService } from './change-info.service';

describe('ChangeInfoService', () => {
  let service: ChangeInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChangeInfoService],
    }).compile();

    service = module.get<ChangeInfoService>(ChangeInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
