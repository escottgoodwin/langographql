require('dotenv').config()
const { GraphQLServer } = require('graphql-yoga')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
let utilFile = require ('./utils')

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
  typeDefs: './src/schema.graphql',
  resolvers,
  context: async req => {
    const user = await utilFile.getUser(req) 
    return { db, user  }
  },

})

server.start(() => console.log('Server is running on http://localhost:4000'))

