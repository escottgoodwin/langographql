const { admin } = require('../firebase');
const fetch = require('node-fetch');

async function singleLinkRecommendations(parent, args, ctx, info) {
  const { link, transLang } = args
  const gapi = process.env.GOOG_FUNC_REC

  const searchData = {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      headers: {
        "Content-Type": "application/json",
          // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify({"link":link}) // body data type must match "Content-Type" header
  }

  const apiurl = `https://lango-rec-${transLang}-v26nfpfxqq-uc.a.run.app/apis/single_art`

    let response = await fetch(apiurl,searchData);
    let data = await response.json();
    let { recs, title, langt } = data
    return {
      recommendations: recs,
      link,
      title,
      langt
    }
  }

async function signup(parent, args, context, info) {
  const { db } = context
  const { email, password, name, nativeLang } = args
  const signUpDate = new Date()
    
  admin.auth().createUser({
      email: email,
      emailVerified: false,
      password: password,
      displayName: name,
    })
    .then(userRecord => {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log('Successfully created new user:', userRecord.uid);
        const insertText = 'INSERT INTO users(uid, email, name, native_lang, created_at,last_seen) VALUES ($1, $2, $3, $4, $5, $6)'
        const { rows } = db.query(insertText, [userRecord.uid, email, name, nativeLang, signUpDate, signUpDate])
        return userRecord
      })
      .catch((error) => {
        console.log('Error creating new user:', error);
      })

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

async function login(parent, args, context, info) {
  const { db, user } = context
  const { uid } = user 
  const now = new Date()
  const sql = `UPDATE users SET online = 'yes',last_seen = $1 WHERE uid = $2`
  const { rows } = await db.query(sql,[now, uid])
  return { message: 'Online now' }
  
}

async function logout(parent, args, context, info) {
  const { db, user } = context
  const { uid } = user 
  const sql = `UPDATE users SET online = 'no' WHERE uid = '${uid}'`
  const { rows } = await db.query(sql)
  return { message: 'Offline now' }
  
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
  singleLinkRecommendations,
  signup,
  login,
  logout,
  log,
  updateUser,
}
