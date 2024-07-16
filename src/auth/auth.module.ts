import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schames/user.schame';
import { RefreshToken, RefreshTokenSchema } from './schames/refresh-token.schame';
import { ResetToken, ResetTokenSchema } from './schames/reset-token.schema';
import { MailService } from 'src/services/mail.service';

@Module({
  imports:[MongooseModule.forFeature([{
    name:User.name,
    schema:UserSchema,
    
  },
  {
    name:RefreshToken.name,
    schema:RefreshTokenSchema,
    
  },
  {
    name:ResetToken.name,
    schema:ResetTokenSchema,
    
  }
])],
  controllers: [AuthController],
  providers: [AuthService, MailService],
})
export class AuthModule {}
