import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schames/user.schame';
import { RefreshToken, RefreshTokenSchema } from './schames/refresh-token.schame';

@Module({
  imports:[MongooseModule.forFeature([{
    name:User.name,
    schema:UserSchema,
    
  },
  {
    name:RefreshToken.name,
    schema:RefreshTokenSchema,
    
  }
])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
