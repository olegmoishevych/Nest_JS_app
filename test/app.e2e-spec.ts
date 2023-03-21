import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/modules/app.module';
import { createApp } from '../src/commons/createApp';
import { endpoints } from './routing';
import { UserDto } from '../src/modules/users/dto/userDto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let server: any;

  const SA = {
    login: 'admin',
    password: 'qwerty',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app = createApp(app);
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it.skip('/ (GET)', () => {
    return request(server).get('/api').expect(200).expect('Hello World!');
  });
  describe('POST => /sa/users => Add new user to the system', () => {
    it('should wipe all data before test', async () => {
      const deleteAllResponse = await request(server).delete(
        endpoints.testingController.allData,
      );
      expect(deleteAllResponse.status).toBe(204);

      const users = await request(server)
        .get(endpoints.usersController.users)
        .auth(SA.login, SA.password);
      expect(users.status).toBe(200);
      expect(users.body.items).toHaveLength(0);
    });
    it('should return 401 status code because invalid auth credentials', async () => {
      const responseWithoutAuth = await request(server).post(
        endpoints.usersController.users,
      );

      expect(responseWithoutAuth.status).toBe(401);

      const responseWithBadAuth = await request(server)
        .post(endpoints.usersController.users)
        .auth('login', 'password');

      expect(responseWithBadAuth.status).toBe(401);
    });
    it('should return 400 status code because invalid input data', async () => {
      const errors = {
        errorsMessages: expect.arrayContaining([
          {
            message: expect.any(String),
            field: 'login',
          },
          {
            message: expect.any(String),
            field: 'email',
          },
          {
            message: expect.any(String),
            field: 'password',
          },
        ]),
      };

      const responseWithoutBody = await request(server)
        .post(endpoints.usersController.users)
        .auth(SA.login, SA.password)
        .send({});

      expect(responseWithoutBody.status).toBe(400);
      expect(responseWithoutBody.body).toStrictEqual(errors);

      const emptyInputData: UserDto = {
        login: '',
        email: '',
        password: '',
      };
      const responseWithEmptyInputData = await request(server)
        .post(endpoints.usersController.users)
        .auth(SA.login, SA.password)
        .send(emptyInputData);

      expect(responseWithEmptyInputData.status).toBe(400);
      expect(responseWithEmptyInputData.body).toStrictEqual(errors);
    });
    it('should create and return user with 201 status code', async () => {
      const newUser: UserDto = {
        login: 'admin',
        email: 'olegmoishevych@gmail.com',
        password: 'qwerty',
      };
      const responseWithCorrectUsersData = await request(server)
        .post(endpoints.usersController.users)
        .auth(SA.login, SA.password)
        .send(newUser);

      expect(responseWithCorrectUsersData.status).toBe(201);
      const createdUser = responseWithCorrectUsersData.body;
      expect(createdUser).toStrictEqual({
        id: expect.any(String),
        login: newUser.login,
        email: newUser.email,
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });

      expect.setState({ user: createdUser });
    });
    it('should return error because email already in DB', async () => {
      const { user } = expect.getState();

      const errors = {
        errorsMessages: expect.arrayContaining([
          {
            message: expect.any(String),
            field: 'email',
          },
        ]),
      };

      const newUser: UserDto = {
        login: user.login,
        email: user.email,
        password: 'qwerty',
      };

      const responseWithDuplicatedInputData = await request(server)
        .post(endpoints.usersController.users)
        .auth(SA.login, SA.password)
        .send(newUser);

      console.log(responseWithDuplicatedInputData.body);
      expect(responseWithDuplicatedInputData.status).toBe(400);
      expect(responseWithDuplicatedInputData.body).toStrictEqual(errors);
    });
    it('should return created user', async () => {
      const { user } = expect.getState();

      const users = await request(server)
        .get(endpoints.usersController.users)
        .auth(SA.login, SA.password);
      expect(users.status).toBe(200);
      expect(users.body.items).toHaveLength(1);
      const firstUser = users.body.items[0];
      expect(firstUser).toStrictEqual(user);
    });
  });
});
