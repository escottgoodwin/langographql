const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const translate = require('translate-google')
var admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://langolearn.firebaseio.com"
});

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

    const recommendations = recs.map(r => ({art_id: r.art_id, title: r.title, link: r.link, lang: transLang, date: r.date}))
  
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
    const en_rec = false
    const es_rec = false
    const de_rec = false
    const fr_rec = false

    const signUpDate = new Date()
    
    const insertText = 'INSERT INTO users(uid, email, name, native_lang, created_at,last_seen, en_rec, es_rec, de_rec, fr_rec) VALUES ($1, $2, $3, $4, $5, $6, $7, 8, $9, $10)'
    const { rows } = db.query(insertText, [uid, email, name, nativeLang, signUpDate, signUpDate, en_rec, es_rec, de_rec, fr_rec])
    return { message: 'User added!'}
  }
  
async function login(parent, args, context, info) {
  const { db, user } = context
  const { uid } = args

  const sql1 = `SELECT * FROM users WHERE uid = $1`
  const results = await db.query(sql1,[uid])

  if (results.rows.length===0){
    throw new Error('No user. Please sign up.')
  }

  const now = new Date()
  const sql2 = `UPDATE users SET online = 'yes',last_seen = $1 WHERE uid = $2`
  const { rows } = await db.query(sql2,[now, uid])
  const user1 = results.rows[0]

  return { 
    message: 'Online now',
    token: jwt.sign({ uid }, process.env.APP_SECRET),
    user:user1
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
  const { email, name, native_lang } = args

  const user1 = admin.auth().updateUser(uid, {
    email: email,
  })
    .then(userRecord =>  {
      return userRecord
    })
    .catch(error => {
      return error.message
    });

  const sql = `UPDATE users SET email = '${email}', name = '${name}', native_lang = '${native_lang}' WHERE uid = '${uid}'`
  const { rows } = await db.query(sql)


  return { message:'User updated' }

}

async function updateLangs(parent, args, context, info) {

  const { db, user } = context
  const { uid } = user
  const { es_rec, fr_rec, en_rec, de_rec } = args
  const sql = `UPDATE users SET en_rec=$1, de_rec=$2, es_rec=$3, fr_rec=$4 WHERE uid = '${uid}'`
  const data =  [en_rec, de_rec, es_rec, fr_rec]
  const { rows } = await db.query(sql,data)
  return { message:'Languages updated' }

}

async function translation(parent, args, context, info) {
  const { lang, orginalText, artId } = args
  const { db, user } = context
  const { uid } = user
  const transText = await translate(orginalText, { from: lang, to: user.native_lang });
  const insertTrans = 'INSERT INTO user_translations(uid, art_id, orig_text, trans_text, orig_lang, trans_lang) VALUES ($1, $2, $3, $4, $5, $6)'
  const { rows } = await db.query(insertTrans, [uid, artId, orginalText, transText, lang, user.native_lang])

  return { 
    orig_text: orginalText, 
    trans_text: transText, 
    orig_lang: lang, 
    trans_lang: user.native_lang, 
    art_id: artId, 
    id:'', 
    uid
  }
}

async function addToPlaylist(parent, args, context, info) {

  const { db, user } = context
  const { uid } = user
  const { art_id } = args
  const sql = `UPDATE recommendations SET playlist=true WHERE uid = '${uid}' AND art_id ='${art_id}'`
  const { rows } = await db.query(sql)
  return { message:'Added to Playlist!' }

}

async function removeFromPlaylist(parent, args, context, info) {

  const { db, user } = context
  const { uid } = user
  const { art_id } = args
  const sql = `UPDATE recommendations SET playlist=false WHERE uid = '${uid}' AND art_id ='${art_id}'`
  const { rows } = await db.query(sql)
  return { message:'Removed From Playlist!' }

}

module.exports = {
  singleLinkRecommendations,
  signup,
  login,
  logout,
  updateUser,
  updateLangs,
  translation,
  addToPlaylist,
  removeFromPlaylist
}
