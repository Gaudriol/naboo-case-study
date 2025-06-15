import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from '../user/user.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { User } from 'src/user/user.schema';
import { ContextWithJWTPayload } from 'src/auth/types/context';
import { Activity } from 'src/activity/activity.schema';

@Resolver('Me')
export class MeResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  @UseGuards(AuthGuard)
  async getMe(@Context() context: ContextWithJWTPayload): Promise<User> {
    // the AuthGard will add the user to the context
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.userService.getById(context.jwtPayload.id);
  }

  @Query(() => [Activity])
  @UseGuards(AuthGuard)
  async getUserFavoriteActivities(
    @Context() context: ContextWithJWTPayload,
  ): Promise<Activity[]> {
    return this.userService.getFavoriteActivities(context.jwtPayload.id);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async toggleActivityAsFavorite(
    @Context() context: ContextWithJWTPayload,
    @Args('activityId') activityId: string,
  ): Promise<User> {
    return this.userService.toggleActivityAsFavorite({
      userId: context.jwtPayload.id,
      activityId,
    });
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async orderFavoriteActivities(
    @Context() context: ContextWithJWTPayload,
    @Args('activityIds', { type: () => [String] }) activityIds: string[],
  ) {
    return this.userService.orderFavoriteActivities({
      userId: context.jwtPayload.id,
      activityIds,
    });
  }
}
