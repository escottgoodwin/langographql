async function getCluster(db, lang, uid, cluster_num){
  query = `SELECT art_id, link, title, dt FROM ${lang}_arts
  WHERE art_id in
  (SELECT art_id FROM recommendations
  WHERE uid='${uid}' AND cluster_num=${cluster_num})`

  const results = await db.query(query)
  const recommendations = results.rows.map(r => ({art_id: r.art_id,  link: r.link, title: r.title, lang, date: r.dt}))

  return recommendations
}

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
  
  query = `SELECT art_id, cluster_num FROM recommendations WHERE uid='${uid}'`

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

async function articleRecommendations1(parent, args, context, info) {
  const { db, user } = context
  const { uid } = user

  const { lang } = args
  if (!user){
    throw error
  }
  query = `SELECT art_id, link, title, dt FROM ${lang}_arts
  WHERE art_id in
  (SELECT art_id FROM recommendations
  WHERE uid='${uid}')`

  const results = await db.query(query)
  const recommendations = results.rows.map(r => ({art_id: r.art_id,  link: r.link, title: r.title, lang, date: r.dt}))

  return recommendations

}

async function article(parent, args, context, info) {
  const { lang, artId } = args
  const { db, user } = context
  query2 = `select * from ${lang}_arts where art_id = '${artId}'`
  const results = await db.query(query2)

  querytrans = `select * from user_translations where art_id = '${artId}' AND uid ='${user.uid}'`
  const results1 = await db.query(querytrans)
  const { link, title, art_id, article, dt } = results.rows[0]

  return {
    link,
    title,
    art_id,
    article,
    date: dt,
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

module.exports = {
  articleRecommendations,
  articleRecommendations1,
  article,
  translations
}
