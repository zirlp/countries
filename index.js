import {ApolloServer, gql} from 'apollo-server';
import {ApolloServerPluginLandingPageProductionDefault} from 'apollo-server-core';
import {buildSubgraphSchema} from '@apollo/subgraph';
import {readFileSync} from 'fs';
import {resolvers} from './resolvers.js';

const typeDefs = gql(readFileSync('./schema.graphql', 'utf-8'));
const schema = buildSubgraphSchema({typeDefs, resolvers});

let plugins;
if (process.env.NODE_ENV === 'production') {
  plugins = [
    ApolloServerPluginLandingPageProductionDefault({
      footer: false,
      graphRef: process.env.APOLLO_GRAPH_REF
    })
  ];
}

const server = new ApolloServer({
  schema,
  introspection: true,
  plugins
});

server.listen({port: process.env.PORT || 4000}).then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});
