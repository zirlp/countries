import {ApolloServer, gql} from 'apollo-server-lambda';
import {ApolloServerPluginLandingPageGraphQLPlayground} from 'apollo-server-core';
import {buildSubgraphSchema} from '@apollo/subgraph';
import {join} from 'path';
import {readFileSync} from 'fs';
import {resolvers} from './resolvers';

const typeDefs = gql(
  readFileSync(join(__dirname, '../../../schema.graphql')).toString()
);

const schema = buildSubgraphSchema({
  typeDefs,
  resolvers
});

const server = new ApolloServer({
  schema,
  introspection: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
});

const apolloHandler = server.createHandler();

// workaround for netlify dev to play nice with ac3
// from https://github.com/vendia/serverless-express/issues/427#issuecomment-924580007
export const handler = (event, context, ...args) =>
  apolloHandler(
    {
      ...event,
      requestContext: context
    },
    context,
    ...args
  );
