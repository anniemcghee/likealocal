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

// --- This is deploying session and alerts on all gets and posts --- is user var an issue?
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
    var user = req.getUser(); // ---- I want session to know that signup is only available to users NOT logged in
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
    console.log(user);// ---- I want session to know that signup is only available to users NOT logged in
    if (user){
        res.redirect('/');
    } else {
        db.neighborhood.findAll({order: 'name ASC'}).success(function(neighborhood){
            res.render('user/login', {user: user, neighborhood:neighborhood});   
        })
    }
})

// ---- Posting to DB / Find Or Create working / Errors working / Bcrpyt working / Img working ---
// ---- I want this to redirect to the user's complete profile page ----
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

// ---- Posting to DB / Find Or Create working / Errors working / Bcrpyt working ---
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

// ---- I want this to only appear for logged in users ----
app.get('/user/logout',function(req,res){
    delete req.session.user;
    req.flash('info','You have been logged out.')
    res.redirect('/');
});

// ---- I want this to only be an option for logged in users ---- 
app.get('/user/addpost',function(req,res){
    var user = req.getUser();

    if (user) {
        console.log("THE USER NAME IS: "+user)
        db.neighborhood.findAll({order: 'name ASC'}).success(function(neighborhood){
            res.render('user/addpost', {user: user, neighborhood:neighborhood});
        })
    } else {
        res.redirect('/user/login')  
    }
})

// ---- Selector forms need to be in a loop to DRY it up - but otherwise it's working 
app.post('/user/addpost',function(req,res){
    var user = req.getUser();

    if (user) {
        db.post.create({
            title:req.body.title,
            content:req.body.content,
            neighborhoodId:req.body.neighborhoodId,
            categoryId:req.body.category,
            userId:user.id}) //this is from session
        .then(function(newData){
            res.redirect('/user/myprofile'); //this needs to render the page the user was just on OR their profile with the new post
        })
    }else {
        res.redirect('/user/login');
    }
})

app.get('/user/myprofile', function(req,res){

    var user = req.getUser();

    if (user){
        var imgId='user_'+ user.id;
        var imgThumb = cloudinary.url(imgId+'.jpg', {
          width: 100,
          height: 108, 
          crop: 'fill',
          gravity: 'face',
          radius: 'max',
          // effect: 'sepia' 
        });

        db.user.find({where: {id: user.id}}).then(function(data){
            // res.send(user)
            db.post.findAll({where: {userId: user.id}}).then(function(postData){ 
            db.neighborhood.findAll({order: 'name ASC'}).success(function(neighborhood){   
                res.render('user/profile', {data:data, postData:postData, imgThumb:imgThumb, user:user, neighborhood:neighborhood});
            })
        })
        }) 
    };
})
//     } else {
//             res.redirect("/");
//     }


// ---- This works but not in the link yet - only when typed in directly. Need to link to it from POSTS ---
// ---- Also need to add posts by this user ----
app.get('/user/:id', function(req,res){

    var user = req.getUser();

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

        db.user.find({where: {id: req.params.id}}).then(function(data){
            db.post.findAll({where: {userId: req.params.id}}).then(function(postData){
                db.neighborhood.findAll({order: 'name ASC'}).success(function(neighborhood){   
                res.render('user/profile', {data:data, postData:postData, imgThumb:imgThumb, neighborhood:neighborhood, user:user});
                })
            })    
        }) 
    })

// ---- I'm the neighborhood show page with the instagram pics! ----
app.get('/:id', function(req,res){
    var user = req.getUser();
    var neighborhoodId = req.params.id

    db.neighborhood.find({where: {id: neighborhoodId}}).then(function(data){

        Instagram.tags.recent({
            name: data.igtag,
            complete:function(linksJSON){
                var links = linksJSON.map(function(element, index){
                    return element.images.standard_resolution.url;
                })
                db.neighborhood.findAll({order: 'name ASC'}).success(function(neighborhood){ 
                res.render('neighborhoodshow', {data:data, links:links, neighborhood:neighborhood, user:user});
            })
            }
        })
    });

    // db.neighborhood.find({where: {id: neighborhoodId}}).done(function(err, data){
        
}) 

// --- Working / Next step is adding IMAGE or NAME of user by their post and LINK to the USER ID PAGE ---
app.get('/:neighid/:tagid', function(req,res){
    var user = req.getUser();

        db.category.find({where: {id: req.params.tagid}}).then(function(catData){
            db.neighborhood.find({where: {id: req.params.neighid}}).then(function(neighData){
                db.post.findAll({where: {neighborhoodId: req.params.neighid, categoryId: req.params.tagid}}).then(function(postData){
                    if(postData[0] === undefined){
                        db.neighborhood.findAll({order: 'name ASC'}).success(function(neighborhood){  
                        res.render('neightagposts',{postData:postData, catData:catData, neighborhood:neighborhood, neighData:neighData, user:user})
                    })
                }
                db.user.find({where: {id: postData[0].userId}}).then(function(userData){
                    db.neighborhood.findAll({order: 'name ASC'}).success(function(neighborhood){   
                    res.render('neightagposts',{postData:postData, userData:userData, catData:catData, neighborhood:neighborhood, neighData:neighData, user:user});
                })
                // db.user.find({where: {id: }})
                // var imgId='user_'+ postData.userId;
                // var imgThumb = cloudinary.url(imgId+'.jpg', {
                //       width: 100,
                //       height: 108, 
                //       crop: 'fill',
                //       gravity: 'face',
                //       radius: 'max',
                //       // effect: 'sepia' 
                //     }); then pass imgThumb through the object!
            
                })   

            })
        })
    })
})





app.listen(3001);