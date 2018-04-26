var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
var User = require('../schemas/User');

// Loggs the user in
router.route('/login')

    .post(function(req, res) {

        if (req.body.email == "") {

            res.send({
                success: false,
                error: {
                    field: "#email",
                    msg: "Enter an email address"
                }
            });

        } else if (req.body.password == "") {

            User.isUserExists(req.body.email, function(err, result) {

                if (err) console.error(err);

                var view = "login";

                if (result.length == 0) {
                    view = "signup"
                }

                res.send({
                    success: true,
                    data: {
                        view: view
                    }
                });

            })

        } else {

            User.isUserExists(req.body.email, function(err, result) {

                if (err) console.error(err);

                if (result.length == 0) {

                    var newUser = new User({
                        email: req.body.email,
                        password: req.body.password
                    })

                    if (req.body.password != req.body.passwordAgain) {

                        res.send({
                            success: false,
                            error: {
                                field: "#password-again",
                                msg: "The two password are not the same"
                            }
                        });

                    } else if (req.body.password.length < 1) {

                        res.send({
                            success: false,
                            error: {
                                field: "#password",
                                msg: "Enter a password"
                            }
                        });

                    } else {

                        newUser.save(function(err, existingUser) {

                            if (err) {

                                if (err.email !== null) {
                                    res.send({
                                        success: false,
                                        error: {
                                            field: "#email",
                                            msg: "Enter a valid email address"
                                        }
                                    });
                                }

                            } else {

                                req.session.userId = existingUser._id
                                req.session.facebookVerificationID = existingUser.facebookVerificationID

                                res.send({
                                    success: true,
                                    data: {
                                        view: "loggedIn"
                                    }
                                });

                            }

                        })

                    }

                } else {

                    var existingUser = result[0];

                    existingUser.comparePassword(req.body.password, function(err, isMatch) {

                        if (err) console.error(err);

                        if (!isMatch) {

                            res.send({
                                success: false,
                                error: {
                                    field: "#password",
                                    msg: "The entered password is incorrect"
                                }
                            });

                        } else {

                            req.session.userId = existingUser._id
                            req.session.facebookVerificationID = existingUser.facebookVerificationID

                            res.send({
                                success: true,
                                data: {
                                    view: "loggedIn"
                                }
                            });

                        }

                    })

                }

            })

        }

    })

// Loggs the user out
router.route('/logout')

    .get(function(req, res) {

        req.session.destroy(function(err) {

            res.redirect("/");

        })

    })

module.exports = router;
