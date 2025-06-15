import { PageTitle } from "@/components";
import { graphqlClient } from "@/graphql/apollo";
import {
  GetActivityQuery,
  GetActivityQueryVariables,
  ToggleActivityAsFavoriteMutation,
  ToggleActivityAsFavoriteMutationVariables,
} from "@/graphql/generated/types";
import ToggleActivityAsFavorite from "@/graphql/mutations/user/toggleActivityAsFavorite";
import GetActivity from "@/graphql/queries/activity/getActivity";
import { useAuth, useSnackbar } from "@/hooks";
import { useMutation, useQuery } from "@apollo/client";
import { Badge, Button, Flex, Grid, Group, Image, Text } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

interface ActivityDetailsProps {
  activity: GetActivityQuery["getActivity"];
}

export const getServerSideProps: GetServerSideProps<
  ActivityDetailsProps
> = async ({ params, req }) => {
  if (!params?.id || Array.isArray(params.id)) return { notFound: true };
  // To avoid having browser extensions map files triggering route calls
  if (!/^[0-9a-fA-F]{24}$/.test(params.id)) return { notFound: true };
  const response = await graphqlClient.query<
    GetActivityQuery,
    GetActivityQueryVariables
  >({
    query: GetActivity,
    variables: { id: params.id },
    context: { headers: { Cookie: req.headers.cookie } },
  });
  return { props: { activity: response.data.getActivity } };
};

export default function ActivityDetails({
  activity: initialActivity,
}: ActivityDetailsProps) {
  const router = useRouter();
  const { user } = useAuth();
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
    ],
    onError: () => {
      snackbar.error("Une erreur est survenue.");
    },
  });

  const onToggleFavorite = async () => {
    if (!user) {
      snackbar.error(
        "Vous devez être connecté pour ajouter une activité aux favoris."
      );
      router.push("/login");
      return;
    }
    toggleActivityAsFavorited({
      variables: { activityId: activity.id },
    });
  };

  return (
    <>
      <Head>
        <title>{activity.name} | CDTR</title>
      </Head>
      <PageTitle title={activity.name} prevPath={router.back} />
      <Grid>
        <Grid.Col span={7}>
          <Image
            src="https://dummyimage.com/640x4:3"
            radius="md"
            alt="random image of city"
            width="100%"
            height="400"
          />
        </Grid.Col>
        <Grid.Col span={5}>
          <Flex direction="column" gap="md">
            <Group mt="md" mb="xs">
              <Badge color="pink" variant="light">
                {activity.city}
              </Badge>
              <Badge color="yellow" variant="light">
                {`${activity.price}€/j`}
              </Badge>
            </Group>
            <Text size="sm">{activity.description}</Text>
            <Text size="sm" color="dimmed">
              Ajouté par {activity.owner.firstName} {activity.owner.lastName}
            </Text>
            <Button
              leftIcon={
                activity.isFavorited ? (
                  <IconHeartFilled size={16} />
                ) : (
                  <IconHeart size={16} />
                )
              }
              variant="light"
              color="pink"
              onClick={onToggleFavorite}
            >
              {activity.isFavorited
                ? "Retirer des favoris"
                : "Ajouter aux favoris"}
            </Button>
          </Flex>
        </Grid.Col>
      </Grid>
    </>
  );
}
