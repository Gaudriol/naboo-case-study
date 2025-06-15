import gql from "graphql-tag";

const OrderFavoriteActivities = gql`
  mutation OrderFavoriteActivities($activityIds: [String!]!) {
    orderFavoriteActivities(activityIds: $activityIds) {
      id
      favoriteActivities {
        id
        name
        city
        description
        price
        isFavorited
        owner {
          firstName
          lastName
        }
      }
    }
  }
`;

export default OrderFavoriteActivities;
