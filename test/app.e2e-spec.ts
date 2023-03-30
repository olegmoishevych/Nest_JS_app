import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/modules/app.module';
import { createApp } from '../src/commons/createApp';
import { endpoints } from './routing';
import { UserDto } from '../src/modules/users/dto/userDto';
import { BlogsDto } from '../src/modules/blogs/dto/blogsDto';
import { response } from 'express';
import { exploreApiConsumesMetadata } from '@nestjs/swagger/dist/explorers/api-consumes.explorer';
import { BanUserForBloggerDto } from '../src/modules/blogs/dto/bloggerDto';

describe('AppController (e2e)', () => {
  jest.setTimeout(3 * 60 * 1000);
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

  beforeEach(async () => {
    const response = await request(server).delete('/api/testing/all-data');
    expect(response.status).toBe(204);

    const getUsersResponse = await request(server)
      .get('/api/sa/users')
      .auth(SA.login, SA.password, { type: 'basic' });
    expect(getUsersResponse.status).toBe(200);
    expect(getUsersResponse.body.items).toHaveLength(0);
  });

  describe('ban user for current blog', () => {
    const countOfUsers = 2;
    const banUserForBlogUrl = (userId: string) =>
      `/api/blogger/users/${userId}/ban`;
    it('should create and login two users, create blog for test', async () => {
      const users = [];
      for (let i = 0; i < countOfUsers; i++) {
        const userInputData: UserDto = {
          login: `login${i}`,
          email: `email${i}@gmail.com`,
          password: `password${i}`,
        };
        const response = await request(server)
          .post('/api/sa/users')
          .auth(SA.login, SA.password, { type: 'basic' })
          .send(userInputData);

        const user = response.body;

        users.push({ ...userInputData, ...user });
      }
      const usersWithBearerTokens = [];
      for (const user of users) {
        const response = await request(server).post('/api/auth/login').send({
          loginOrEmail: user.login,
          password: user.password,
        });
        const { accessToken } = response.body;
        usersWithBearerTokens.push({ ...user, accessToken });
      }
      expect(usersWithBearerTokens).toHaveLength(countOfUsers);
      expect(usersWithBearerTokens[0]).toEqual({
        id: expect.any(String),
        login: expect.any(String),
        email: expect.any(String),
        password: expect.any(String),
        createdAt: expect.any(String),
        banInfo: { isBanned: false, banDate: null, banReason: null },
        accessToken: expect.any(String),
      });
      const blogInputData: BlogsDto = {
        name: 'name',
        description: 'description',
        websiteUrl: 'websiteUrl.com',
      };

      const createBlogResponse = await request(server)
        .post('/api/blogger/blogs')
        .auth(usersWithBearerTokens[0].accessToken, {
          type: 'bearer',
        })
        .send(blogInputData);

      expect(createBlogResponse.status).toBe(201);

      const blog = createBlogResponse.body;

      expect.setState({
        user0: usersWithBearerTokens[0],
        user1: usersWithBearerTokens[1],
        blog,
      });
    });

    it('should  return 401 status code', async () => {
      const response1 = await request(server)
        .put(banUserForBlogUrl('123'))
        .send({});
      expect(response1.status).toBe(401);

      const response2 = await request(server)
        .put(banUserForBlogUrl('123'))
        .auth('any token', { type: 'bearer' })
        .send({});
      expect(response2.status).toBe(401);
    });

    it('should ban user for current blog', async () => {
      const { user0, user1, blog } = expect.getState();

      const banUserForBlogInputData: BanUserForBloggerDto = {
        blogId: blog.id,
        isBanned: true,
        banReason: 'плохой мальчик, очень плохо себя вёл',
      };
      console.log(user0);
      const response = await request(server)
        .put(banUserForBlogUrl(user1.id))
        .auth(user0.accessToken, { type: 'bearer' })
        .send(banUserForBlogInputData);
      expect(response.status).toBe(204);
    });
  });

  describe.skip('POST => /sa/users => Add new user to the system', () => {
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
