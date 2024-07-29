import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('Auth Service', () => {
  let service: AuthService;
  let fakeUserService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];

    fakeUserService = {
      find: (email: string) => {
        const filteredUsers = users.filter(user => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {id: Math.floor(Math.random() * 999), email, password} as User;
        users.push(user);
        return Promise.resolve(user);
      }
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('Can create an instance of auth service.', async () => {
    expect(service).toBeDefined();
  });

  it('Can create a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('Throws an error if user signs up with email that is in use.', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    try {
      await service.signup('asdf@asdf.com', 'asdf');
    } catch (err) {
      expect(err.toString()).toMatch('Email in use.');
    }
  });

  it('Throws an error if user logs in with unused email', async() => {
    try {
      await service.signin('abcd@abcd.com', 'abcd');
    } catch (err) {
      expect(err.toString()).toMatch('User not found.');
    }
  });

  it('Throws if an invalid password is provided', async() => {
    await service.signup('abcd@abcd.com', 'abcd');
    try{
      await service.signin('abcd@abcd.com', 'password');
    }catch(err){
      expect(err.toString()).toMatch('Bad password');
    }
  });

  it('Returns a user if correct password is provided.', async() => {
    await service.signup('asdf@asdf.com', 'mypassword');

    const user = await service.signin('asdf@asdf.com', 'mypassword');
    expect(user).toBeDefined();
  })
});
