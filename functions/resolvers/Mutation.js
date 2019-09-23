const { getUserId } = require('../utils');

async function signup(parent, args, context, info) {
  const { db } = context
  const { uid, email, name, nativeLang } = args
  const signUpDate = new Date()
  const insertText = 'INSERT INTO users(uid, email, name, native_lang, created_at,last_seen) VALUES ($1, $2, $3, $4, $5, $6)'
  const { rows } = await db.query(insertText, [uid, email, name, nativeLang, signUpDate, signUpDate])

  return { message:'User Added!' }
}

async function log(parent, args, context, info) {
  const { db, user } = context
  const { uid } = user 
  const { bool } = args
  const sql = `UPDATE users SET online = '${bool}' WHERE uid = '${uid}'`
  const { rows } = await db.query(sql)
  return { message: args.bool==='yes' ? 'Online now' : 'Offline now' }
  
}

async function updateUser(parent, args, context, info) {

  const { db, user } = context
  const { uid } = user
  const { name, nativeLang } = args

  const sql = `UPDATE users SET name = '${name}', native_lang = '${nativeLang}' WHERE uid = '${uid}'`
  const { rows } = await db.query(sql)

  return { message:'User updated' }

}

module.exports = {
  signup,
  log,
  updateUser,
}
