var express = require('express');
var session = require('express-session'); 
var multer = require('multer');
var cloudinary = require('cloudinary');
var app = express();
var flash = require('connect-flash') // has to be after session bc it depends on session
var bcrypt = require('bcrypt');
var Instagram = require('instagram-node-lib');

var db = require('./models');
var links = [];

app.set('view engine','ejs');

app.use(express.static(__dirname + '/public')); //middleware requests run sequentially down the page
app.use(multer({dest: __dirname+'/uploads'}));
app.use(session({ 
    secret: process.env.secret_session,
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

Instagram.set('client_id', process.env.client_id);
Instagram.set('client_secret', process.env.client_secret);

app.use(function(req, res, next){ 
    req.getUser = function(){
        return req.session.user || false;
    }
    next(); 
})

// What is this doing? From auth lab - make sure it's connected to my alerts
app.use('*', function(req,res,next){
    var user = req.getUser();//Define ALL locals here then move on 
    var alerts = req.flash();
    res.locals.alerts = alerts; //res.locals is a hidden variable - don't need to render it anymore!
    next(); //must call next to move on to the next route
});

app.get('/', function(req,res){
    var user = req.getUser();

    res.render('index',{user:user});

})

app.get('/user/signup', function(req,res){
    var user = req.getUser();

    res.render('user/signup',{user:user});
})

app.get('/user/login', function(req,res){
    var user = req.getUser();

    res.render('user/login',{user:user});
})

// ---- Posting to DB / Find Or Create working / Errors working / Bcrpyt working ---
app.post('/user/signup', function(req,res){
var user = req.getUser();

var myImgPath = req.files.picture.path

    db.user.findOrCreate({
        where: {email: req.body.email},
        defaults: {email: req.body.email, first: req.body.first, last: req.body.last, password: req.body.password, job:req.body.job, about:req.body.about}
    }).spread(function(user, created){

                    req.session.user = {
                        id: user.id,
                        email: user.email,
                        first: user.first
                    };

            cloudinary.uploader.upload(myImgPath,function(result){
                res.redirect('/');
            },{'public_id':'user_'+user.id});
    }).catch(function(error){
        if (error && error.errors && Array.isArray(error.errors)) {
            error.errors.forEach(function(errorItem){
                req.flash('danger',errorItem.message)
            });
        } else {
            console.log(error);
            req.flash('danger','Unknown error');
        }
        res.redirect('/user/signup')
    })
})

// ---- Posting to DB / Find Or Create working / Errors working / Bcrpyt working ---
app.post('/user/login', function(req,res){
var user = req.getUser();

    db.user.find({where: {email:req.body.email}}).then(function(userObj){
        if (userObj){
            bcrypt.compare(req.body.password, userObj.password, function(err,match){
                if (match) {
                    req.session.user = {
                        id: userObj.id,
                        email: userObj.email,
                        first: userObj.first
                    };
                    res.redirect('/');
                } else {
                    req.flash('danger','Invalid password');
                    res.redirect('login');
                }
            });
        } else {
            req.flash('danger','Unknown user');
            res.redirect('login');
        }
    })
})

app.get('/user/logout',function(req,res){
    delete req.session.user;
    req.flash('info','You have been logged out.') //bootstrap needed here in first parameter then message
    res.redirect('/');
});

// ---- Might need to add user id to route? 
app.get('/user/addpost',function(req,res){
    var user = req.getUser();
    res.render('user/addpost', {user:user});
})

// ---- Might need to add user id to route? Or just restrict access to logged in users ----
app.post('/user/addpost',function(req,res){
    var user = req.getUser();
    db.post.create({
        title:req.body.title,
        content:req.body.content,
        neighborhoodId:req.body.neighborhoodId,
        categoryId:req.body.category,
        userId:user.id}) //this is from session
    .then(function(newData){
    })
    res.redirect('/'); //this needs to render the page the user was just on OR their profile with the new post
})

app.get('/user/:id', function(req,res){
    var userId = req.params.id

    var imgId='user_'+userId;
    var imgThumb = cloudinary.url(imgId+'.jpg', {
      width: 100,
      height: 108, 
      crop: 'fill',
      gravity: 'face',
      radius: 'max',
      // effect: 'sepia' 
    });

    db.user.find({where: {id: userId}}).done(function(err,data){
        res.render('user/profile', {data:data, imgThumb:imgThumb});

    })
})

// ---- I'm the neighborhood show page with the instagram pics! ----
app.get('/:id', function(req,res){
    var neighborhoodId = req.params.id

    db.neighborhood.find({where: {id: neighborhoodId}}).then(function(data){

        Instagram.tags.recent({
            name: data.igtag,
            complete:function(linksJSON){
                var links = linksJSON.map(function(element, index){
                    return element.images.standard_resolution.url;
                })

                res.render('neighborhoodshow', {data:data, links:links});
            }
        })
    });

    // db.neighborhood.find({where: {id: neighborhoodId}}).done(function(err, data){
        
}) 


app.get('/:neighid/:tagid', function(req,res){
    res.render('neightagposts');
})


app.listen(3000);