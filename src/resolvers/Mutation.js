async function signup(parent, args, context, info) {
  const { db, fb } = context
  const { email, password, name, nativeLang } = args
  const signUpDate = new Date()

  fb.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    
    var errorCode = error.code;
    var errorMessage = error.message;
    return { message:'Error signing up!' }
  })
  var user = firebase.auth().currentUser;
  const insertText = 'INSERT INTO users(uid, email, name, native_lang, created_at,last_seen) VALUES ($1, $2, $3, $4, $5, $6)'
  const { rows } = await db.query(insertText, [user.uid, email, name, nativeLang, signUpDate, signUpDate])

  user.sendEmailVerification().then(function() {
    // Email sent.
  }).catch(function(error) {
    return { message:'Error signing up!' }
  });
  fb.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    // An error happened.
  });
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
  signup,
  login,
  logout,
  log,
  updateUser,
}
