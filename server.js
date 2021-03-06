/* 
 * NodeHispano v0.0.1
 * @author: Alejandro Morales <vamg008@gmail.com>
 * @filename: server.js
 *
*/

var cfg = {}
  , couchAuthUrl;

// nunca expongas tus credenciales (siempre usa un config.json o ENV variables)
// en este caso la base de datos es pública por lo tanto no hay necesidad de ocultarlos
if (process.env.NODE_ENV === 'production'){
  cfg =  { 
    host: "nhispano.iriscouch.com",
    port: "80",
    ssl:  false,
    user: "alejandromg",
    pass: "nhispano"
  };  
 couchAuthUrl   = 'http://' +cfg.user + ':' +cfg.pass + '@' + cfg.host + ':' + cfg.port;
}

var express        = require('express'),
    crypto         = require('crypto'),
    fs             = require('fs'),
    url            = require('url'),
    md             = require('node-markdown').Markdown,
    nano           = require('nano')(couchAuthUrl),
    ConnectCouchDB = require('connect-couchdb')(express),
    db             = nano.use('blog'),
    users          = nano.use('users');

var store = new ConnectCouchDB({
  name            : 'sessions',
  reapInterval    : 600000,
  compactInterval : 300000,
  host            : cfg.host || undefined,
  port            : cfg.port || undefined,
  username        : cfg.user || undefined,
  password        : cfg.pass || undefined
});

// Shorthand for server + app global process
var app = module.exports.app = process.app =  express.createServer(
  //small hack for make sessions works just fine
  express.bodyParser(),
  express.cookieParser('nhispano'),
  express.session({ secret: 'Node Hispano', store: store })
);

app.configure(function(){
  app.use('db', db);
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
  session : function(req, res) {
    return req.session;
  },
  sitetitle : function(req,res) {
    return  "Node Hispano";
  },
  disqus : function(req,res){
    return {
      shortname : 'nhispano'
    }
  }
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler({dumpExceptions:true})); 
});

function NotFound(msg){
  this.name = 'NotFound';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}
NotFound.prototype.__proto__ = Error.prototype;

var getMonth = function(m){
  m = (parseInt(m) === NaN) ? m : parseInt(m,10);
  switch (m){
    case 1: case 'Jan': return 'Ene'; break;
    case 2: case 'Feb': return 'Feb'; break;
    case 3: case 'Mar': return 'Mar'; break;
    case 4: case 'May': return 'Abr'; break;
    case 5: case 'May': return 'May'; break;
    case 6: case 'Jun': return 'Jun'; break;
    case 7: case 'Jul': return 'Jul'; break;
    case 8: case 'Aug': return 'Ago'; break;
    case 9: case 'Sep': return 'Sep'; break;
    case 10: case 'Oct':return 'Oct'; break;
    case 11: case 'Nov':return 'Nov'; break;
    case 12: case 'Dec':return 'Dic'; break;
    default: return 'Ene'; break;
  }
}

var prettyTitle = function (title,date) {
  var _rdate = date ||  new Date(),
      // I don't even
      date   = _rdate.toJSON().substr(0,10).split('-').join('')

  return date + '-'+title
  .toLowerCase() 
  .replace(/^\s+|\s+$/g, "") 
  .replace(/[_|\s]+/g, "-") 
  .replace(/[^a-z\u0400-\u04FF0-9-]+/g, "") 
  .replace(/[-]+/g, "-") 
  .replace(/^-+|-+$/g, "")
  .replace(/[-]+/g, "-");
}

var mdRender = function(md){
  return md(md, true);
}

var isJSON = function(url) {
  return url.split('.')[1] === 'json';
}

var md5 = function(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

var normalizeDate = function(d) {
  try {
    var da = d.substr(0,15);
    return {
      year: da.substr(-4),
      day: da.substr(8,2),
      month: getMonth(da.substr(4,3)),
      now: d
    }
  } catch(exc) {
    return {}
  }
}

var normalizeData = function(item){
  var html = item.value[1];
  return {
    id          : item._id || item.id, 
    title       : item.value[0], 
    description : html,
    views       : item.value[2],
    up          : item.value[3],
    down        : item.value[4],
    author : {
      name    : item.value[5] || 'admin',
      contact : item.value[6]
    },
    tags : item.value[7],
    date : normalizeDate(item.value[8] || item.key)
  }
}
var getSortByAuthor = function (author, resp){
  var posts  = [];

  db.view('author','Author', { key : author, descending : true }, function(err,cb) {
   
    if (err) {
      resp(err,null);
    } else if (cb.rows.length === 0 ) {
      resp(new Error('Not_Found'), null);
    } else {
      cb.rows.forEach(function(item){
        posts.push(normalizeData(item));
        if ((cb.rows.length - 1) === cb.rows.indexOf(item)) {
            resp(null, posts);
        }
      });
    }
  });
}


var getLatest =function(resp){
  var posts = [];
  db.view('latest','latest', { limit : 8, descending : true }, function(err,cb) {
    if (err) {
      resp(err)
    } else {
      if (cb.total_rows === 0){
        resp(null, [])
      } else if (cb.rows.length === 0) {
        resp(new Error('not_found'));
      } else {
        cb.rows.forEach(function(item){
          // Normalizar data
          posts.push(normalizeData(item));
          if ((cb.rows.length -1)=== cb.rows.indexOf(item)) {
            resp(null, posts);
          }
        });
      }
    }
  });
}
var getByTag =function(tag,resp){
  var posts =[];
  var url = '/_design/tags/_view/tags';
  db.view('tags','tags',{ key : tag.trim(), limit : 8, descending : true },function(err,cb) {
    if (err) {
      resp(err)
    } else if (cb.rows.length === 0){
        resp(new Error('not_found'));
    } else {
      cb.rows.forEach(function(item){
        // Normalizar data
        posts.push(normalizeData(item));
       if ((cb.rows.length -1)=== cb.rows.indexOf(item)) {
        resp(null, posts);
       }
      });
    }
  });
}


var User = module.exports.user = function(u,n){
  // otra forma de realizarlo, evitando this es mandar el dato como objeto
  this.username =  u.username || 'anon';
  if (u.name === 'undefined') throw new Error('Necesito un nombre');
  this.name = u.name || null;
  this.email = u.email || 'me@example.com';
  this.contact = u.contact || '/';
  this.bio = u.bio || 'Soy '+ this.name ;
  this.posts = u.posts || [];
  this.popular = u.popular || 1;
  if (n){
    this.salt = Date.now();
    this.password = new Buffer('Bienvenido' + ( '' +this.salt).substr(-3)).toString('base64'); 
    this.verified = true;
  } else {
    this.salt = u.salt || Date.now();
    this.password = u.password || null;
    this.verified = u.verified || true;
  }
  this._rev = u._rev ? u._rev:undefined;
  this.level = u.level || 1;
  this._id = u._id? u._id: undefined;
  if (this._rev === undefined) delete this._rev
  if (this._id === undefined) delete this._id
  return this;
}

var buildP = function(password, salt) {
  return md5(password.trim() + (salt + ''));
}

var buildP64 = function(password,salt){
  return new Buffer(password.trim() + ( '' + salt).substr(-3)).toString('base64'); 
}

var updateUser = function(u,c,r){
  /*
  c =>
{ password: 'Bienvenido',
  username: 'alejandromg',
  name: 'Alejandro Morales',
  nopassword: [ '', '' ],
  contact: 'http://alejandromorales.co.cc',
  email: 'vamg008@gmail.com',
  bio: 'Soy Yo' }

  */
  var user = new User(u);
  // Son distintos los nuevos passwords?
       if (c.nopassword[0].trim() !== c.nopassword[1].trim()){
            c.nopassword[0] = c.nopassword[1] = user.password;
          } 
          // El nuevo password es una empty string?
  else if (c.nopassword[0].trim() === '') { 
         c.nopassword[0] = user.password; } 
         // el usuario esta vacio
  else if (c.username.trim() === '') { c.username = user.username;}
        // el email vacio
  else if (c.email.trim() === '') { c.email = user.email; } 
        // Bio vacio
  else if (c.bio.trim()=== '' && c.bio.trim() !== user.bio.trim()){ 
            c.bio = c.bio }
  else    {  c.bio = user.bio || 'Soy ' + use.name;}
  // Siempre priorizar los datos previos a los nuevos...
   user.password = c.nopassword[1] === c.nopassword[0] ? buildP(c.nopassword[1]) : user.password;
   user.username = c.username === user.username ? user.username :c.username;
   user.contact  = c.contact === user.contact ? user.contact :c.contact;
   user.email    = c.email === user.email ? user.email :c.email;
   user.bio      = c.bio === user.bio ? user.bio:c.bio;
   user.name     = c.name.trim()=== ''?user.name : c.name;
  try {
    users.insert(user, function(error, resp){
      if (error) {
        r(error,null);
      } else {
        r(null, resp);
      }
    });
  } catch(excp){
    r(excp, null);
  }
}

var giveMeLabels = function giveMeLabels(text) {
  if (!text) return [];
  /* split (s) para espacios*/
  var tags =[]
  text =  text.split(',')
  text.forEach(function(tag){
    tags.push(tag.trim());
  });
  return tags
}

var Post = function(p,req,n) {
  this.date = p.fecha;
  this._id = this.id = prettyTitle(p.titulo);
  this.title = p.titulo;
  // it's new?
  if (n) {
    this.tags = giveMeLabels(p.tags || 'sin tags'); // array with tags
    // try better to encode to html instead of render on "every" request
    // seems legit, plus I think I'm saving some ms.
    try {
      this.content = md(p.contenido,true);
    } catch (excp) {
      console.log(excp);
      this.content = p.contenido;
    }
  } else {
    this.tags = p.tags || 'sin tags';
    this.content = p.content || 'No content'
  }

    var u = req.session.user;
    u.posts.push(this.id);
    this.author = p.author || { username : u.username,
      posts:u.posts,
      contact: u.contact,
      bio:u.bio,
      name:u.name }
    this.description = p.description || this.content.substr(0,250);
    this.up = p.up || 1;
    this.views = p.views || 0;
    this.down = p.down || 0;
    this.percentil = (this.up - this.down);
} 

app.all('*',function(req,res,next){
  if (res.statusCode === 500){
    throw new Error();
  } 
  next()
});

app.get('/',function(req,res){
  getLatest(function(err,data){
    if (err) {
      res.redirect('/500');
    } else {
      res.render('index',{
        date: { 
          now: new Date(),
          month : 'Enero'.substr(0,3),
          day: "01",
          year: "2012"
        },
        posts: data,
        title:"Node Hispano"
      }); 
    }
  });
});

app.get('/tag/:tag',function(req,res){
  var tag = req.params.tag;
  getByTag(tag, function(error,data){
    if(error && error.message === 'not_found'){
      res.redirect('/404');
    } else if (error) {
      res.redirect('/500')
    } else {
      res.render('posts/tags',{
        date: { 
          now: new Date(),
          month : 'Enero'.substr(0,3), // TODO: Delete this
          day: "01",
          year: "2012"
        },
        posts: data,
        title:"Node Hispano",
        tag:tag
      }); 
    }
  });
});

app.get('/user/:user',function(req,res){
  getSortByAuthor(req.params.user, function(err,resp){
    if (err && err.message === 'Not_Found') {
      res.redirect('/400');
    } else if (err) {
      res.redirect('/500');
    } else {
      console.log(resp)
      res.render('posts/tags',{
        date: { 
          now   : new Date(),
          month : 'Enero'.substr(0,3), // TODO: Delete this
          day   : "01",
          year  : "2012"
        },
        posts : resp,
        title : "Node Hispano",
        tag   : req.params.user,
        rtag  : false
      }); 
    }
  });
});

app.post('/u/new(*)',function(req,res){
  if (req.session.user.level === 4) {
    if (req.body){
      var rb       = req.body
        , username = rb.username
        , ruser    = new User(rb,true)
        ;
      users.view('username','auth',{key:username,limit:1}, function(error,ok){
        if (ok && ok.offset === 1){
          users.insert(ruser, function(error,ok){
            if (error){
              res.json({code:500, status:error},500);
            } else {
              res.json({code:200, status:'ok'});
            }
          });
        } else {
            res.json({code:500, status:'Usuario ya existe'},500);
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
      styles : ["forms.css","ui.css"],
      js:["md.js"],
      user: new User(req.session.user),
      time: Date.now(),
      title:"admin"
    })
  } else {
    res.writeHeader(501, {"Content-type":"text/html"})
    res.end('<h2>No Implementeda GTFO!</h2>')
  }
});

app.post('/b/new',function(req,res){
  var body = req.body;
  try {body.titulo = body.title.trim()}catch(ex){}
  if (body.titulo !== 'undefined' && body.titulo === '') {
    res.json({status:'Error', info:'titulo vacio'})
  } else if (body.contenido.trim() === ''){
    res.json({status:'Error', info:'Contenido vacio'})
  }else{
    var post = new Post(body,req,true);
    if (isJSON(req.url)){
      res.json({'status':'No implementeda'});
    } else if (req.session.user_id) {
      db.insert(post, function(err,data){
        if (err) {
          res.json(err);
        } else {
          res.redirect('/' + data.id)
        }
      })
    } else {
      res.statusCode(401);
      res.json({status:'forbidden'});
    }
}
});

app.post('/login',function(req,res){
    var target = req.body.user,
        u = target.username,
        pass = target.password,
        ready = false;
      function checkPass(pass,salt,b){
        if (!b) {
          return new Buffer(pass + ( '' +salt).substr(-3)).toString('base64'); 
        } else {
          return md5(pass + salt);
        }
      }
    users.view('username','auth',{key:u,limit:1}, function(er, doc) {
      try { doc = doc.rows[0].value; } catch(excp) {}
      if (er) {
        res.json(er);
      } else if (doc.verified && (doc.password === checkPass(pass, doc.salt) 
                || doc.password === pass) ) {
        req.session.user_id = doc._id;
        req.session.username = doc.username;
        with (doc) {
          delete  salt;
          delete password;
          delete popular; 
          delete _rev;
          delete _id;
          delete verified;
        }
        req.session.user = doc;
        res.redirect('/admin');
      } else {
        res.json({status:'forbidden, bad auth'})
      }
    });

}); 
app.get('/login',function(req,res){
  if (req.session.user_id) {
    res.redirect('/admin');
  } else {
    res.render('sessions/new',{
      redir: req.query.redir  || '',
      token:Date.now(),
      title:"Login",
      row: true
    });
  }
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
app.post('/u/update(*)',function(req,res){
var c   = req.body
  , sta = ''
  , inf = ''
  , s   = req.session.user;

  if (c.nopassword[0] !== c.nopassword[1]) {
     res.json({status:'Error',info:'nuevos password no concuerdan'});
  } else if (buildP64(c.password,s.salt) === s.password 
          || buildP(c.password,s.salt) === s.password 
          || c.password === s.password) {
    updateUser(req.session.user, c, function(err,resp){
      if (err) {
        sta = 'Error'; 
        inf = err;
      } else {
        sta = 'ok'; 
        inf ='Updated';
        users.get(resp.id, function(e,c){
          req.session.user_id = c._id;
          req.session._rev = c._rev;
          req.session.user = c;
          req.session.username = c.username;
        });
      }
      res.json({status:sta, info:inf})
    })
  } else {
    res.json({status:'Error',info:'Tu password actual no concuerda'});
  }
});

process.on('uncaughtException', function(excp, req,res) {
  console.log(excp.message)
  console.log(excp.stack)
});

app.get('/404', function(req, res){
   res.writeHeader(404,{"Content-type":"text/html"});
  res.write('<title>404 No Encontrado - Node Hispano </title>')
  res.write('<style>html{background-image: url(/images/bg.png);}');
  res.write('div{text-align:center;padding-top:200px;width:100%;font-size:2em;}')
  res.write('h4 {font-family:arial; text-shadow:1px 1px #fff;color:#444}')
  res.write('#footer { font-family: arial;font-size: 0.9em;} a{text-decoration:none}</style>');
  res.write('<div><img src="http://nodejs.org/logos/nodejs.png">');
  res.write('<h4>404 - No Encontrado</h4></div>');
  res.write('<div id="footer"><a href="/">Node Hispano</a> &hearts; node.js</h4></div>');
  res.end();
});

app.get('/500', function(req, res){
  res.writeHeader(500,{"Content-type":"text/html"});
  res.write('<title>500 Internal Server Error - Node Hispano </title>')
  res.write('<style>html{background-image: url(/images/bg.png);}');
  res.write('div{text-align:center;padding-top:200px;width:100%;font-size:2em;}')
  res.write('h4 {font-family:arial; text-shadow:1px 1px #fff;color:#444}')
  res.write('#footer { font-family: arial;font-size: 0.9em;} a{text-decoration:none}</style>');
  res.write('<div><img src="http://nodejs.org/logos/nodejs.png">');
  res.write('<h4>500 - Internal Server Error</h4></div>');
  res.write('<div id="footer"><a href="/">Node Hispano</a> &hearts; node.js</h4></div>');
  res.end();
});
app.error(function(err, req, res, next){
  if (err instanceof NotFound) {
     res.redirect('/404')
  } else {
    if (err) {
      res.end('500 Internal server Error \n' + err )
    } else {
      next();
    }
  }
});
if (process.env.NODE_ENV=== 'production'){
  process.PORT = 13412;
}

app.get('/*',function(req,res,next){
  // parse integer and see if it's a date the toString and check length
  var checkUrl =0,id,checkId = 0,rdate;
  // BUg in production see 0d0ff8e for last sane version
  try { 
     checkUrl = req.url.split('/').length;
     id       = req.url.split('/')[1];
     checkId  = parseInt(id.substr(0,8)).toString().length;
     rdate    = id.substr(0,8),
     rdate    = {
        now   : rdate,
        year  : rdate.substr(0,4), 
        month : getMonth(rdate.substr(-4).substr(0,2)),
        day   : rdate.substr(-2),
      }
  rdate.date = rdate.day+'-'+ rdate.month + '-'+rdate.year;
  } catch(excp) { }
  if ( checkId === 8 && checkUrl === 2) {
    db.get(id,function(error,post){
      if (error){
        res.json({status:'not_found'});
      } else { 
        post.views += 1;
        db.insert(post,function(err,b){
            if (err) console.log(err);
            else return true; 
        });
        res.render('posts/index',{
          bodyContent : post.content,
          post        : post,
          date        : rdate
        });
      }
    });
  } else {
    var u =[];
    try { u = req.url.split('.');} catch(excp) {}
    if (u[u.length - 1] === req.url) {
      res.redirect('/404')
      // Yes, I'm to lazy to generate a new [dot]jade file to a 404 error
    } else {
      next();
    }
  } 
});


app.listen(process.PORT || 8000, function(){
  console.info('Kennedy: Puerto: %s \nKennedy: Ambiente: %s', app.address().port , process.env.NODE_ENV);  
});
