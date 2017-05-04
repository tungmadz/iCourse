module.exports = function(app,passport){
    var Course = require('../app/models/course');
    var User = require('../app/models/user');
    var Student = require('../app/models/student');
    var Faculty = require('../app/models/faculty');
    var Subject = require('../app/models/subject');
    var Professor = require('../app/models/professor');
    var myCourseArr=[];
    var subjectList=[];
    var courseList=[];
    var courses=[];
    app.get('/',function(req,res){
        res.render('index.ejs');
    });

    app.get('/login',function(req,res){
        res.render('login.ejs',{ message: req.flash('loginMessage')});
    });

    app.get('/signup',function(req,res){
        res.render('signup.ejs',{ message: req.flash('signupMessage')});
    });

    //Get courses
    function getCourses(facultyName,semester){
        subjectList=[];
        courseList=[];
        courses=[];
        Faculty.findOne({facultyName:facultyName},function(err,faculty){
            if(err)
                console.log(err);
            else {
                var subjectList = faculty.subjectList;
                for(var i=0; i < subjectList.length; i++){
                    if(subjectList[i].semester==semester){
                        subjectList=subjectList[i].subjects;
                    }
                }

                for(var i=0; i < subjectList.length; i++){
                    Subject.findOne({subjectID:subjectList[i]},function(err,subject){
                        if(err)
                            console.log(err);
                        else {
                             courseList=subject.courseList;
                            for(var i=0; i < courseList.length; i++){
                                Course.findOne({courseID:courseList[i]},function(err,course){
                                    if(err)
                                        console.log(err);
                                    if(course){
                                        courses.push(course);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }

    function getMyCourses(student){
        myCourseArr=[];
        var myCourses =student.myCourses;
        for(var i=0; i < myCourses.length; i++){
            Course.findOne({courseID:myCourses[i]},function(err,course){
                if(err)
                    console.log(err);
                else {
                    myCourseArr.push(course);
                }
            });
        }
    }

    function isFull(id){
        Course.findOne({courseID:id},function(err,course){
            if(err){
                return true;
            }
            else{
                if(course.occupied >= course.available)
                    return true;
                else
                    return false;
            }
        });
    }

    function isEmpty(id){
        Course.findOne({courseID:id},function(err,course){
            if(err){
                return true;
            }
            else{
                if(course.occupied <=0)
                    return true;
                else
                    return false;
            }
        });
    }

    //after login redirect to profile page with student info
    app.get('/profile',isLoggedIn,function(req,res){
        var student=req.user;
        res.json(student);
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

    app.post('/login',passport.authenticate('local-login'),function(req,res){
        var user=req.user;
        Student.findOne({studentID:user.username},function(err,student){
            if(err)
                res.send(err)
            else {
                var facultyName=student.faculty;
                var semester=student.semester;
                getCourses(facultyName,semester);
                getMyCourses(student);
            }
        });
        res.json(user);
    });

    //list all courses
    app.get('/courses',isLoggedIn,function(req,res){
        res.send(courses);
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

    //register course and redirect to mycourses page
    app.post('/courses/:courseID',isLoggedIn,function(req,res){
        var student=req.user;
        var id = student.studentID;
        var courseID=req.params.courseID;
        if(isFull(courseID)){
            res.send("Course is full");
        }else {
            Course.update({courseID:courseID},{ $inc: {occupied: 1} },function(err){
                if(err)
                    res.send(err);
                else {
                    console.log("success");
                }
            });
            Student.update({studentID:id},{ $addToSet: { myCourses:courseID} },function(err){
                if(err)
                    res.json({'message':'fail'});
                else{
                    getMyCourses(student);
                    res.json({'message':'success'});
                }
            });
        }
    });

    //list all registered courses of student
    app.get('/mycourses',isLoggedIn,function(req,res){
        res.json(myCourseArr);
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

    //delete registered course and redirect to mycourses page
    app.post('/mycourses/:courseID',isLoggedIn,function(req,res){
        var student=req.user;
        var id = student.studentID;
        var courseID=req.params.courseID;
        if(isEmpty(courseID)){
            res.send("Course is empty");
        }else {
            Course.update({courseID:courseID},{ $inc: {occupied: -1} },function(err){
                if(err)
                    res.send(err);
                else {
                    console.log("success");
                }
            });
            Student.update({studentID: id},{ $pull: { myCourses: {$in: [courseID] } } },function(err){
                if(err)
                    res.json({'message':'fail'});
                else {
                    getMyCourses(student);
                    res.json({'message':'success'});
                }
            });
        }
    });
};


//route middleware to make sure a user is logged in
function isLoggedIn(req,res,next){
    if(req.isAuthenticated())
        return next();

    res.redirect('/');
}
