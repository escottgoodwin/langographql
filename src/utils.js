require('dotenv').config();
const jwt = require('jsonwebtoken')

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

async function getUser(ctx) {
  const Authorization = (ctx.req || ctx.request).get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const uid = jwt.verify(token, process.env.APP_SECRET)
    query2 = `select * from users where uid = '${uid}'`
    const results = await db.query(query2)
    const user = results.rows[0]
    return user
  }
  return null
}

module.exports = {
  getUser
}