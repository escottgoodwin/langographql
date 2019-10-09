require('dotenv').config()
const { GraphQLServer } = require('graphql-yoga')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
let utilFile = require ('./utils')
const functions = require('firebase-functions');

const Pool = require('pg').Pool

const new_connect = {
  user: process.env.PGCONNECT_USER,
  host: process.env.PGCONNECT_HOST,
  database: process.env.PGCONNECT_DBNAME,
  password: process.env.PGCONNECT_PASSWORD,
  port: process.env.PGCONNECT_PORT,
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