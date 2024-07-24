import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async signup(email: string, password: string) {
        //* See if the email is in use or return an error.
        const users = await this.usersService.find(email);
        if(users.length) {
            throw new BadRequestException('Email in use.');
        }

        //* Hash the users password.
        //* Generate a salt
        const salt = randomBytes(8).toString('hex'); //! ==> random bytes generates a buffer(similar to array) holds raw data(binary) and convert to hexadecimal string.
        
        //* Hash the salt and password together
        const hash = (await scrypt(password, salt, 32)) as Buffer;

        //* Join the hashed result and the salt together
        const hashedPassword = salt + '.' + hash.toString('hex');

        //* Create a new user and save it.
        const user = this.usersService.create(email, hashedPassword);
        
        //* return the user.
        return user;
    }
}
