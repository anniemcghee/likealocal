var express = require('express');
var session = require('express-session'); 
var multer = require('multer');
var cloudinary = require('cloudinary');
var app = express();
var flash = require('connect-flash') 
var bcrypt = require('bcrypt');
var Instagram = require('instagram-node-lib');

var db = require('./models');
var links = [];

app.set('view engine','ejs');

app.use(express.static(__dirname + '/public')); 
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

app.use('*', function(req,res,next){
    var alerts = req.flash();
    res.locals.alerts = alerts; 
    next(); 
});

// --- This is the homepage ---
app.get('/', function(req,res){
    var user = req.getUser();
    console.log("THE USER ID IS: "+user)

    db.neighborhood.findAll({order: 'name ASC'}).success(function(neighborhood){
        res.render('index', {neighborhood:neighborhood, user: user});
    })
})

// --- This is the signup page ---
app.get('/user/signup', function(req,res){
var user = req.getUser();
if(user){
    res.redirect('/');
} else {
    db.neighborhood.findAll({order: 'name ASC'}).success(function(neighborhood){
        res.render('user/signup', {user: user, neighborhood:neighborhood});    
        })
    }
})

// --- This is the login page ---
app.get('/user/login', function(req,res){
    var user = req.getUser(); 
console.log(user);
if (user){
    res.redirect('/');
} else {
    db.neighborhood.findAll({order: 'name ASC'}).success(function(neighborhood){
        res.render('user/login', {user: user, neighborhood:neighborhood});   
        })
    }
})

// --- This is the signup post ---
app.post('/user/signup', function(req,res){

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
        },{'public_id': 'user_'+user.id});
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

// --- This is the login post ---
app.post('/user/login', function(req,res){

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

// --- This is the logout function - no ejs file ---
app.get('/user/logout',function(req,res){
    delete req.session.user;
    req.flash('info','You have been logged out.')
    res.redirect('/');
});

// --- This is the Add Post form ---
app.get('/user/addpost',function(req,res){
    var user = req.getUser();

    if (user) {
        console.log("THE USER NAME IS: "+user)
        db.neighborhood.findAll({order: 'name ASC'}).success(function(neighborhood){
            res.render('user/addpost', {user: user, neighborhood:neighborhood});
        })
    } else {
        res.redirect('/user/login');
    }
})

// --- This is the post from the Add Post form ---
app.post('/user/addpost',function(req,res){
    var user = req.getUser();

    if (user) {
        db.post.create({
            title:req.body.title,
            content:req.body.content,
            neighborhoodId:req.body.neighborhoodId,
            categoryId:req.body.category,
            userId:user.id}) 
        .then(function(newData){
            res.redirect('/user/myprofile'); 
        }).catch(function(error){
            if (error && error.errors && Array.isArray(error.errors)) {
                error.errors.forEach(function(errorItem){
                    req.flash('danger',errorItem.message)
                });
            } else {
                console.log(error);
                req.flash('danger','Unknown error');
            }

            res.redirect('/user/addpost');
        })
    }else {
        res.redirect('/user/login');
    }
})

// --- This is a logged in user's profile ---
app.get('/user/myprofile', function(req,res){

    var user = req.getUser();

    if (user){
        var imgId='user_'+ user.id;
        var imgThumb = cloudinary.url(imgId+'.jpg', {
            width: 260,
            height: 218, 
            crop: 'fill',
            gravity: 'face',
            border: '3px_solid_rgb:000'
        });

        db.user.find({where: {id: user.id}}).then(function(userData){
            db.post.findAll({where: {userId: user.id}}).then(function(postData){ 
                db.neighborhood.findAll({order: 'name ASC'}).success(function(neighborhood){   
                    res.render('user/profile', {userData:userData, postData:postData, imgThumb:imgThumb, user:user, neighborhood:neighborhood});
                })
            })
        }) 
    };
})

// --- This is any user's profile ---
app.get('/user/:id', function(req,res){

    var user = req.getUser();

    var userId = req.params.id

    var imgId='user_'+userId;
    var imgThumb = cloudinary.url(imgId+'.jpg', {
        width: 260,
        height: 218, 
        crop: 'fill',
        gravity: 'face',
        border: '3px_solid_rgb:000'
    });

    db.user.find({where: {id: req.params.id}}).then(function(userData){
        db.post.findAll({where: {userId: req.params.id}}).then(function(postData){
            db.neighborhood.findAll({order: 'name ASC'}).success(function(neighborhood){   
                res.render('user/profile', {userData:userData, postData:postData, imgThumb:imgThumb, neighborhood:neighborhood, user:user});
            })
        })    
    }) 
})

// --- This is the neighborhood show page ---
app.get('/:id', function(req,res){
    var user = req.getUser();
    var neighborhoodId = req.params.id

    db.neighborhood.find({where: {id: neighborhoodId}}).then(function(neighborhoodData){

        Instagram.tags.recent({
            name: neighborhoodData.igtag,
            complete:function(linksJSON){
                var photoLinks = linksJSON.map(function(element, index){
                    return element.images.standard_resolution.url;
                })
                db.neighborhood.findAll({order: 'name ASC'}).success(function(neighborhood){ 
                    res.render('neighborhoodshow', {neighborhoodData:neighborhoodData, photoLinks:photoLinks, neighborhood:neighborhood, user:user});
                })
            }
        })
    });
}) 

// --- This is the neighborhood posts page by tag ---
app.get('/:neighid/:tagid', function(req,res){
    var user = req.getUser();

    db.category.find({where: {id: req.params.tagid}}).then(function(categoryData){
        db.neighborhood.find({where: {id: req.params.neighid}}).then(function(neighborhoodData){
            db.post.findAll({where: {neighborhoodId: req.params.neighid, categoryId: req.params.tagid}}).then(function(postData){
                if(postData[0] === undefined){
                    db.neighborhood.findAll({order: 'name ASC'}).success(function(neighborhood){  
                        res.render('neightagposts',{postData:postData, categoryData:categoryData, neighborhood:neighborhood, neighborhoodData:neighborhoodData, user:user})
                    })
                }
                db.user.find({where: {id: postData[0].userId}}).then(function(userData){
                    db.neighborhood.findAll({order: 'name ASC'}).success(function(neighborhood){   
                        res.render('neightagposts',{postData:postData, userData:userData, categoryData:categoryData, neighborhood:neighborhood, neighborhoodData:neighborhoodData, user:user});
                    })
                })   
            })
        })
    })
})

app.use(function(req, res, next){
  res.send(404, "Sorry that page doesn't exist.");
});



app.listen(process.env.PORT || 3001)
