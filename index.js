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
app.use(session({ //don't forget the weird parentheses
    secret:'secret',
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
app.get('*', function(req,res,next){ //Define ALL locals here then move on 
    var alerts = req.flash();
    res.locals.alerts = alerts; //res.locals is a hidden variable - don't need to render it anymore!
    next(); //must call next to move on to the next route
});

app.get('/', function(req,res){
    var user = req.getUser();

    res.render('index',{user:user});

})

app.get('/user/signup', function(req,res){
    res.render('user/signup');
})

app.get('/user/login', function(req,res){
    res.render('user/login');
})

// ---- Posting to DB / Find Or Create working / Errors working / Bcrpyt working ---
app.post('/user/signup', function(req,res){

var myImgPath = req.files.picture.path

    db.user.findOrCreate({
        where: {email: req.body.email},
        defaults: {email: req.body.email, first: req.body.first, last: req.body.last, password: req.body.password, job:req.body.job, about:req.body.about}
    }).spread(function(data, created){
            cloudinary.uploader.upload(myImgPath,function(result){
                res.send(result);
                },{'public_id':'user_'+userId});
        res.redirect('/');
    }).catch(function(error){
        if (error && error.errors && Array.isArray(error.errors)) {
            error.errors.forEach(function(errorItem){
                req.flash('danger',errorItem.message)
            });
        } else {
            req.flash('danger','Unknown error');
        }
        res.redirect('/user/signup')
    })
})

// ---- Posting to DB / Find Or Create working / Errors working / Bcrpyt working ---
app.post('/user/login', function(req,res){
    db.user.find({where: {email:req.body.email}}).then(function(userObj){
        if (userObj){
            bcrypt.compare(req.body.password, userObj.password, function(err,match){
                if (match === true) {
                    req.session.user = {
                        id: userObj.id,
                        email: userObj.email,
                        name: userObj.name
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

app.get('/user/:id', function(req,res){
    var userId = req.params.id

    var imgId='user_'+userId;
    var imgThumb1 = cloudinary.url(imgId+'.jpg', {
      width: 90,
      height: 98, 
      crop: 'fill',
      gravity: 'face',
      radius: 'max',
      effect: 'sepia' 
    });

    db.user.find({where: {id: userId}}).done(function(err,data){
            res.render('user/profile', {data:data, picture:imgThumb1});

    })
})


// ---- Might need to add user id to route? 
app.get('/user/addpost',function(req,res){

    res.render('user/addpost');
})

// ---- Might need to add user id to route? Or just restrict access to logged in users ----
app.post('/user/addpost',function(req,res){
    db.post.create({title:req.body.title,content:req.body.content,neighId:req.body.neighborhood,categoryId:req.body.category}).then(function(newData){

    })
})

app.get('/:id', function(req,res){
    var neighborhoodId = req.params.id

    var gotTags = function(data) {
        links = data.map(function(element,index){
            return element.images.standard_resolution.url;
            })
        }

    db.neighborhood.find({where: {id: neighborhoodId}}).then(function(data){
        // Instagram.tags.recent({
        //     name: data.igtag,
        //     complete: gotTags
        //     })
        Instagram.tags.recent({
            name: data.igtag,
            complete:function(locations){
            console.log("THE LINKS ARE: ", locations);
            res.render('neighborhoodshow', {data:data});
        }
        })
        });

    // db.neighborhood.find({where: {id: neighborhoodId}}).done(function(err, data){
        
    }) //app.get close


app.get('/:neighid/:tagid', function(req,res){
    res.render('neightagposts');
})


app.listen(3000);