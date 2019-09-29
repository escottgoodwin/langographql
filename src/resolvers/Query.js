async function articleRecommendations(parent, args, context, info) {
  const { db, user } = context
  console.log(user)
  const { lang } = args
  if (!user){
    throw error
  }

  query2 = `select recs from recommendations where uid = '${user.uid}' AND lang = '${lang}' ORDER BY rec_date DESC LIMIT 1`
  const results = await db.query(query2)
  if (results.rows.length>1){
    const art_ids = results.rows[0]
    console.log(art_ids)
    query1 = `select * from ${lang}_arts where art_id in ${art_ids}`
  
    query3 = `select * from ${lang}_arts where uid in (SELECT uid FROM recommendations WHERE uid like ${user.uid})`
    const results1 = await db.query(query1)
    console.log(results1)
    return results1.rows
    } else { 
      return []
    }
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
  article,
  translations
}
