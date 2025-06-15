import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  Int,
  Parent,
  ResolveField,
  ID,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from 'src/user/user.service';
import { Activity } from './activity.schema';

import { CreateActivityInput } from './activity.inputs.dto';
import { User } from 'src/user/user.schema';
import { ContextWithJWTPayload } from 'src/auth/types/context';

@Resolver(() => Activity)
export class ActivityResolver {
  constructor(
    private readonly activityService: ActivityService,
    private readonly userService: UserService,
  ) {}

  @ResolveField(() => ID)
  id(@Parent() activity: Activity): string {
    return activity._id.toString();
  }

  @ResolveField(() => User)
  async owner(@Parent() activity: Activity): Promise<User> {
    await activity.populate('owner');
    return activity.owner;
  }

  @Query(() => [Activity])
  async getActivities(): Promise<Activity[]> {
    return this.activityService.findAll();
  }

  @Query(() => [Activity])
  async getLatestActivities(): Promise<Activity[]> {
    return this.activityService.findLatest();
  }

  @Query(() => [Activity])
  @UseGuards(AuthGuard)
  async getActivitiesByUser(
    @Context() context: ContextWithJWTPayload,
  ): Promise<Activity[]> {
    return this.activityService.findByUser(context.jwtPayload.id);
  }

  @Query(() => [String])
  async getCities(): Promise<string[]> {
    const cities = await this.activityService.findCities();
    return cities;
  }

  @Query(() => [Activity])
  async getActivitiesByCity(
    @Args('city') city: string,
    @Args({ name: 'activity', nullable: true }) activity?: string,
    @Args({ name: 'price', nullable: true, type: () => Int }) price?: number,
  ): Promise<Activity[]> {
    return this.activityService.findByCity(city, activity, price);
  }

  @Query(() => Activity)
  async getActivity(@Args('id') id: string): Promise<Activity> {
    return this.activityService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @ResolveField(() => Boolean, { nullable: true })
  async isFavorited(
    @Context() context: ContextWithJWTPayload,
    @Parent() activity: Activity,
  ): Promise<boolean | null> {
    if (!context.jwtPayload?.id) {
      return null;
    }
    const user = await this.userService.getById(context.jwtPayload.id);
    const isFavorited = user.favoriteActivities.includes(activity._id);
    return isFavorited;
  }

  @UseGuards(AuthGuard)
  @ResolveField(() => Date, { nullable: true })
  async createdAt(
    @Context() context: ContextWithJWTPayload,
    @Parent() activity: Activity,
  ): Promise<Date | null> {
    console.log('RESOLVER');
    if (!context.jwtPayload?.id) {
      return null;
    }
    const user = await this.userService.getById(context.jwtPayload.id);
    console.log(
      'createdAt',
      context.jwtPayload?.id,
      activity.createdAt,
      user.role,
    );
    return user.role === 'admin' ? activity.createdAt : null;
  }

  @Mutation(() => Activity)
  @UseGuards(AuthGuard)
  async createActivity(
    @Context() context: ContextWithJWTPayload,
    @Args('createActivityInput') createActivity: CreateActivityInput,
  ): Promise<Activity> {
    return this.activityService.create(context.jwtPayload.id, createActivity);
  }
}
