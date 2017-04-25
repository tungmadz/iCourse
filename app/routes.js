module.exports = function(app,passport){
    var Course = require('../app/models/course');
    var User = require('../app/models/user');
    var Student = require('../app/models/student');
    app.get('/',function(req,res){
        res.render('index.ejs');
    });

    app.get('/login',function(req,res){
        res.render('login.ejs',{ message: req.flash('loginMessage')});
    });

    app.get('/signup',function(req,res){
        res.render('signup.ejs',{ message: req.flash('signupMessage')});
    });

    var courseArr=[];
    app.get('/profile',isLoggedIn,function(req,res){
        courseArr=[];
        var id = req.user.username;
        Student.findOne({studentID:id},function(err,student){
            if(err)
                res.json(err);
            else {
                //GET MY COURSES
                var myCourses =student.myCourses;
                for(var i in myCourses){
                    var a;
                    Course.findOne({courseID:myCourses[i].courseID},function(err,course){
                        if(err)
                            res.send(err);
                        else {
                            course=JSON.stringify(course);
                            courseArr.push(course);
                        }
                    });
                }
                //RETURN STUDENT
                res.render('profile.ejs',{
                    student : student
                });
            }
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
        failureFlash: true,
    }));
    // app.post('/login',passport.authenticate('local-login'),function(req,res){
    //     var user = req.user;
    //     var result = {
    //         user : user.username,
    //         message: "success"
    //     };
    //     res.json(result);
    // });
    app.get('/courses',isLoggedIn,function(req,res){
        Course.find({},function(err,courses){
            if(err)
                res.send(err)
            else {
                res.render('courses.ejs',{courses:courses});
            }
        });
    });

    app.get('/mycourses',isLoggedIn,function(req,res){
        res.render('mycourses.ejs',{mycourses:courseArr,message:'success'});
    });
};


//route middleware to make sure a user is logged in
function isLoggedIn(req,res,next){
    if(req.isAuthenticated())
        return next();

    res.redirect('/');
}
