const dns = require("node:dns");

// (Optional) DNS fix
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dns.setDefaultResultOrder("ipv4first");

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();

//  VERY IMPORTANT (fix for Render cookies)
app.set("trust proxy", 1);

const mongoose = require("mongoose");
const path = require("path");

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");

const connectMongo = require("connect-mongo");
const MongoStore = connectMongo.default || connectMongo;

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const { listingSchema, reviewSchema } = require("./schema.js");

const dbUrl = process.env.ATLASDB_URL;
const PORT = process.env.PORT || 8080;
const secret = process.env.SECRET || "mysupersecretcode";

console.log("DB URL being used:", dbUrl);

const Listing = require("./models/listing");

app.get("/", async (req, res) => {
    const listings = await Listing.find({});
    res.render("home.ejs", { listings });
});

// ================= DB CONNECTION =================
mongoose.connect(dbUrl, {
    family: 4,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log("Connected to DB");

    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
})
.catch((err) => {
    console.log("DB connection failed:", err.message);

    app.listen(PORT, () => {
        console.log(`Server running WITHOUT DB on ${PORT}`);
    });
});

// ================= EXPRESS SETUP =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.set("layout", "layouts/boilerplate");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// ================= SESSION STORE =================
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: secret,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("Error in mongo session store", err);
});

// ================= SESSION CONFIG =================
const sessionOptions = {
    store: store,
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,        // ✅ IMPORTANT for Render (HTTPS)
        sameSite: "lax",     // ✅ prevents cookie issues
    }
};

app.use(session(sessionOptions));
app.use(flash());

// ================= PASSPORT =================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================= GLOBAL VARIABLES =================
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// ================= VALIDATION =================
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// ================= ROUTES =================
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// ================= ERROR HANDLING =================
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    res.status(statusCode).render("error", { statusCode, message });
});