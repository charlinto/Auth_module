import { BadRequestException, Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schames/user.schame';
import { Model } from 'mongoose';
import * as argon2 from "argon2";

@Injectable()
export class AuthService { constructor(
  @InjectModel(User.name) private UserModel: Model<User>){}

  
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

}

