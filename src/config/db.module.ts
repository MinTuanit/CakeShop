import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),

        onConnectionCreate: (connection) => {
          console.log('✅ MongoDB connected successfully');
          return connection;
        },

        connectionErrorFactory: (error) => {
          console.error('❌ MongoDB connection error:', error);
          return error;
        },
      }),
    }),
  ],
})
export class DatabaseModule { }