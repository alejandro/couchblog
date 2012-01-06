/*
 * Couchblog 
 * @author : Alejandro Morales <vamg008@gmail.com>
 * @date: 5-ene-2012
 * @name: seed.js
 * @licence: MIT
 *
*/

//
// Be sure that you have already modify the config.js file
//

var cfg          = {
                     host:'localhost',
                     port:5984
                   },
    couchAuthUrl = cfg.host,
    config       = require('./config');

if (process.env.NODE_ENV==='production') {
   cfg          = config.db;
   couchAuthUrl = 'http://' +cfg.user + ':' + cfg.pass + '@' + cfg.host + ':' + cfg.port;
}

var cnfg         = config.user,
    nano         = require('nano')(couchAuthUrl),
    toSeed       = ['blog','users','sessions'],
    ready        = [];

console.log('\n\n\033[90m[seed]  : Solamente ejecuta este archivo una vez \033[39m' )
var seedDatabase = function (){
  nano.db.list(function(err,res){
    if (err) {
      throw new Error('No se ha podido configurar la base de datos')
    } else {
      toSeed.forEach(function(db){
        if (res.indexOf(db) !== -1) {
          console.log('[seed]  : Instalando =>' + db);
          ready.push(db)
        } else {
          console.log('[seed]  : Instalando =>' + db);
          nano.db.create(db)
          ready.push(db)
        }
        if ((toSeed.length -1)=== toSeed.indexOf(db)) {
          if (ready.length === toSeed.length) {
            console.log('[seed]  : Guardando vistas');
              seedViews(toSeed);
          } else {
            seedDatabase();
          }
        }
      });
    }
  })
}
var views = { 
    "blog": [
      {
       "_id": "_design/tags",
       "language": "javascript",
       "views": {
           "tags": {
               "map": "function(doc) {  \n  "+
                      "  var tag,key;\n "+
                      "  for (tag in doc.tags) {\n   "+
                      "    if (doc.description){\n "+
                      "      key= [doc.title, doc.description,doc.views,doc.up,"+
                      "doc.down,doc.author.name, doc.author.username,doc.tags,doc.date]\n"+
                      "    } else {\n    "+
                      "      key = [doc.title,'',doc.views,doc.up,doc.down,"+
                      "doc.author.name, doc.author.username,doc.tags,doc.date]\n "+
                      "    }\n"+
                      "   emit(doc.tags[tag], key)\n "+
                      " }\n"+
                      "}"
           }
        }
      },
      {
       "_id": "_design/latest",
       "language": "javascript",
       "views": {
           "latest": {
               "map": "function(doc) {\n"+
                      "  var key;\n"+
                      "  if (doc.description) {\n"+
                      "\t  key =  [doc.title, doc.description,doc.views,"+
                      "doc.up,doc.down,doc.author.name, doc.author.username,doc.tags] \n"+
                      "  } else {\n"+
                      "    key = doc.title\n"+
                      "  }\n"+
                      "  emit(doc.date, key);\n"+
                      "}"
           }
       }
    },
    {
       "_id": "_design/author",
       "language": "javascript",
       "views": {
           "Author": {
               "map": "function(doc) {\n" +
                      "value= [doc.title, doc.description,doc.views,doc.up," +
                      "doc.down,doc.author.name, doc.author.username,doc.tags,"+
                      "doc.date,doc._id];\n emit(doc.author.username, value);\n" + 
                      "}"
           }
       }
    }
  ],
  "users": [
    {
     "_id": "_design/username",
     "language": "javascript",
     "views": {
         "auth": {
             "map": "function(doc) {\n  emit(doc.username, doc);\n}"
         }
      }
    }
  ]
}
var seedViews = function(dbs){
  dbs.forEach(function(db){
    if (views[db] !== undefined){ 
      var temp = nano.use(db);
      views[db].forEach(function(view){
        temp.insert(view, function(error, resp){
          if (error && error.message !== 'Document update conflict.') {
            if (error.message === 'no_db_file') {
              nano.db.create(db);
              seedViews([db]);
             } else  throw error;
          }
        });
      });
    } 
     if ((dbs.length -1)=== dbs.indexOf(db)) {
      console.log('\033[96m[seed]  : Vistas y BDD guardadas\033[39m')
      setDefaultUser();
    }
  });
}
var cd =0;
var setDefaultUser = function(){
  if (cd === 0) {
    cd += 1;
     var duser = 
     {
       "username":  cnfg.user,
       "name":  cnfg.name,
       "email": cnfg.email,
       "contact": cnfg.contact,
       "bio": "Soy " + cnfg.name, 
       "posts": [],
       "popular":1, 
       "level": 4,
       "salt": 1325556595339,
       "password": "QmllbnZlbmlkbzMzOQ==",
       "verified": true
    }
    nano.use('users').view('username','auth',{key:duser.username}, function(e,r){
      if ( r && r.error === 'not_found') {
        nano.use('users').insert(duser,function(err,resp){
          if (err && err.message !== 'Document update conflict.') {
            console.log('[seed]  : User No saved ' + err.message)
          } else {
            console.log('[seed]  : User saved')
            defaultPost();
          }
        });
      } else {
         console.log('[seed]  : User saved')
         defaultPost();
      }
    });
  }
}
var defaultpost = {
   "_id": "20120104-hola-mundo",
   "date": new Date(),
   "id":  "20120104-hola-mundo",
   "title": "Hola Mundo",
   "tags": [
       "hola mundo"
   ],
   "content": "<h4>Default Post</h4><p>Este puede estar escrito en" +
              "<a href='http://daringfireball.net/projects/markdown)'> markdown</a>"+
              " o no </p>",
   "author": {
       "username": cnfg.user,
       "posts": [
       "20120104-hola-mundo"
       ],
       "contact": cnfg.contact,
       "bio": "Soy "+ cnfg.name,
       "name": cnfg.name
   },
   "description":"<h4>Default Post</h4><p>Este puede estar escrito en" +
              "<a href='http://daringfireball.net/projects/markdown)'> markdown</a>",
   "up": 1,
   "views": 5,
   "down": 0,
   "percentil": 1
}
var defaultPost = function(){
  nano.use('blog').insert(defaultpost,function(err,resp){
    if (err && err.message !== 'Document update conflict.') {
      console.log('[seed]  : Error saving default post')
      console.log('\033[96m[seed]  : NOT OK\033[39m\n\n')
    } else {
      console.log('[seed]  : Default Post Saved')
      console.log('\033[96m[seed]  : OK\033[39m\n\n')
    }
  });
}

// Sembrar Basededatos
seedDatabase()