import gql from 'graphql-tag';

export const AccountFragmentNode = gql`
  fragment AccountFragment on Account {
    id
    name
  }
`;
