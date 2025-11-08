import { Module } from "@nestjs/common";
import { BoardsModule } from './boards/boards.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
 
@Module({
    imports: [
        ConfigModule.forRoot(),

        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT!,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,

            autoLoadEntities: true,
            synchronize: false,
        }),
        BoardsModule,
        AuthModule
    ],
    controllers: [],
    providers: [],
    exports: []
})
export class AppModule {
    constructor(){}
}