import { Injectable } from '@nestjs/common';

@Injectable()
export class UserInfoService { //добавить userDTO
    async getInfo(){
        return "info";
    }
}
