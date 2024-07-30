import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({id, email: 'asdf@asdf.com', password: 'asdf'} as User);
      },
      find: (email: string) => {
        return Promise.resolve([{id: 1, email, password: 'asdf'} as User]);
      }
    };

    fakeAuthService = {
      signin: (email: string, password: string) => {
        return Promise.resolve({id: 1, email, password} as User);
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService
        },
        {
          provide: AuthService,
          useValue: fakeAuthService
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it("Returns a list of users with the given email", async () => {
    const users = await controller.findAllUser("asdf@asdf.com");
    expect(users.length).toBe(1);
    expect(users[0].email).toEqual('asdf@asdf.com');
  });

  it("Returns a single user with the given ID", async () => {
    const user = await controller.findUser("1");
    expect(user).toBeDefined();
  });

  it("Throws an error if user with given ID is not found.", async () => {
    fakeUsersService.findOne = () => null;
    try {
      await controller.findUser('1');
    } catch (error) {
      expect(error.toString()).toMatch('User not found.');
    }
  });

  it("Signs in, updates session object and returns user", async () => {
    const session = { userId: -10 };
    const user = await controller.signin({email: "asdf@asdf.com", password: "asdf"}, session);

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  })
});
