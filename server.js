/* 
 * NodeHispano v0.0.1
 * @author: Alejandro Morales <vamg008@gmail.com>
 * @filename: server.js
 *
*/

var express     = require('express'),
    resourceful = require('resourceful'),
    crypto      = require('crypto'),
    fs          = require('fs'),
    couchdb     = require('felix-couchdb'),
    client      = couchdb.createClient(5984, 'localhost'),
    db          = client.db('blog'),
    users       = client.db('users');


    ConnectCouchDB = require('connect-couchdb')(express);

var store = new ConnectCouchDB({
  name: 'sessions',
  reapInterval: 600000,
  compactInterval: 300000
});
// Shorthand for server + app global process
var app = module.exports.app = process.app =  express.createServer(
  //small hack for make sessions works just fine
  express.bodyParser(),
  express.cookieParser('nhispano'),
  express.session({secret: 'Node Hispano', store: store })
);

app.configure(function(){
  app.use('db', client.db('blog'));
  app.use(express.logger('dev'));
  app.set('views',__dirname+ '/views');
  app.set('view engine','jade');
  app.set('view options',{pretty :true});
  app.use(app.router);
  app.use(express.static(__dirname+'/public'));
  app.use(express.methodOverride());
  app.use(express.favicon());
});
app.dynamicHelpers({
  session: function(req, res) {
    return req.session;
  }
});
var isJSON = function(url) {
  return url.split('.')[1] === 'json'
}
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.get('/',function(req,res){
  res.render('index',{
    date: { 
      now: new Date(),
      month : 'Enero'.substr(0,3),
      day: "01",
      year: "2012"
    },
    title:"Node Hispano"
  });
});
var md5 = module.exports.md5 = function(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}
/*
 * Define user properties
*/
var User = module.exports.user = function(u,n){
  this.username =  u.username || 'anon';
  if (u.name === 'undefined') throw new Error('Necesito un nombre');
  this.name = u.name || null;
  this.email = u.email || null;
  this.contact = u.contact || null;
  this.bio = u.bio || 'Soy '+ this.name ;
  this.posts = u.posts || [];
  this.popular = u.popular || 1;
  if (n){
    this.id = md5(this.name + this.email + this.username); //yeah a long one
    this.salt = Date.now();
    this.password = new Buffer('Bienvenido' + ( '' + Date.now()).substr(-3)).toString('base64'); 
    this.verified = true;
  } else {
    this.id = u.id || null;
    this.salt = u.salt || Date.now();
    this.password = u.password;
  }
  this._id = u._id?u._id: undefined;
  this._rev = u._rev?u._rev:undefined;
  this.id = u.id || '';
  this.level = u.level || 1;
  return this;
}
app.post('/u/new(*)',function(req,res){
  console.log(req.body)
});
app.post('/us/new(*)',function(req,res){
  if (isJSON(req.url) &&req.session.level === 4) {
    if (req.body){
      /*
       * A user has this params
       * 
       { 
         _id: 'alejandromg',
          _rev: '1-45a1cfc7cc8931d888171eb0147a2ddf',
          username: 'alejandromg',
          name: 'Alejandro Morales',
          email: 'vamg008@gmail.com',
          contact: 'http://alejandromorales.co.cc',
          bio: 'Soy Alejandro Morales',
          posts: [],
          popular: 1,
          id: '06750fa4060150f1466c976d7e7e2eb0' 
      }

      */
      var rb       = req.body,
          username = rb.username, 
          ruser = new User(rb,true);
          ruser = couchdb.toJSON(ruser);
      users.getDoc(username, function(error,ok){
        if (error && error.error = 'not_found'){
          users.saveDoc(username, ruser, function(error,ok){
            if (error){
              res.json({code:500, status:error});
            } else {
              res.json({code:200, status:'ok'});
            }
          });
        } else {
            res.json({code:500, status:'Usuario ya existe'});        
        }
      })
    } else {
      res.json({status:"Invalid Request"});
    }
  } else {
    res.json(["No PERMITIDO"])
  }
});

app.get('/admin(*)',function(req,res){
  if (isJSON(req.url)) {
    if (req.session.user_id) {
        res.render('admin/login')
    } else {
      res.json({status:'No available'})
    }
  } else if (req.session.user_id) {
    res.render('admin/index',{
      styles : ["forms.css"],
      user: new User(req.session.user),
      time: Date.now(),
      title:"admin"
    })
  } else {
    res.writeHeader(501, {"Content-type":"text/html"})
    res.end('<h2>No Implementeda, o no tienes permiso GTFO!</h2>')
  }
});

app.post('/b/new',function(req,res){
  var body = req.body;
   /* { 
     fecha: 'Mon Jan 02 2012 23:44:57 GMT-0600 (CST)',
     titulo: 'Chasi',
     tags: 'las.lsa.as',
     contenido: 'Recuerda, si quieres, puedes utilizar markdown (default), si es html empieza la primer linea con <html> para reconocer que es html (no Doctype o algo)\r\n'
     },

     */
  if (req.session.user) {
    db.saveDoc()
  }
  /*
  try {
  var name = md5(req.body.name + Date.now());
  db.saveDoc('my-doc', {awesome: 'couch fun'}, function(er, ok) {
    if (er) {
    res.json(er);
    } else {
      res.end('saved')
    }
  });
  } catch(exc) {
    res.end(exc)
  }*/
  res.json({'status':'No implementeda'});
});

app.post('/login',function(req,res){
    var target = req.body.user,
        u = target.username,
        pass = target.password;
    users.getDoc(u, function(er, doc) {
      if (er) {
        res.json(er);
      } else if (doc.password === pass) {
          req.session.user_id = doc._id;
          req.session._rev = doc._rev;
          req.session.user = doc;
          req.session.username = doc.username;
         if (doc.verified) {
         } else {
         }
          res.redirect('/admin');
      } else {
          res.json({status:'forbidden'})
      }
    });

}); 
app.get('/login',function(req,res){
  console.log(req)
  res.render('sessions/new',{
    redir: req.query.redir  || '',
    token:Date.now(),
    title:"Login"
  });
});
app.get('/logout',function(req,res){
  if (req.session.user) {
    with (req.session) {
      delete user;
      delete _rev;
      delete user_id;
      delete username;
    }
  }
  res.redirect('/');
});
app.listen(process.PORT || 8000);
