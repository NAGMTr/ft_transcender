import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //get
  @Get()
  findall(){
    
  }
  //get :id
  @Get("id")
  findone(){

  }
  //post 
  //put :id
  //delete :id
}
