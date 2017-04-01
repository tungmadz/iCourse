module.exports = function(app,passport){
    var Course = require('../app/models/course');
    var User = require('../app/models/user');
    app.get('/',function(req,res){
        res.render('index.ejs');
    });

    app.get('/login',function(req,res){
        res.render('login.ejs',{ message: req.flash('loginMessage')});
    });

    app.get('/signup',function(req,res){
        res.render('signup.ejs',{ message: req.flash('signupMessage')});
    });

    app.get('/profile',isLoggedIn,function(req,res){
        res.render('profile.ejs',{
            user : req.user
        });
    });

    app.get('/logout',function(req,res){
        req.logout();
        res.redirect('/');
    });

    app.post('/signup',passport.authenticate('local-signup',{
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.post('/login',passport.authenticate('local-login',{
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/courses',isLoggedIn,function(req,res){
        var user = req.user;
        res.json({courses:user.courses});

    });
};


//route middleware to make sure a user is logged in
function isLoggedIn(req,res,next){
    if(req.isAuthenticated())
        return next();

    res.redirect('/');
}
