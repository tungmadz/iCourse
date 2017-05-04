module.exports = function(app,passport){
    var Course = require('../app/models/course');
    var User = require('../app/models/user');
    var Student = require('../app/models/student');
    var Faculty = require('../app/models/faculty');
    var Subject = require('../app/models/subject');
    var Professor = require('../app/models/professor');

    var myCourseList=[];
    var subjectListOfSemester=[];
    var courseIdListOfSubject=[];
    var courseList=[];

    app.get('/',function(req,res){
        res.render('index.ejs');
    });

    app.get('/login',function(req,res){
        res.render('login.ejs',{ message: req.flash('loginMessage')});
    });

    app.get('/signup',function(req,res){
        res.render('signup.ejs',{ message: req.flash('signupMessage')});
    });

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

    app.post('/login',passport.authenticate('local-login',{failureRedirect: '/login',failureFlash: true}),function(req,res){
        var user=req.user;
        Student.findOne({studentID:user.username},function(err,student){
            if(err)
                res.send(err);
            else{
                var facultyName=student.faculty;
                var semester=student.semester;
                console.log(semester);
                getCourses(facultyName,semester);
                getMyCourses(student);
            }
        });
        res.json(user.username);
    });
    //Get courses
    function getCourses(facultyName,semester){
        subjectListOfSemester=[];
        courseIdListOfSubject=[];
        courseList=[];
        Faculty.findOne({facultyName:facultyName},function(err,faculty){
            if(err)
                console.log(err);
            else {
                var subjectListOfFaculty = faculty.subjectList;
                for(var i=0; i < subjectListOfFaculty.length; i++){
                    if(subjectListOfFaculty[i].semester==semester){
                        subjectListOfSemester=subjectListOfFaculty[i].subjects;
                    }
                }
                for(var i=0; i < subjectListOfSemester.length; i++){
                    Subject.findOne({subjectID:subjectListOfSemester[i]},function(err,subject){
                        if(err)
                            console.log(err);
                        else {
                            courseIdListOfSubject=subject.courseList;
                            for(var i=0; i < courseIdListOfSubject.length; i++){
                                Course.findOne({courseID:courseIdListOfSubject[i]},function(err,course){
                                    if(err)
                                        console.log(err);
                                    if(course){
                                        courseList.push(course);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }

    //Get student courses
    function getMyCourses(student){
        myCourseList=[];
        var myCourses =student.myCourses;
        for(var i=0; i < myCourses.length; i++){
            Course.findOne({courseID:myCourses[i]},function(err,course){
                if(err)
                    console.log(err);
                else {
                    myCourseList.push(course);
                }
            });
        }
    }
    //list all courses
    app.get('/courses',isLoggedIn,function(req,res){
         res.json(courseList);
    });

    //get course detail
    // app.get('/courses/:courseID',isLoggedIn,function(req,res){
    //     var id= req.params.courseID;
    //     Course.findOne({courseID:id},function(err,course){
    //         if(err)
    //             res.send(err);
    //         else {
    //             res.render('course_detail.ejs',{course:course});
    //         }
    //     });
    // });

    //register course and redirect to mycourses page
    app.post('/courses',isLoggedIn,function(req,res){
        var student=req.user;
        var id = student.studentID;
        var courseID=req.body.courseID;
        if(isRegistered(student.myCourses,courseID)==true){
            res.json({"message":"You have already registered this course !"});
        }
        else {
            Course.findOne({courseID:courseID},function(err,course){
                if(err)
                    res.json({"message":"Error"});
                if(!course)
                    res.json({"message":"Course not found !"});
                if(course){
                    if(isFull(course.occupied,course.available)){
                        res.json({"message":"This course is already full"});
                    }else{
                        course.occupied=course.occupied+1;
                        course.save(function(err){
                            if(err)
                                res.json({"message":"Error"});
                            else{
                                addToMyCourses(student,courseID,res);
                            }
                        });
                    }
                }
            });
        }
    });

    function isFull(occupied,available){
        if(occupied >= available)
            return true;
        else
            return false;
    }

    function isRegistered(myCourses,courseID){
        for(var i in myCourses){
            if(courseID==myCourses[i])
                return true;
        }
        return false;
    }

    function addToMyCourses(student,courseID,res){
        var id = student.studentID;
        Student.update({studentID:id},{ $push: { myCourses:courseID} },function(err){
            if(err)
                res.json({"message":"Error"});
            else{
                getMyCourses(student);
                res.json({"message":"Success"});
            }
        });
    }
    //list all registered courses of student
    app.get('/mycourses',isLoggedIn,function(req,res){
        res.json(myCourseList);
    });

    //get registered course detail
    // app.get('/mycourses/:courseID',isLoggedIn,function(req,res){
    //     var id= req.params.courseID;
    //     Course.findOne({courseID:id},function(err,mycourse){
    //         if(err)
    //             res.send(err);
    //         else {
    //             res.render('mycourse_detail.ejs',{mycourse:mycourse});
    //         }
    //     });
    // });

    //delete registered course and redirect to mycourses page
    app.post('/mycourses',isLoggedIn,function(req,res){
        var student=req.user;
        var id = student.studentID;
        var courseID=req.body.courseID;
        if(isRegistered(student.myCourses,courseID)==true){
            Course.findOne({courseID:courseID},function(err,course){
                if(err)
                    res.json({"message":"Error"});
                if(!course)
                    res.json({"message":"Course not found"});
                if(course){
                    if(isEmpty(course.occupied))
                        res.json({"message":"This course is already empty"});
                    else {
                        course.occupied=course.occupied-1;
                        course.save(function(err){
                            if(err)
                                res.json({"message":"Error"});
                            else {
                                removeFromMyCourses(student,courseID,res);
                            }
                        });
                    }
                }
            });
        }
        else {
            res.json({"message":"You didn't register this course"});
        }
    });

    function removeFromMyCourses(student,courseID,res){
        var id = student.studentID;
        Student.update({studentID: id},{ $pull: { myCourses: {$in: [courseID] } } },function(err){
            if(err)
                res.json({"message":"Fail"});
            else {
                getMyCourses(student);
                res.json({"message":"Success"});
            }
        });
    }

    function isEmpty(occupied){
        if(occupied <=0)
            return true;
        else
            return false;
    }
}

//route middleware to make sure a user is logged in
function isLoggedIn(req,res,next){
    if(req.isAuthenticated())
        return next();

    res.redirect('/');
}
