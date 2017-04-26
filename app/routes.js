module.exports = function(app,passport){
    var Course = require('../app/models/course');
    var User = require('../app/models/user');
    var Student = require('../app/models/student');
    var courseArr=[];

    app.get('/',function(req,res){
        res.render('index.ejs');
    });

    app.get('/login',function(req,res){
        res.render('login.ejs',{ message: req.flash('loginMessage')});
    });

    app.get('/signup',function(req,res){
        res.render('signup.ejs',{ message: req.flash('signupMessage')});
    });

    var getData = function(id){
        courseArr=[];
        Student.findOne({studentID:id},function(err,student){
            if(err)
                res.json(err);
            else {
                var myCourses =student.myCourses;
                for(var i in myCourses){
                    Course.findOne({courseID:myCourses[i].courseID},function(err,course){
                        if(err)
                            res.send(err);
                        else {
                            course=JSON.stringify(course);
                            courseArr.push(course);
                        }
                    });
                }
            }
        });
    }
    app.get('/profile',isLoggedIn,function(req,res){
        //courseArr=[];
        var id = req.user.username;
        getData(id);
        Student.findOne({studentID:id},function(err,student){
            if(err)
                res.json(err);
            else {
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
                res.send(err);
            else {
                res.render('courses.ejs',{courses:courses});
            }
        });
    });

    app.get('/mycourses',isLoggedIn,function(req,res){
        res.render('mycourses.ejs',{mycourses:courseArr});
    });

    app.post('/register',isLoggedIn,function(req,res){
        var id = req.user.username;
        var idCourse=req.body.courseID;

        Student.update({studentID: id},{ $push: { 'myCourses': { courseID: idCourse } } },function(err){
            if(err)
                res.send(err);
            else {
                getData(id);
                res.redirect('/mycourses');
            }

        });
    });

    app.post('/delete',isLoggedIn,function(req,res){
        var id = req.user.username;
        var idCourse=req.body.courseID;

        Student.update({studentID: id},{ $pull: { 'myCourses': { courseID: idCourse } } },function(err){
            if(err)
                res.send(err);
            else {
                getData(id);
                res.redirect('/mycourses');
            }
        });
    });


};


//route middleware to make sure a user is logged in
function isLoggedIn(req,res,next){
    if(req.isAuthenticated())
        return next();

    res.redirect('/');
}
