require('dotenv').config();

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