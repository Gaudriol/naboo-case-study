import gql from "graphql-tag";

const ToggleActivityAsFavorite = gql`
  mutation ToggleActivityAsFavorite($activityId: String!) {
    toggleActivityAsFavorite(activityId: $activityId) {
      id
      favoriteActivities {
        id
        isFavorited
      }
    }
  }
`;

export default ToggleActivityAsFavorite;
