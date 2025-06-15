import gql from "graphql-tag";

const GetUserFavoriteActivities = gql`
  query GetUserFavoriteActivities {
    getUserFavoriteActivities {
      id
      name
      city
      description
      price
      owner {
        firstName
        lastName
      }
    }
  }
`;

export default GetUserFavoriteActivities;
