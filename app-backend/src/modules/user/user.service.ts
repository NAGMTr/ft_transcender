import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "./user.entity";
import { CreateOauthUserDto } from "./create-oauth-user.dto";

@Injectable()
export class UserService{
 
    constructor( @InjectRepository(UserEntity) private readonly userRepository:Repository<UserEntity>)
    {}

    findUser(email: string): Promise<UserEntity | null> {
        return this.userRepository.findOneBy({ email });
    }

    createOauthUser(dto:CreateOauthUserDto ):Promise<UserEntity>{
        
        const user = this.userRepository.create({
            email:dto.email,
            password: null,
        });

        return this.userRepository.save(user);

    }
    
}