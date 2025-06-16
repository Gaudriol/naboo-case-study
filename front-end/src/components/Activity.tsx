import {
  ActivityFragment,
  GetActivityQuery,
  GetActivityQueryVariables,
  ToggleActivityAsFavoriteMutation,
  ToggleActivityAsFavoriteMutationVariables,
} from "@/graphql/generated/types";
import ToggleActivityAsFavorite from "@/graphql/mutations/user/toggleActivityAsFavorite";
import GetActivity from "@/graphql/queries/activity/getActivity";
import GetUserFavoriteActivities from "@/graphql/queries/user/getUserFavoriteActivities";
import { useAuth, useSnackbar } from "@/hooks";
import { useGlobalStyles } from "@/utils";
import { useMutation, useQuery } from "@apollo/client";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Image,
  Text,
} from "@mantine/core";
import { IconHeartFilled, IconHeart } from "@tabler/icons-react";
import Link from "next/link";

interface ActivityProps {
  activity: ActivityFragment;
}

export function Activity({ activity: initialActivity }: ActivityProps) {
  const { user } = useAuth();
  const { classes } = useGlobalStyles();
  const snackbar = useSnackbar();

  const { data } = useQuery<GetActivityQuery, GetActivityQueryVariables>(
    GetActivity,
    {
      variables: { id: initialActivity.id },
      fetchPolicy: "cache-and-network",
    }
  );

  const activity = data?.getActivity || initialActivity;

  const [toggleActivityAsFavorited] = useMutation<
    ToggleActivityAsFavoriteMutation,
    ToggleActivityAsFavoriteMutationVariables
  >(ToggleActivityAsFavorite, {
    refetchQueries: [
      {
        query: GetActivity,
        variables: { id: activity.id },
      },
      {
        query: GetUserFavoriteActivities,
      }
    ],
    onError: () => {
      snackbar.error("Une erreur est survenue.");
    },
  });

  const onToggleFavorite = () => {
    toggleActivityAsFavorited({
      variables: { activityId: activity.id },
    });
  };

  return (
    <Grid.Col span={4}>
      <Card shadow="sm" radius="md" style={{ position: "relative" }} withBorder>
        <Card.Section>
          <Image
            src="https://dummyimage.com/480x4:3"
            height={160}
            alt="random image of city"
          />
          <ActionIcon
            onClick={onToggleFavorite}
            variant="transparent"
            color="pink"
            style={{ position: "absolute", top: 4, right: 4, zIndex: 1 }}
          >
            {activity.isFavorited ? <IconHeartFilled /> : <IconHeart />}
          </ActionIcon>
        </Card.Section>

        <Group position="apart" mt="md" mb="xs">
          <Text weight={500} className={classes.ellipsis}>
            {activity.name}
          </Text>
        </Group>

        <Group mt="md" mb="xs">
          <Badge color="pink" variant="light">
            {activity.city}
          </Badge>
          <Badge color="yellow" variant="light">
            {`${activity.price}€/j`}
          </Badge>
        </Group>

        <Text size="sm" color="dimmed" className={classes.ellipsis}>
          {activity.description}
        </Text>
        {user?.role === "admin" && (
          <Text size="sm" color="dimmed">
            Créée le {new Date(activity.createdAt).toLocaleString()}
          </Text>
        )}

        <Link href={`/activities/${activity.id}`} className={classes.link}>
          <Button variant="light" color="blue" fullWidth mt="md" radius="md">
            Voir plus
          </Button>
        </Link>
      </Card>
    </Grid.Col>
  );
}
