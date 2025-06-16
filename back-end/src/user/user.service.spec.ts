import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { randomUUID } from 'crypto';
import { TestModule, closeInMongodConnection } from 'src/test/test.module';
import { Activity } from 'src/activity/activity.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

describe('UserService', () => {
  let userService: UserService;
  let testUser: any;
  let testActivity: Activity;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TestModule, UserModule],
    }).compile();

    userService = module.get<UserService>(UserService);

    const email = randomUUID() + '@test.com';
    testUser = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });

    const activityModel = module.get(getModelToken(Activity.name));
    testActivity = await activityModel.create({
      name: 'Test Activity',
      city: 'Test City',
      description: 'Test Description',
      price: 100,
      owner: testUser._id,
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('basic create / get', async () => {
    const email = randomUUID() + '@test.com';
    const user = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });

    const fetchedUser = await userService.getById(user.id);

    expect(fetchedUser).toMatchObject({
      email,
      firstName: 'firstName',
      lastName: 'lastName',
    });
  });

  describe('getFavoriteActivities', () => {
    it('should get empty favorite activities for new user', async () => {
      const activities = await userService.getFavoriteActivities(testUser.id);
      expect(activities).toEqual([]);
    });
  });
  describe('toggleActivityAsFavorite', () => {
    it('should toggle activity as favorite', async () => {
      const userAfterAdd = await userService.toggleActivityAsFavorite({
        userId: testUser.id,
        activityId: testActivity._id.toString(),
      });
      expect(userAfterAdd.favoriteActivities).toHaveLength(1);
      expect(userAfterAdd.favoriteActivities[0]._id.toString()).toBe(
        testActivity._id.toString(),
      );

      const userAfterRemove = await userService.toggleActivityAsFavorite({
        userId: testUser.id,
        activityId: testActivity._id.toString(),
      });
      expect(userAfterRemove.favoriteActivities).toHaveLength(0);
    });

    it('should throw NotFoundException when toggling non-existent activity', async () => {
      await expect(
        userService.toggleActivityAsFavorite({
          userId: testUser.id,
          activityId: new Types.ObjectId().toString(),
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
  describe('orderFavoriteActivities', () => {
    it('should order favorite activities', async () => {
      const activityModel = module.get(getModelToken(Activity.name));
      const activity2 = await activityModel.create({
        name: 'Test Activity 2',
        city: 'Test City',
        description: 'Test Description 2',
        price: 200,
        owner: testUser._id,
      });
      const activity3 = await activityModel.create({
        name: 'Test Activity 3',
        city: 'Test City',
        description: 'Test Description 3',
        price: 300,
        owner: testUser._id,
      });

      await userService.toggleActivityAsFavorite({
        userId: testUser.id,
        activityId: testActivity._id.toString(),
      });
      await userService.toggleActivityAsFavorite({
        userId: testUser.id,
        activityId: activity2._id.toString(),
      });
      await userService.toggleActivityAsFavorite({
        userId: testUser.id,
        activityId: activity3._id.toString(),
      });

      const newOrder = [
        activity3._id.toString(),
        testActivity._id.toString(),
        activity2._id.toString(),
      ];

      const userAfterReorder = await userService.orderFavoriteActivities({
        userId: testUser.id,
        activityIds: newOrder,
      });

      expect(
        userAfterReorder.favoriteActivities.map((a) => a._id.toString()),
      ).toEqual(newOrder);
    });

    it('should throw BadRequestException when ordering with mismatched activities', async () => {
      await expect(
        userService.orderFavoriteActivities({
          userId: testUser.id,
          activityIds: [new Types.ObjectId().toString()],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
