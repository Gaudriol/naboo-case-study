import ActivityFragment from "@/graphql/fragments/activity";
import gql from "graphql-tag";

const GetUserFavoriteActivities = gql`
  query GetUserFavoriteActivities {
    getUserFavoriteActivities {
      ...Activity
    }
  }
  ${ActivityFragment}
`;

export default GetUserFavoriteActivities;
