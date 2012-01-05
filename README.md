# Couchblog

A small and beautiful blog generator built on top of [couchdb](http://couchdb.apache.org) and [node.js](http://nodejs.org).

## Installation

    > git clone alejandromg/couchblog
    > cd couchblog

You need to "manually" setup the database through, and config the host, port,username and pass
    
    // inside of dir
    > cd couchdb
    > node seed // if you want to install to a local db
    // or 
    > NODE_ENV=production node seed  // to a remote db

I encourage you to read the variable declaration on `seed.js` to change this. it's ok if end in `OK` doh! then:

    > cd ..
    > node server

Open [http://localhost:8000](http://localhost:8000) and there you go. Go to [http://localhost:8000/login](http://localhost:8000/login) to create posts the default user is: `admin` and pass: `Bienvenido`.

## TODO

- Disqus && Twitter Integration
- Data Graphs about every post
- Delete post from inside
- Manage your posts
- Fastest Preview on posts
- Ability to create post with `embed` code

and more...


# Contributors

-  [Alejandro Morales][2] 

# Licence

MIT 2012


[1]: http://nodehispano.com
[2]: http://twitter.com/_alejandromg