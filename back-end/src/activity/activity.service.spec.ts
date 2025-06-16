import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { ActivityModule } from './activity.module';
import { TestModule, closeInMongodConnection } from 'src/test/test.module';
import { Activity } from './activity.schema';
import { CreateActivityInput } from './activity.inputs.dto';
import { NotFoundException } from '@nestjs/common';
import { User } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import { Types } from 'mongoose';

describe('ActivityService', () => {
  let activityService: ActivityService;
  let userService: UserService;
  let mockActivity1: Activity;
  let mockUser: User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, ActivityModule],
    }).compile();

    activityService = module.get<ActivityService>(ActivityService);
    userService = module.get<UserService>(UserService);
    mockUser = await userService.createUser({
      email: 'toto@test.fr',
      firstName: 'Toto',
      lastName: 'TITI',
      password: 'totitu',
    });

    mockActivity1 = await activityService.create(mockUser.id, {
      name: 'Surfing',
      description: 'Test Description',
      city: 'TestVille',
      price: 100,
    });

    await activityService.create(mockUser.id, {
      name: 'Diving',
      description: 'Another Test Description',
      city: 'TestVille',
      price: 40,
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });

  it('should be defined', () => {
    expect(activityService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all activities sorted by createdAt desc', async () => {
      const activities = await activityService.findAll();
      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBeGreaterThan(0);
      if (activities.length > 1) {
        expect(activities[0].createdAt.getTime()).toBeGreaterThanOrEqual(
          activities[1].createdAt.getTime(),
        );
      }
    });
  });

  describe('findLatest', () => {
    it('should return latest 3 activities', async () => {
      const activities = await activityService.findLatest();
      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBeLessThanOrEqual(3);
    });
  });

  describe('findByUser', () => {
    it('should return activities for specific user', async () => {
      const activities = await activityService.findByUser('test-user-id');
      expect(Array.isArray(activities)).toBe(true);
      activities.forEach((activity) => {
        expect(activity.owner).toBe('test-user-id');
      });
    });
  });

  describe('findOne', () => {
    it('should return activity by id', async () => {
      const activity = await activityService.findOne(
        mockActivity1._id.toString(),
      );
      expect(activity).toBeDefined();
      expect(activity._id.toString()).toBe(mockActivity1._id.toString());
    });

    it('should throw NotFoundException for non-existent id', async () => {
      await expect(
        activityService.findOne(new Types.ObjectId().toString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByIds', () => {
    it('should return activities by ids', async () => {
      const activities = await activityService.findByIds([
        mockActivity1._id.toString(),
      ]);
      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBe(1);
      expect(activities[0]._id.toString()).toBe(mockActivity1._id.toString());
    });
  });

  describe('create', () => {
    it('should create new activity', async () => {
      const newActivityData: CreateActivityInput = {
        name: 'New Activity',
        description: 'New Description',
        city: 'New City',
        price: 200,
      };

      const newActivity = await activityService.create(
        mockUser.id,
        newActivityData,
      );
      expect(newActivity).toBeDefined();
      expect(newActivity.name).toBe(newActivityData.name);
    });
  });

  describe('findCities', () => {
    it('should return distinct cities', async () => {
      const cities = await activityService.findCities();
      expect(Array.isArray(cities)).toBe(true);
      expect(cities).toContain('TestVille');
    });
  });

  describe('findByCity', () => {
    it('should return activities by city', async () => {
      const activities = await activityService.findByCity('TestVille');
      expect(Array.isArray(activities)).toBe(true);
      activities.forEach((activity) => {
        expect(activity.city).toBe('TestVille');
      });
    });

    it('should filter by activity name', async () => {
      const activities = await activityService.findByCity('TestVille', 'Surf');
      expect(Array.isArray(activities)).toBe(true);
      activities.forEach((activity) => {
        expect(activity.city).toBe('TestVille');
        expect(activity.name.toLowerCase()).toContain('surfing');
      });
    });

    it('should filter by price', async () => {
      const activities = await activityService.findByCity(
        'TestVille',
        undefined,
        50,
      );
      expect(Array.isArray(activities)).toBe(true);
      activities.forEach((activity) => {
        expect(activity.city).toBe('TestVille');
        expect(activity.price).toBeLessThanOrEqual(50);
      });
    });
  });
});
