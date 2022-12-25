var session = require('express-session');
var express = require('express');
var router = express.Router();
var connection = require("../public/database/connection");
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

//---------------------------------------------------------------------------ADMIN ROUTES-------------------------------------------------------------------------------------------

//Add Admin Details
router.post("/add-admin", (req, res) => {
    let {uname, password, confirmpassword, newmail, fullname, phonenumber, type} = req.body;
    let emailcheckselectquery = `SELECT username,email from admin where email="${newmail}" OR username="${uname}"`;
    connection.query(emailcheckselectquery, (error, rows) => {
        if (error) {
            return res.send("Some Technical Problems at backend");
        } else if (rows.length > 0) {
            return res.send("exists");
        } else {
            let insertQuery = `INSERT into admin(username,password,email,fullname,phoneno,type) VALUES("${uname}","${password}","${newmail}","${fullname}","${phonenumber}","${type}")`;
            connection.query(insertQuery, (error) => {
                if (error) {
                    return res.send("error");
                }
                return res.send("success");
            });
        }
    });
});

//Login Details Validation
router.post("/check-details", (req, res) => {
    let {name_email, login_pass} = req.body;
    let checklogindetails = `SELECT * from admin where (email="${name_email}" OR username="${name_email}") AND password="${login_pass}"`;
    connection.query(checklogindetails, (error, rows) => {
        if (error) {
            return res.send("error");
        } else if (rows.length === 0) {
            return res.send("failure");
        } else if (rows.length > 0) {
            if (rows[0].status === 'active') {
                let adminData = {'username': rows[0].username, 'type': rows[0].type};
                session.adminSession = adminData;
                return res.send("success login");
            } else {
                return res.send("inactive");
            }
        }
    });
});

//Checking admin-session for protected routes

router.get("/check-admin-session", (req, res) => {
    if (session.adminSession === undefined) {
        return res.send("failed");
    } else {
        return res.send(session.adminSession);
    }
});

//Admin Logging Out and destroying session
router.post("/logout", (req, res) => {
    session.adminSession = undefined;
});

//Viewing Admin Details
router.get("/getadmindetails", (req, res) => {
    let selectquery = `select * from admin`;
    connection.query(selectquery, (error, rows) => {
        if (error) {
            return res.send("error");
        } else if (rows.length === 0) {
            return res.send("nodata");
        } else if (rows.length > 0) {
            return res.send(rows);
        }
    });
});

//Updating Admin Details
router.get("/get-data-by-username:username", (req, res) => {
    let {username} = req.params;
    let selectquery = `select username,type,status from admin where username="${username}"`;
    connection.query(selectquery, (error, rows) => {
        if (error) {
            return res.send("error");
        } else if (rows.length > 0) {
            return res.send(rows);
        }
    });
});

router.post("/update-admin-details", (req, res) => {
    let {uname, type, updatestatus} = req.body;
    let updateQuery = `update admin set type="${type}",status="${updatestatus}" where username="${uname}"`;
    connection.query(updateQuery, (error) => {
        if (error) {
            return res.send("error");
        } else {
            return res.send("success");
        }
    })
})

//Change admin password
router.post("/change-admin-password", (req, res) => {
    let {oldpassword, newpassword, confirmnewpassword} = req.body;
    let uname = session.adminSession.username;
    let checkoldpassquery = `select password from admin where username="${uname}"`;
    connection.query(checkoldpassquery, (error, rows) => {
        if (error) {
            return res.send("error");
        } else if (oldpassword !== rows[0].password) {
            return res.send("wrongpassword");
        } else if (oldpassword === rows[0].password) {
            let changepassquery = `UPDATE admin set password="${newpassword}" where username="${uname}";`
            connection.query(changepassquery, (error) => {
                if (error) {
                    return res.send("failure");
                } else {
                    return res.send("success");
                }
            });
        }
    });
});

//Get Pending owners
router.post("/getpendingowners", (req, res) => {
    let {activatestatus} = req.body;
    if (activatestatus === "pending") {
        let selectquery = `select * from owner where status="pending"`;
        connection.query(selectquery, (error, rows) => {
            if (error) {
                return res.send("error");
            } else if (rows.length === 0) {
                return res.send("nodata");
            } else if (rows.length > 0) {
                return res.send(rows);
            }
        });
    } else if (activatestatus === "activated") {
        let selectquery = `select * from owner where status="activated" OR status="blocked"`;
        connection.query(selectquery, (error, rows) => {
            if (error) {
                return res.send("error");
            } else if (rows.length === 0) {
                return res.send("nodata");
            } else if (rows.length > 0) {
                return res.send(rows);
            }
        });
    }
});

//Activate owner
router.post("/owner-actions", (req, res) => {
    let {email, accountstatus} = req.body;
    if (accountstatus === "pending") {
        let activateQuery = `update owner set status="activated" where contact_email="${email}"`;
        connection.query(activateQuery, (error) => {
            if (error) {
                return res.send("error");
            } else {
                return res.send("activated");
            }
        })
    } else if (accountstatus === "activated") {
        let activateQuery = `update owner set status="blocked" where contact_email="${email}"`;
        connection.query(activateQuery, (error) => {
            if (error) {
                return res.send("error");
            } else {
                return res.send("blocked");
            }
        })
    }
})

//Get Pending owners properties
router.post("/getownerspendingproperty", (req, res) => {
    let {activatestatus} = req.body;
    if (activatestatus === "pending") {
        let selectquery = `select * from rooms where status="pending"`;
        connection.query(selectquery, (error, rows) => {
            if (error) {
                return res.send("error");
            } else if (rows.length === 0) {
                return res.send("nodata");
            } else if (rows.length > 0) {
                return res.send(rows);
            }
        });
    } else if (activatestatus === "activated") {
        let selectquery = `select * from rooms where status="activated" OR status="blocked"`;
        connection.query(selectquery, (error, rows) => {
            if (error) {
                return res.send("error");
            } else if (rows.length === 0) {
                return res.send("nodata");
            } else if (rows.length > 0) {
                return res.send(rows);
            }
        });
    }
});

//Owner property actions

router.post("/owner-property-actions", (req, res) => {
    let {room_id, accountstatus} = req.body;
    if (accountstatus === "pending") {
        let activateQuery = `update rooms set status="activated" where room_id="${room_id}"`;
        connection.query(activateQuery, (error) => {
            if (error) {
                return res.send("error");
            } else {
                return res.send("activated");
            }
        })
    } else if (accountstatus === "activated") {
        let activateQuery = `update rooms set status="blocked" where room_id="${room_id}"`;
        connection.query(activateQuery, (error) => {
            if (error) {
                return res.send("error");
            } else {
                return res.send("blocked");
            }
        })
    }
})

//Viewing all users to admin
router.get("/view-all-users", (req, res) => {
    let selectQuery = `SELECT * FROM user`;
    connection.query(selectQuery, (error, rows) => {
        if (error) {
            return res.send("error");
        } else if (rows.length === 0) {
            return res.send("nodata");
        } else if (rows.length > 0) {
            return res.send(rows);
        }
    })
})

//Viewing all bookings to admin
router.get("/get-pending-payments-data", (req, res) => {
    let selectQuery = `SELECT * from billorders where status="Payment Pending"`;
    connection.query(selectQuery, (error, rows) => {
        if (error) {
            return res.send("error");
        } else if (rows.length === 0) {
            return res.send("nodata");
        } else if (rows.length > 0) {
            return res.send(rows);
        }
    })
})

router.get("/get-received-payments-data", (req, res) => {
    let selectQuery = `SELECT * from billorders where status="Payment Done"`;
    connection.query(selectQuery, (error, rows) => {
        if (error) {
            return res.send("error");
        } else if (rows.length === 0) {
            return res.send("nodata");
        } else if (rows.length > 0) {
            return res.send(rows);
        }
    })
})

router.get("/view-user-queries", (req, res) => {
    let selectQuery = `SELECT * from contactqueries where status="pending"`;
    connection.query(selectQuery, (error, rows) => {
        if (error) {
            return res.send(error);
        } else if (rows.length === 0) {
            return res.send("nodata");
        } else if (rows.length > 0) {
            return res.send(rows);
        }
    })
})

//Change Query Status
router.post("/delete-query", (req, res) => {
    let {query_id} = req.body;
    let deleteQuery = `DELETE FROM contactqueries WHERE query_id="${query_id}"`;
    connection.query(deleteQuery, (error) => {
        if (error) {
            return res.send("error");
        }
        return res.send("success");
    })
})

//Get Admin earnings 70%
router.get("/admin-earnings", (req, res) => {
    let earnings = `SELECT SUM(price) as admin_earnings from billorders where status="Payment Done"`;
    connection.query(earnings, (error, rows) => {
        if (error) {
            return res.send("error");
        }
        return res.send(rows);
    })
})

router.get("/count-users", (req, res) => {
    let countQuery = `SELECT COUNT(*) as totalusers from user`;
    connection.query(countQuery, (error, rows) => {
        if (error) {
            return res.send(error);
        }
        return res.send(rows);
    })
})
module.exports = router;