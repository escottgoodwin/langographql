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

  const apiurl = `https://lango-rec-${transLang}-${gapi}`

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


async function articleRecommendations(parent, args, context, info) {
  const { db, user } = context
  const { lang } = args
  if (!user){
    throw error
  }

  query2 = `select art_ids from recommendations where uid = '${user.uid}' AND lang = '${lang}' ORDER BY rec_date DESC LIMIT 1`
  const results = await db.query(query2)
  const art_ids = results.rows
  console.log(art_ids)
  query1 = `select * from ${lang}_arts where uid in ${art_ids}`
  
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
  singleLinkRecommendations,
  articleRecommendations,
  article
}
