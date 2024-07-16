import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schames/user.schame';
import { Model } from 'mongoose';
import * as argon2 from "argon2";
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schames/refresh-token.schame';
import { v4 as uuidv4 } from 'uuid';
import { ResetToken } from './schames/reset-token.schema';
import { nanoid } from 'nanoid';
import { MailService } from 'src/services/mail.service';


@Injectable()
export class AuthService { constructor(
  @InjectModel(User.name)
   private UserModel: Model<User>,
   @InjectModel(RefreshToken.name)
   private RefreshTokenModel: Model<RefreshToken>,

   @InjectModel(ResetToken.name)
   private ResetTokenModel: Model<RefreshToken>,

  private jwtService:JwtService,
  private mailService:MailService){}




 async signup(signupDto:SignupDto) {
  const {email, password, name} = signupDto
  // check if email is in use 
const emailInuse = await this.UserModel.findOne({
  email: signupDto.email
});
if(emailInuse) {
  throw new BadRequestException( 'Email alredy in use  ')
}
  // hash password
  const hashPassword =  await argon2.hash(password);
  

  // create user document and save in mongodb
  await this.UserModel.create({
    name,
    email,
    password:hashPassword,
  })



 }

 async login(Credential:LoginDto){
  const {email, password } = Credential;
   //find if user exist by email
 const user = await this.UserModel.findOne({email})
 if (!user) {
  throw new UnauthorizedException('Wrong Credentails')
 }
// compare enetered password with existing password
const passwordMatch = await argon2.verify(user.password, password)
if(!passwordMatch)  {
  throw new UnauthorizedException('Wrong Credentails')
 }

// Generating JWT tokens#
const tokens = await this.generateUserTokens(user._id)
return  {
  ...tokens,
  userId : user._id
}
 }



 async changePassword(userId, oldPassword: string, newPassword: string) {
  //Find the user
  const user = await this.UserModel.findById(userId);
  if (!user) {
    throw new NotFoundException('User not found...');
  }

  //Compare the old password with the password in DB
const passwordMatch = await argon2.verify(user.password, oldPassword,)

  if (!passwordMatch) {
    throw new UnauthorizedException('Wrong credentials');
  }

  //Change user's password
  const newHashedPassword =  await argon2.hash(newPassword);
  user.password = newHashedPassword;
  await user.save();
  
  
}




async forgotPassword(email: string) {
  //Check that user exists
  const user = await this.UserModel.findOne({ email });

  if (user) {
    //If user exists, generate password reset link
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    const resetToken = nanoid(64);
    await this.ResetTokenModel.create({
      token: resetToken,
      userId: user._id,
      expiryDate,
    });
    //Send the link to the user by email
    this.mailService.sendPasswordResetEmail(email, resetToken);
  }

  return { message: 'If this user exists, they will receive an email' };
}

 async refreshTokens(refreshToken: string) {
  const token = await this.RefreshTokenModel.findOne({
    token: refreshToken,
    expiryDate: { $gte: new Date() },
  });

  if (!token) {
    throw new UnauthorizedException('Refresh Token is invalid');
  }
  return this.generateUserTokens(token.userId);
}

 async generateUserTokens(userId) {
  const accessToken = this.jwtService.sign({userId}, {expiresIn:'3d' });
  const refreshToken = uuidv4();
  await this.storeRefreshToken(refreshToken, userId)
   return {
    accessToken,
    refreshToken
   }
 }
  

 async storeRefreshToken(token: string, userId: string) {
  // Calculate expiry date 3 days from now
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 3);

  await this.RefreshTokenModel.updateOne(
    { userId },
    { $set: { expiryDate, token } },
    {
      upsert: true,
    },
  );
}


async resetPassword(newPassword: string, resetToken: string) {
  //Find a valid reset token document
  const token = await this.ResetTokenModel.findOneAndDelete({
    token: resetToken,
    expiryDate: { $gte: new Date() },
  });

  if (!token) {
    throw new UnauthorizedException('Invalid link');
  }

  //Change user password (MAKE SURE TO HASH!!)
  const user = await this.UserModel.findById(token.userId);
  if (!user) {
    throw new InternalServerErrorException();
  }

  user.password = await argon2.hash(newPassword);
  await user.save();
  return {
    messages:"Password has change sucessful"
      }

  }
  

}