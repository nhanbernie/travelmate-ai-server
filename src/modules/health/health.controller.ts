import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth() {
    return this.healthService.checkDatabase();
  }

  @Get('database')
  async getDatabaseHealth() {
    return this.healthService.getDatabaseHealth();
  }

  @Get('system')
  async getSystemHealth() {
    return this.healthService.getSystemHealth();
  }
}
