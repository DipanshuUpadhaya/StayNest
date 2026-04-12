const User=require("../models/user.js");

module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;

        const newUser = new User({ email, username });
        const registerUser = await User.register(newUser, password);

        req.flash("success", "Welcome to Wanderlust!");

        //  AUTO LOGIN AFTER SIGNUP
        req.login(registerUser, (err) => {
            if (err) {
                return next(err);
            }

            //  REDIRECT TO ORIGINAL PAGE
            let redirectUrl = req.session.redirectUrl || "/listings";
            res.redirect(redirectUrl);
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};


module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs");
};


module.exports.login=(req,res)=>{
        req.flash("success","Welcome back to Wanderlust! You are logged in!");
        let redirectUrl=res.locals.redirectUrl ||"/listings";
        res.redirect(redirectUrl);
};


module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","you are logged out !");
        res.redirect("/listings");
    })
};