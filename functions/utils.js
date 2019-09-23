require('dotenv').config();
var admin = require("firebase-admin");

const Pool = require('pg').Pool

var firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}

var fb = admin.initializeApp(firebaseConfig);

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
  //const Authorization = (ctx.req || ctx.request).get('Authorization')
  //if (Authorization) {
    //const token = Authorization.replace('Bearer ', '')
    //const fbuser = await fb.auth().verifyIdToken(token)
    //const { uid } = fbuser
    const uid = 'VreEqYHWAFNV32JXdbdfanTUWM73'
    query2 = `select * from users where uid = '${uid}'`
    const results = await db.query(query2)
    const user = results.rows[0]
    return user
  //}
  //return null
}

module.exports = {
  getUser
}