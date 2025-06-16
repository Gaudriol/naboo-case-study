import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignUpInput } from 'src/auth/types';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';
import { Activity } from 'src/activity/activity.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Activity.name)
    private activityModel: Model<Activity>,
  ) {}

  async getByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email: email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email }).exec();
  }

  async getById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(
    data: SignUpInput & {
      role?: User['role'];
    },
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new this.userModel({ ...data, password: hashedPassword });
    return user.save();
  }

  async getFavoriteActivities(userId: string): Promise<Activity[]> {
    const user = await this.getById(userId);
    await user.populate({
      path: 'favoriteActivities',
      populate: {
        path: 'owner',
      },
    });
    return user.favoriteActivities || [];
  }

  async toggleActivityAsFavorite({
    userId,
    activityId,
  }: {
    userId: string;
    activityId: string;
  }): Promise<User> {
    const user = await this.getById(userId);

    const activity = await this.activityModel.findById(activityId);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    const activityIndex = user.favoriteActivities.findIndex(
      (favoritedActivity) => favoritedActivity._id.toString() === activityId,
    );

    if (activityIndex === -1) {
      user.favoriteActivities.push(activity);
    } else {
      user.favoriteActivities.splice(activityIndex, 1);
    }

    return await user.save();
  }

  async orderFavoriteActivities({
    userId,
    activityIds,
  }: {
    userId: string;
    activityIds: string[];
  }): Promise<User> {
    const user = await this.getById(userId);

    const storedFavoriteActivityIds = user.favoriteActivities.map((activity) =>
      activity._id.toString(),
    );
    const hasMismatch =
      storedFavoriteActivityIds.length !== activityIds.length ||
      !activityIds.every((id) => storedFavoriteActivityIds.includes(id));

    if (hasMismatch) {
      throw new BadRequestException(
        "Activity IDs must match exactly with user's favorite activities",
      );
    }

    const activities = await this.activityModel.find({
      _id: { $in: activityIds },
    });

    const activityMap = new Map(
      activities.map((activity) => [activity._id.toString(), activity]),
    );

    user.favoriteActivities = activityIds.map((id) => {
      const activity = activityMap.get(id);
      if (!activity) {
        throw new NotFoundException('Activity not found');
      }
      return activity;
    });

    return user.save();
  }

  async updateToken(id: string, token: string): Promise<User> {
    const user = await this.getById(id);
    user.token = token;
    return user.save();
  }

  async countDocuments(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async setDebugMode({
    userId,
    enabled,
  }: {
    userId: string;
    enabled: boolean;
  }): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        debugModeEnabled: enabled,
      },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
