var express = require('express');
const connection = require("../public/database/connection");
const session = require("express-session");
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

//--------------------------------------------------------------------------------User Routes---------------------------------------------------------------------------------------
//User Signup
router.post("/user-signup", (req, res) => {
    let {password, user_address, user_email, user_mobile, user_name} = req.body;
    let insertQuery = `insert into user(user_email,password,user_mobile,user_name,user_address) VALUES (?,?,?,?,?)`;
    connection.query(insertQuery, [user_email, password, user_mobile, user_name, user_address], (error) => {
        if (error) {
            return res.send(error);
        } else {
            return res.send("success");
        }
    })
})

//User Login Details Verification
router.post("/check-user-details", (req, res) => {
    let {user_email, password} = req.body;
    let checkdetailsquery = `select * from user where user_email="${user_email}" and password="${password}"`;
    connection.query(checkdetailsquery, (error, rows) => {
        if (error) {
            return res.send("error");
        } else if (rows.length === 0) {
            return res.send("notexist");
        } else if (rows.length === 1) {
            let user_name = rows[0].user_name;
            let userData = {user_email, user_name};
            session.userSession = userData;
            return res.send("success");
        }
    })
})
//Check user session
router.get("/check-user-session", (req, res) => {
    if (session.userSession === undefined) {
        return res.send("failed");
    } else {
        return res.send(session.userSession);
    }
});

//Log out user
router.post("/logoutuser", (req, res) => {
    session.userSession = undefined;
});

//View User Profile
router.get("/get-user-profile", (req, res) => {
    let user_email = session.userSession.user_email;
    let selectquery = `select * from user where user_email="${user_email}"`;
    connection.query(selectquery, (error, rows) => {
        if (error) {
            return res.send("error");
        } else {
            return res.send(rows);
        }
    })
});

//Update user profile
router.get("/get-user-profile-data-by-id:user_id", (req, res) => {
    let {user_id} = req.params;
    let selectquery = `select * from user where user_id="${user_id}"`;
    connection.query(selectquery, (error, rows) => {
        if (error) {
            return res.send("error");
        } else if (rows.length > 0) {
            return res.send(rows);
        }
    })
})

router.post("/update-user-profile:user_id", (req, res) => {
    let {user_id} = req.params;
    let {user_address, user_email, user_mobile, user_name} = req.body;
    let updateQuery = `update user set user_address="${user_address}",user_email="${user_email}",user_mobile="${user_mobile}",user_name="${user_name}" where user_id="${user_id}"`;
    connection.query(updateQuery, (error) => {
        if (error) {
            return res.send("error");
        } else {
            let updateBillorders = `UPDATE billorders set user_name="${user_name}",user_city="${user_address}",user_mobile="${user_mobile}" WHERE user_email="${session.userSession.user_email}"`;
            connection.query(updateBillorders, (error) => {
                if (error) {
                    return res.send("error");
                }
                return res.send("success");
            })
        }
    })
})

//Change user password
router.post("/change-user-password", (req, res) => {
    let {oldpassword, newpassword, confirmnewpassword} = req.body;
    let email = session.userSession.user_email;
    let checkoldpassquery = `select password from user where user_email="${email}"`;
    connection.query(checkoldpassquery, (error, rows) => {
        if (error) {
            return res.send("error");
        } else if (oldpassword !== rows[0].password) {
            return res.send("wrongpassword");
        } else if (oldpassword === rows[0].password) {
            let changepassquery = `UPDATE user set password="${newpassword}" where user_email="${email}";`
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

//Send user session to frontend for populating correct navbar
router.get("/send-user-session", (req, res) => {
    return res.send(session.userSession);
})

//Viewing Properties to user
router.get("/show-properties-to-users-limited", (req, res) => {
    let selectQuery = `select * from rooms where status="activated" LIMIT 3`;
    connection.query(selectQuery, (error, rows) => {
        if (error) {
            return res.send(error);
        } else {
            return res.send(rows);
        }
    })
})

router.get("/show-properties-to-users", (req, res) => {
    let selectQuery = `select * from rooms where status="activated"`;
    connection.query(selectQuery, (error, rows) => {
        if (error) {
            return res.send(error);
        } else {
            return res.send(rows);
        }
    })
})

//Viewing a Hotel at checkout
router.get("/show-data-at-checkout:room_id", (req, res) => {
    let {room_id} = req.params;
    let selectQuery = `select * from rooms where room_id="${room_id}"`;
    connection.query(selectQuery, (error, rows) => {
        if (error) {
            return res.send(error);
        } else {
            return res.send(rows);
        }
    })
})

//Showing User Details while billing of booking at Checkout
router.get("/get-user-data-in-checkout", (req, res) => {
    let selectQuery = `SELECT * from user where user_email="${session.userSession.user_email}"`
    connection.query(selectQuery, (error, rows) => {
        if (error) {
            return res.send("error");
        }
        return res.send(rows);
    })
})

//Adding details to bill table
router.post("/save-billing-details", (req, res) => {
    let {
        user_email,
        user_name,
        user_city,
        user_state,
        grandTotal,
        property_name,
        owner_email,
        no_of_rooms,
        checkin_date,
        checkout_date,
        payment_method,
        user_mobile,
        user_room_needs,
        status
    } = req.body;
    let insertQuery = `INSERT into billorders(bill_id,user_email,user_name,user_city,user_state,price,property_name,owner_email,no_of_rooms,checkin_date,checkout_date,payment_method,user_mobile,user_room_needs,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    connection.query(insertQuery, [null, user_email, user_name, user_city, user_state, grandTotal, property_name, owner_email, no_of_rooms, checkin_date, checkout_date, payment_method, user_mobile, user_room_needs, status], (error) => {
        if (error) {
            return res.send(error);
        }
        return res.send("success");
    })
})

//Change Payment Status
router.post("/change-payment-status", (req, res) => {
    let {payment_status, bill_id} = req.body;
    let updateQuery = `UPDATE billorders set status="${payment_status}" AND payment_method="online" WHERE bill_id="${bill_id}"`;
    connection.query(updateQuery, (error) => {
        if (error) {
            return res.send("error");
        }
        return res.send("success");
    })
})

//Showing user my bookings
router.get("/show-user-my-bookings", (req, res) => {
    let selectQuery = `SELECT * from billorders where user_email="${session.userSession.user_email}"`;
    connection.query(selectQuery, (error, rows) => {
        if (error) {
            return res.send("error");
        }
        return res.send(rows);
    })
})

//Cancel a Booking
router.post("/cancel-booking", (req, res) => {
    let {bill_id} = req.body;
    let deleteQuery = `DELETE from billorders where bill_id="${bill_id}"`;
    connection.query(deleteQuery, (error) => {
        if (error) {
            return res.send("error");
        }
        return res.send("success");
    })
})
//Contact us Query insertion into table
router.post("/contactus-queries", (req, res) => {
    let {message, user_email, user_mobile, user_name} = req.body;
    let insertQuery = `INSERT into contactqueries(query_id,user_name,user_email,user_mobile,message) VALUES(null,"${user_name}","${user_email}","${user_mobile}","${message}")`;
    connection.query(insertQuery, (error) => {
        if (error) {
            return res.send("error");
        }
        return res.send("success");
    })
})

module.exports = router;
