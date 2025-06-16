import gql from "graphql-tag";
import ActivityFragment from "@/graphql/fragments/activity";

const ToggleActivityAsFavorite = gql`
  mutation ToggleActivityAsFavorite($activityId: String!) {
    toggleActivityAsFavorite(activityId: $activityId) {
      id
      favoriteActivities {
        ...Activity
      }
    }
  }
  ${ActivityFragment}
`;

export default ToggleActivityAsFavorite;
