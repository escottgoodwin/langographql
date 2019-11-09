var _ = require('lodash');

async function getRecs(db, lang, art_ids){

  query = `SELECT art_id, link, title, dt FROM ${lang}_arts WHERE art_id = ANY($1)`

  const results = await db.query(query,[art_ids])

  const recs = results.rows.map(r => ({art_id: r.art_id,  link: r.link, title: r.title, lang, date: r.dt}))

  return recs
}

function groupBy(arr, criteria) {
  return arr.reduce(function (obj, item) {
   var key = typeof criteria === 'function' ? criteria(item) : item[criteria];
     if (!obj.hasOwnProperty(key)) { obj[key] = [] }
     obj[key].push(item)
     return obj;
   }, {})
 }

async function articleRecommendations(parent, args, context, info) {
  const { db, user } = context
  const { uid } = user

  const { lang } = args
  if (!user){
    throw error
  }
  
  query = `SELECT art_id, cluster_num FROM recommendations WHERE uid='${uid}' AND rec_date > now() - INTERVAL '24 hours'`

  const results = await db.query(query)
  const recsraw = results.rows

  const grouped = groupBy(recsraw, 'cluster_num')
  const groupedIds = Object.values(grouped).map(g => g.map(a => a.art_id))
  clusterRecs1 = groupedIds.map(async (ai) => {
    const recs = await getRecs(db, lang, ai)
    return {
      recs: recs
    }
  })
  
  const clusterRecs = await Promise.all(clusterRecs1)

  return clusterRecs
}

async function articleRecommendationsAll(parent, args, context, info) {
  const { db, user } = context
  const { uid } = user

  const { lang } = args

  if (!user){
    throw error
  }

  query = `SELECT art_id, link, title, art_date, playlist FROM recommendations
  WHERE uid=$1 AND lang = $2 AND rec_date > now() - INTERVAL '24 hours'`
  const data=[uid,lang]
  
  const results = await db.query(query,data)
  const dedupe = _.uniqBy(results.rows, 'title')
  const recommendations = dedupe.map(r => ({art_id: r.art_id,  link: r.link, title: r.title, lang, date: r.art_date, playlist: r.playlist}))

  return recommendations

}

async function articleRecommendationsHistory(parent, args, context, info) {
  const { db, user } = context
  const { uid } = user

  const { date, lang } = args
  
  if (!user){
    throw error
  }

  query = 'SELECT art_id, link, title, art_date, playlist FROM recommendations WHERE uid = $1 AND lang = $2 AND rec_date::date= $3'
  const data=[uid,lang,date]

  const results = await db.query(query,data)
  const dedupe = _.uniqBy(results.rows, 'title')
  const recommendations = dedupe.map(r => ({art_id: r.art_id,  link: r.link, title: r.title, lang, date: r.art_date, playlist: r.playlist}))

  return recommendations

}

async function article(parent, args, context, info) {
  const { lang, artId } = args
  const { db, user } = context

  query_art = `select * from ${lang}_arts where art_id = $1`
  const results = await db.query(query_art,[artId])
  const { link, title, art_id, article, dt, playlist } = results.rows[0]

  query_trans = 'select * from user_translations where art_id = $1 AND uid = $2'
  const data = [artId,user.uid]
  const results1 = await db.query(query_trans,data)
  

  return {
    link,
    title,
    art_id,
    article,
    date: dt,
    playlist,
    translations: results1.rows
    }
  
}

async function translations(parent, args, context, info) {
  const { db, user } = context
  querytrans = `select * from user_translations where uid ='${user.uid}'`
  const results = await db.query(querytrans)
  const translations = results.rows
  return translations
}

async function user(parent, args, context, info) {
  const { db, user } = context
  const { name, email, uid, en_rec, fr_rec, es_rec, de_rec, native_lang, created_at } = user

  return { name, email, uid, en_rec, fr_rec, es_rec, de_rec, native_lang, created_at }
  
}

async function playList(parent, args, context, info) {
  const { db, user } = context
  const { uid } = user

  const { lang } = args

  if (!user){
    throw error
  }
  
  query = `SELECT art_id, link, title, dt FROM ${lang}_arts
  WHERE art_id in
  (SELECT art_id FROM recommendations
  WHERE uid='${uid}' AND playlist=true)`

  query1 = `SELECT ${lang}_arts.art_id, ${lang}_arts.link, ${lang}_arts.title, ${lang}_arts.dt, recommendations.playlist FROM ${lang}_arts,recommendations
  WHERE ${lang}_arts.art_id in
  (SELECT art_id FROM recommendations
  WHERE uid='${uid}' AND playlist=true)`

  const results = await db.query(query1)
  const dedupe = _.uniqBy(results.rows, 'title')
  const recommendations = dedupe.map(r => ({art_id: r.art_id,  link: r.link, title: r.title, lang, date: r.dt, playlist: r.playlist}))

  return recommendations

}

module.exports = {
  articleRecommendations,
  articleRecommendationsAll,
  articleRecommendationsHistory,
  article,
  translations,
  user,
  playList
}