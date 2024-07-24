import { Body, Controller, Get, Param, Post, Patch, Delete, Query, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';


@Controller('auth')
@Serialize(UserDto)
export class UsersController {

    constructor(private userService: UsersService, private authService: AuthService) {}
    
    @Post('signup')
    signup(@Body() body: CreateUserDto) {
        this.authService.signup(body.email, body.password);
    }

    // @UseInterceptors(new SerializeInterceptor(UserDto))
    
    @Get('/:id')
    async findUser(@Param('id') id: string){
        // console.log("handler is running.");
        const user = await this.userService.findOne(parseInt(id));
        if(!user) {
            throw new NotFoundException('User not found.');
        }
        return user;
    }

    @Get()
    findAllUser(@Query('email') email: string) {
        return this.userService.find(email);
    }

    @Patch('/:id')
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
        return this.userService.update(parseInt(id), body);
    }

    @Delete('/:id')
    removeUser(@Param('id') id: string) {
        return this.userService.remove(parseInt(id));
    }

    
}
