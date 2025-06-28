import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  constructor(@InjectConnection() private connection: Connection) {}

  async checkDatabase() {
    try {
      if (!this.connection.db) {
        throw new Error('Database connection not established');
      }
      await this.connection.db.admin().ping();
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  getDatabaseHealth() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return {
      status: states[this.connection.readyState] || 'unknown',
      readyState: this.connection.readyState,
      host: this.connection.host,
      port: this.connection.port,
      database: this.connection.db?.databaseName,
    };
  }

  getSystemHealth() {
    return {
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      timestamp: new Date().toISOString(),
      version: process.version,
    };
  }
}
