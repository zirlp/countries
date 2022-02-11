import {ApolloServer, gql} from 'apollo-server';
import {ApolloServerPluginLandingPageProductionDefault} from 'apollo-server-core';
import {buildSubgraphSchema} from '@apollo/subgraph';
import {readFileSync} from 'fs';
import {resolvers} from './resolvers.js';

const typeDefs = gql(readFileSync('./schema.graphql', 'utf-8'));

const server = new ApolloServer({
  schema: buildSubgraphSchema({typeDefs, resolvers}),
  introspection: true,
  plugins: [
    ApolloServerPluginLandingPageProductionDefault({
      footer: false,
      graphRef: process.env.APOLLO_GRAPH_REF
    })
  ]
});

server.listen({port: process.env.PORT || 4000}).then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});
