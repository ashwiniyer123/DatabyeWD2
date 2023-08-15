const express = require('express');
const bcrypt = require('bcrypt');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  title: {
    type: String,
    required: true,

  },
  purpose: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true
  },
});

const Chat = mongoose.model('Chat', chatSchema);

// express app
const app = express();

// connect to mongodb & listen for requests
const dbURI = "mongodb+srv://ashwinmiyer:letstry1423@cluster0.p9mowdw.mongodb.net/";

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => app.listen(3000))
  .catch(err => console.log(err));

// register view engine
app.set('view engine', 'ejs');

// middleware & static files

app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

app.get('/', (req, res) => {
  res.render('signup-login')
  })

app.post('/sign-up', (req, res) => {
  let info = req.body;
  let username = info.username;
  let password = info.password;
  //insert connection to MongoDB
  ((err, result) => 
    if (err) {
      console.log(err);
    } else 
      if (result.length > 0) {
        res.end('User exists');
      } else {
        bcrypt.genSalt(secure, function (err, salt) {
          bcrypt.hash(password, salt, function (err, hash) 
            //connection to MongoDB   
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                res.redirect('/login');
              }
            })
        })
      })
})
      



app.get('/login', (req, res) => {
  let msg = req.query.msg || '';
  res.render('login', { page: 'login', msg })
})

app.post('/login', (req, res) => {
  let info = req.body;
  let username = info.username;
  let password = info.password;
  //insert connection to MongoDB
  ((err, result) => {
    let id;
    if (!err) {
      if (result.length === 0) {
        res.redirect('/login?msg=User does not exist');
      } else {
        id = result[0].user_id;
        let hashedPwd = result[0].password;
        bcrypt.compare(password, hashedPwd, (err, result) => {
          if (result) {
            // user = username;
            req.session.user = username;
            req.session.id = id;
            res.redirect('/chats')
          } else {
            res.end('Username and password do not match!');
          }
        })
      }
    }
  })
})

app.get('/about', (req, res) => {
  res.render('about');
});


app.get('/chats/create', (req, res) => {
  res.render('create');
});

app.get('/chats', (req, res) => {
  Chat.find().sort({ createdAt: -1 })
    .then(result => {
      res.render('index', { chats: result });
    })
    .catch(err => {
      console.log(err);
    });
});

app.post('/chats', (req, res) => {

  const chat = new Chat(req.body);

  chat.save()
    .then(result => {
      res.redirect('/chats');
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/chats/:id', (req, res) => {
  const id = req.params.id;
  Chat.findById(id)
    .then(result => {
      res.render('details', { chat: result, title: 'Chat Details' });
    })
    .catch(err => {
      console.log(err);
    });
});

app.delete('/chats/:id', (req, res) => {
  const id = req.params.id;

  Chat.findByIdAndDelete(id)
    .then(result => {
      res.json({ redirect: '/chats' });
    })
    .catch(err => {
      console.log(err);
    });
});

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});