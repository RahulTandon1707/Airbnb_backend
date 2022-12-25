var session = require('express-session');
var connection = require("../public/database/connection");
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

//------------------------------------------------------------------------------Owner Routes----------------------------------------------------------------------------------------

//Owner Joining form
router.post("/join-owner", (req, res) => {
    let {owner_name, contact_no, contact_email, pass} = req.body;
    let emailcheckselectquery = `SELECT contact_email from owner where contact_email="${contact_email}"`;
    connection.query(emailcheckselectquery, (error, rows) => {
        if (error) {
            return res.send("error");
        } else if (rows.length > 0) {
            return res.send("exists");
        } else {
            let insertQuery = `INSERT into owner(contact_email, owner_name,password, contact_no) VALUES ("${contact_email}","${owner_name}","${pass}","${contact_no}")`;
            connection.query(insertQuery, (error) => {
                if (error) {
                    return res.send("error");
                } else {
                    return res.send("success");
                }
            });
        }
    });
});

//Owner login details validation

router.post("/check-owner-details", (req, res) => {
    let {email, pass} = req.body;
    let checklogindetails = `SELECT * from owner where contact_email="${email}" AND password="${pass}"`;
    connection.query(checklogindetails, (error, rows) => {
        if (error) {
            return res.send("error");
        } else if (rows.length === 0) {
            return res.send("failure");
        } else if (rows.length > 0) {
            if (rows[0].status === "pending") {
                return res.send("pending");
            } else if (rows[0].status === 'activated') {
                session.ownerSession = email;
                return res.send("success login");
            } else {
                return res.send("blocked");
            }
        }
    });
});

// Checking owner session
router.get("/check-owner-session", (req, res) => {
    if (session.ownerSession === undefined) {
        return res.send("failed");
    } else {
        return res.send("success");
    }
});

// Owner Logout
router.post("/logoutowner", (req, res) => {
    session.ownerSession = undefined;
});

// Owner Change Password
router.post("/change-owner-password", (req, res) => {
    let {oldpassword, newpassword, confirmnewpassword} = req.body;
    let email = session.ownerSession;
    let checkoldpassquery = `select password from owner where contact_email="${email}"`;
    connection.query(checkoldpassquery, (error, rows) => {
        if (error) {
            return res.send("error");
        } else if (oldpassword !== rows[0].password) {
            return res.send("wrongpassword");
        } else if (oldpassword === rows[0].password) {
            let changepassquery = `UPDATE owner set password="${newpassword}" where contact_email="${email}";`
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

//Getting owner name
router.get("/getowneremail", (req, res) => {
    let owneremail = session.ownerSession;
    return res.send(owneremail);
});

//Adding owner property request to admin
router.post("/owner-add-property", (req, res) => {
    let {
        address,
        amenities,
        category_name,
        contact_no,
        no_of_days,
        no_of_rooms,
        owner_email,
        price,
        property_name
    } = req.body;

    let image = req.files.photo;
    let serverPath = `public/images/${image.name}`;
    let dbPath = `images/${image.name}`;
    image.mv(serverPath, (error) => {
        if (error) {
            console.log(error);
        }
    })
    let insertQuery = `INSERT into rooms(room_id,owner_email,property_name,address,photo,no_of_rooms,no_of_days,category_name,amenities,price,contact_no) VALUES(null,"${owner_email}","${property_name}","${address}","${dbPath}","${no_of_rooms}","${no_of_days}","${category_name}","${amenities}","${price}","${contact_no}")`;
    connection.query(insertQuery, (error) => {
        if (error) {
            return res.send(error);
        }
        return res.send("success");
    })
})

//Viewing Properties Details To Owner
router.get("/getownerpropertydetails", (req, res) => {
    let owner_email = session.ownerSession;
    let selectquery = `select * from rooms where owner_email="${owner_email}"`;
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

// Updating Owner property details
router.get("/get-owner-property-data-by-email:room_id", (req, res) => {
    let {room_id} = req.params;
    let selectquery = `select * from rooms where room_id="${room_id}"`;
    connection.query(selectquery, (error, rows) => {
        if (error) {
            return res.send("error");
        } else if (rows.length === 0) {
            return res.send("nodata");
        } else if (rows.length > 0) {
            return res.send(rows);
        }
    })
})

router.post("/update-owner-property-details", (req, res) => {
    let {
        address,
        amenities,
        category,
        contact_no,
        no_of_days,
        no_of_rooms,
        owner_email,
        price,
        property_name,
        room_id
    } = req.body;

    let image = req.files.photo;
    let serverPath = `public/images/${image.name}`;
    let dbPath = `images/${image.name}`;
    image.mv(serverPath, (error) => {
        if (error) {
            console.log(error);
        }
    })
    let updateQuery = `update rooms set property_name="${property_name}",address="${address}",photo="${dbPath}",no_of_rooms="${no_of_rooms}",no_of_days="${no_of_days}",category_name="${category}",amenities="${amenities}",price="${price}",contact_no="${contact_no}" where room_id="${room_id}"`;
    connection.query(updateQuery, (error) => {
        if (error) {
            return res.send("error");
        } else {
            return res.send("success");
        }
    })
})

//Deleting owner property
router.post("/deleteownerproperty", (req, res) => {
    let {room_id} = req.body;
    let deletequery = `delete from rooms where room_id="${room_id}"`;
    connection.query(deletequery, (error) => {
        if (error) {
            return res.send("error");
        } else {
            return res.send("success");
        }
    })
})

//Get Pending Payments Bookings
router.get("/get-pending-payments:property_name", (req, res) => {
    let {property_name} = req.params;
    let selectQuery = `SELECT * from billorders where property_name="${property_name}" AND status="Payment Pending"`;
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

//Get Received Payments Bookings
router.get("/get-received-payments:property_name", (req, res) => {
    let {property_name} = req.params;
    let selectQuery = `SELECT * from billorders where property_name="${property_name}" AND status="Payment Done"`;
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

// Change Payment Status to Done
router.post("/change-payment-status", (req, res) => {
    let {bill_id} = req.body;
    let updateQuery = `UPDATE billorders set status="Payment Done" where bill_id="${bill_id}"`;
    connection.query(updateQuery, (error) => {
        if (error) {
            return res.send("error");
        }
        return res.send("success");
    })
})

router.get("/get-bookings", (req, res) => {
    let selectQuery = `SELECT * from billorders where owner_email="${session.ownerSession}"`;
    connection.query(selectQuery, (error, rows) => {
        if (error) {
            return res.send("error");
        }
        return res.send(rows);
    })
})

router.get("/get-earnings", (req, res) => {
    let earnings = `SELECT SUM(price) as total_earning from billorders where status="Payment Done" AND owner_email="${session.ownerSession}"`;
    connection.query(earnings, (error, rows) => {
        if (error) {
            return res.send("error")
        }
        return res.send(rows);
    })
})


module.exports = router;