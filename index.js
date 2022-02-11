import {ApolloServer, gql} from 'apollo-server';
import {ApolloServerPluginLandingPageGraphQLPlayground} from 'apollo-server-core';
import {buildSubgraphSchema} from '@apollo/subgraph';
import {readFileSync} from 'fs';
import {resolvers} from './resolvers.js';

const typeDefs = gql(readFileSync('./schema.graphql', 'utf-8'));
const schema = buildSubgraphSchema({typeDefs, resolvers});

const server = new ApolloServer({
  schema,
  introspection: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
});

server.listen({port: process.env.PORT || 4000}).then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});
