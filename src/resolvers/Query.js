async function articleRecommendations(parent, args, context, info) {
  const { db, user } = context
  const { lang } = args
  if (!user){
    throw error
  }

  query2 = `select recs from recommendations where uid = '${user.uid}' AND lang = '${lang}' ORDER BY rec_date DESC LIMIT 1`
  const results = await db.query(query2)
  const art_ids = results.rows

  query1 = `select * from ${lang}_arts where art_id in ${art_ids}`
  
  query3 = `select * from ${lang}_arts where uid in (SELECT uid FROM recommendations WHERE uid like ${user.uid})`
  const results1 = await db.query(query1)
  return results1.rows
}

async function article(parent, args, context, info) {
  const { lang, artId } = args
  const { db } = context
  query2 = `select * from ${lang}_arts where art_id = '${artId}'`
  const results = await db.query(query2)
  return results.rows[0]
  
}


module.exports = {
  articleRecommendations,
  article
}
