import { ActivityListItem, PageTitle, DraggableList } from "@/components";
import { graphqlClient } from "@/graphql/apollo";
import {
  GetUserFavoriteActivitiesQuery,
  GetUserFavoriteActivitiesQueryVariables,
  OrderFavoriteActivitiesMutation,
  OrderFavoriteActivitiesMutationVariables,
} from "@/graphql/generated/types";
import OrderFavoriteActivities from "@/graphql/mutations/user/orderFavoriteActivities";
import GetUserFavoriteActivities from "@/graphql/queries/user/getUserFavoriteActivities";
import { withAuth } from "@/hocs";
import { useAuth, useSnackbar } from "@/hooks";
import { useMutation } from "@apollo/client";
import { Avatar, Flex, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";
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
  const snackbar = useSnackbar();
  const [orderedFavoriteActivities, setOrderedFavoriteActivities] = useState(favoriteActivities);

  // Trigger mutation to order favorite activities on reorder
  const [orderFavoriteActivities] = useMutation<
    OrderFavoriteActivitiesMutation,
    OrderFavoriteActivitiesMutationVariables
  >(OrderFavoriteActivities, {
    refetchQueries: [GetUserFavoriteActivities],
    onCompleted: () => {
      snackbar.success("Vos activités favorites ont été réorganisées.");
    },
  });

  const onReorderActivities = async (from: number, to: number) => {
    const newList = [...orderedFavoriteActivities];
    const [movedItem] = newList.splice(from, 1);
    newList.splice(to, 0, movedItem);
    
    setOrderedFavoriteActivities(newList);
    
    const activityIds = newList.map((activity) => activity.id);
    try {
      await orderFavoriteActivities({ variables: { activityIds } });
    } catch (error) {
      snackbar.error(
        "Une erreur est survenue lors de la réorganisation. L'ordre reste inchangé."
      );
      setOrderedFavoriteActivities(orderedFavoriteActivities);
    }
  };

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
          <Text size="sm" color="dimmed">
            Vous pouvez réorganiser vos activités favorites en les glissant et
            en les déposant.
          </Text>
          <DraggableList
            items={orderedFavoriteActivities}
            onReorder={onReorderActivities}
            getItemId={(activity) => activity.id}
          >
            {(activity) => (
              <>
                <ActivityListItem activity={activity} />
              </>
            )}
          </DraggableList>
        </Stack>
      )}
    </>
  );
};

export default withAuth(Profile);
