import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService{
constructor(private jwtService: JwtService, private userService:UserService){}

async googleLogin(userGoogle: any){
    if (!userGoogle){
        throw new Error('Utilizador nao encontrado');
    }
    
    let user = await this.userService.findUser(userGoogle.email);

    if (user === null){
        user = await this.userService.createOauthUser({
            email: userGoogle.email,
            firstname: userGoogle.firstName,
            lastname: userGoogle.lastName,
        });
    }


    const payload = {
        email: user.email,
    };

    return {
        access_token:this.jwtService.sign(payload)
    };
}

}