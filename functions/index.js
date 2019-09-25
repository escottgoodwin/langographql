require('dotenv').config()
const { GraphQLServer } = require('graphql-yoga')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
let utilFile = require ('./utils')
const functions = require('firebase-functions');

const Pool = require('pg').Pool

const new_connect = {
  user: 'doadmin',
  host: 'db-postgresql-nyc1-63665-do-user-6544825-0.db.ondigitalocean.com',
  database: 'langolearn',
  password: 'xis9craq0bu8ps1k',
  port: '25060',
  ssl: true
}
 
const db = new Pool(new_connect)

const resolvers = {
  Query,
  Mutation
}

const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers,
  context: async req => {
    const user = await utilFile.getUser(req) 
    return { db, user  }
  },

})

const options = {
  cors: true
};

server.createHttpServer(options);
const express = server.express;

module.exports = {
  lrec: functions.https.onRequest(express),
};