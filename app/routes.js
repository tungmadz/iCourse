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

    /*FUNCTION GET MY COURSE
    id is studentID
    courseArr is an array to store student'course*/
    var getData = function(id){
        courseArr=[];
        Student.findOne({studentID:id},function(err,student){
            if(err)
                res.send(err);
            else {
                var myCourses =student.myCourses;
                for(var i in myCourses){
                    Course.findOne({courseID:myCourses[i]},function(err,course){
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

    //after login redirect to profile page with student info
    app.get('/profile',isLoggedIn,function(req,res){
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

    //additional function to signup student
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

    //list all courses
    app.get('/courses',isLoggedIn,function(req,res){
        Course.find({},function(err,courses){
            if(err)
                res.send(err);
            else {
                res.render('courses.ejs',{courses:courses});
            }
        });
    });

    //get course detail
    app.get('/courses/:courseID',isLoggedIn,function(req,res){
        var id= req.params.courseID;
        Course.findOne({courseID:id},function(err,course){
            if(err)
                res.send(err);
            else {
                res.render('course_detail.ejs',{course:course});
            }
        });
    });

    //list all registered courses of student
    app.get('/mycourses',isLoggedIn,function(req,res){
        res.render('mycourses.ejs',{mycourses:courseArr});
    });

    //get registered course detail
    app.get('/mycourses/:courseID',isLoggedIn,function(req,res){
        var id= req.params.courseID;
        Course.findOne({courseID:id},function(err,mycourse){
            if(err)
                res.send(err);
            else {
                res.render('mycourse_detail.ejs',{mycourse:mycourse});
            }
        });
    });

    //register course and redirect to mycourses page
    app.post('/register',isLoggedIn,function(req,res){
        var id = req.user.username;
        var idCourse=req.body.courseID;
        Student.update({studentID: id},{ $addToSet: { myCourses:idCourse} },function(err){
            if(err)
                res.send(err);
            else {
                getData(id);
                res.redirect('/mycourses');
            }

        });
    });

    //delete registered course and redirect to mycourses page
    app.post('/delete',isLoggedIn,function(req,res){
        var id = req.user.username;
        var idCourse=req.body.courseID;
        Student.update({studentID: id},{ $pull: { myCourses: {$in: [idCourse] } } },function(err){
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
