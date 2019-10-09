const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const translate = require('translate-google')

async function singleLinkRecommendations(parent, args, context, info) {
  const { link, transLang } = args
  const gapi = process.env.GOOG_FUNC_REC

  if (transLang.length===0){
    throw new Error('Please select a language.')
  }

  if (link.replace(/(^\s+|\s+$)/g,'').length===0){
    throw new Error('Please submit a link.')
  }

  const searchData = {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({"link":link}) // body data type must match "Content-Type" header
  }
    const now = new Date()
    const apiurl = `https://lango-rec-${transLang}-v26nfpfxqq-uc.a.run.app/apis/link_search`
    const { user, db } = context
    const insertText = 'INSERT INTO linksearch(uid, link, date) VALUES ($1, $2, $3)'
    const { rows } = db.query(insertText, [user.uid, link, now])
  
    let response = await fetch(apiurl,searchData);
    let data = await response.json();
    let { recs, title, langt } = data

    const recommendations = recs.map(r => ({art_id: r.art_id, title: r.title, link: r.link, lang: transLang, date: r.dt}))
  
    return {
      recommendations,
      link,
      title,
      langt,
    }
  }

  async function signup(parent, args, context, info) {
    const { db } = context
    const { uid, email, name, nativeLang } = args
    const signUpDate = new Date()
    
    const insertText = 'INSERT INTO users(uid, email, name, native_lang, created_at,last_seen) VALUES ($1, $2, $3, $4, $5, $6)'
    const { rows } = db.query(insertText, [uid, email, name, nativeLang, signUpDate, signUpDate])
    return { message: 'User added!'}
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
  const { uid } = args

  const sql1 = `SELECT * FROM users WHERE uid = $1`
  const results = await db.query(sql1,[uid])
  console.log()
  if (results.rows.length===0){
    throw new Error('No user. Please sign up.')
  }

  const now = new Date()
  const sql2 = `UPDATE users SET online = 'yes',last_seen = $1 WHERE uid = $2`
  const { rows } = await db.query(sql2,[now, uid])

  return { 
    message: 'Online now',
    token: jwt.sign({ uid }, process.env.APP_SECRET),
  }
  
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

async function translation(parent, args, context, info) {
  const { lang, orginalText, artId } = args
  const { db, user } = context
  const { uid } = user
  const transText = await translate(orginalText, { from: lang, to: user.native_lang });
  const insertTrans = 'INSERT INTO user_translations(uid, art_id, orig_text, trans_text) VALUES ($1, $2, $3, $4)'
  const { rows } = await db.query(insertTrans, [uid, artId, orginalText, transText])

  return { 
    orig_text: orginalText, 
    trans_text: transText, 
    art_id: artId, 
    id:'', 
    uid
  }
}

module.exports = {
  singleLinkRecommendations,
  signup,
  login,
  logout,
  updateUser,
  translation
}
