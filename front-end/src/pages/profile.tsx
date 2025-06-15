import { Activity, PageTitle } from "@/components";
import { graphqlClient } from "@/graphql/apollo";
import {
  GetUserFavoriteActivitiesQuery,
  GetUserFavoriteActivitiesQueryVariables,
} from "@/graphql/generated/types";
import GetUserFavoriteActivities from "@/graphql/queries/user/getUserFavoriteActivities";
import { withAuth } from "@/hocs";
import { useAuth } from "@/hooks";
import { Avatar, Flex, Grid, Stack, Text, Title } from "@mantine/core";
import { GetServerSideProps } from "next";
import Head from "next/head";

interface ProfileProps {
  favoriteActivities: GetUserFavoriteActivitiesQuery["getUserFavoriteActivities"];
}

export const getServerSideProps: GetServerSideProps<ProfileProps> = async ({
  req,
}) => {
  const response = await graphqlClient.query<
    GetUserFavoriteActivitiesQuery,
    GetUserFavoriteActivitiesQueryVariables
  >({
    query: GetUserFavoriteActivities,
    context: { headers: { Cookie: req.headers.cookie } },
  });

  return {
    props: {
      favoriteActivities: response.data.getUserFavoriteActivities || [],
    },
  };
};

const Profile = ({ favoriteActivities }: ProfileProps) => {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>Mon profil | CDTR</title>
      </Head>
      <PageTitle title="Mon profil" />
      <Flex align="center" gap="md">
        <Avatar color="cyan" radius="xl" size="lg">
          {user?.firstName[0]}
          {user?.lastName[0]}
        </Avatar>
        <Flex direction="column">
          <Text>{user?.email}</Text>
          <Text>{user?.firstName}</Text>
          <Text>{user?.lastName}</Text>
        </Flex>
      </Flex>
      {favoriteActivities.length > 0 && (
        <Stack mt="md" spacing="sm">
          <Title order={3}>Mes activités favorites</Title>
          <Grid>
            {favoriteActivities.map((activity) => (
              <Activity activity={activity} key={activity.id} />
            ))}
          </Grid>
        </Stack>
      )}
    </>
  );
};

export default withAuth(Profile);
