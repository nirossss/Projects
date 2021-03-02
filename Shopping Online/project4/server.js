const express = require('express');
const app = express();
const { pool } = require('./dbconnection');
const bcrypt = require('bcrypt');
const cors = require('cors');
const session = require('express-session');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { v4: uuid4 } = require('uuid');

const port = process.env.PORT || 3000;

const storage = multer.diskStorage({
    destination: path.join(__dirname, 'uploads'),
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);

        if (!['.svg', '.png', '.jpeg', '.jpg'].includes(ext)) {
            return cb(new Error('file ext disallowed'));
        }// images only

        cb(null, uuid4() + ext);
    }
});

const upload = multer({ storage: storage })

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));
app.use('/api/images', express.static('./uploads'));
app.use('/api', express.json());
app.use('/api', express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SECRET || 'dasf#R$fg$TRA',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

const isAuth = (req, res, next) => {
    if (req.session.user) return next();
    res.sendStatus(403);
}

const isAdmin = (req, res, next) => {
    if (req.session.user) {
        if (req.session.user.admin) return next();
    }
    res.sendStatus(403);
}

// get: verify user loged in and send user_data (used in shop.c)
app.get('/api/auth/verify', (req, res) => {
    if (req.session.user) {
        let { first_name, last_name, city, street } = req.session.user
        res.json({ success: true, msg: 'User login verified', user_data: { first_name: first_name, last_name: last_name, city: city, street: street } });
        return
    }
    res.json({ success: false, msg: 'Unidentified user' });
})

// get: verify admin loged in and send user_=data (admin.c)
app.get('/api/auth/admin', (req, res) => {
    if (req.session.user) {
        if (req.session.user.admin) {
            res.json({ success: true, msg: 'Admin login verified', user_data: { first_name: req.session.user.first_name, last_name: req.session.user.last_name } });
            return
        }
    }
    res.json({ success: false, msg: 'Unidentified user' });
})

// get: send amount of orders and products in shop (home.c)
app.get('/api/home', (req, res) => {
    pool.query(`SELECT COUNT(order_id) AS orders_placed FROM orders`, (err, results) => {
        if (err) throw err;
        pool.query(`SELECT COUNT(id) AS available_products FROM products`, (err, results2) => {
            if (err) throw err;
            res.json({ success: true, orders_placed: results[0].orders_placed, available_products: results2[0].available_products });
        })
    })
})

// post: check user id or email uniqe in db (register.c)
app.post('/api/register/firstStep', (req, res) => {
    const { user_id, email } = req.body;

    if (!email.trim()) {
        return res.json({ success: false, msg: 'Missing fields.' });
    } else if (!email.includes('@') || !email.includes('.')) {
        return res.json({ success: false, msg: 'Incorrect email syntax.' });
    } else if (isNaN(user_id) || user_id === null) {
        return res.json({ success: false, msg: 'Invalid ID' });
    }

    pool.query(`
        SELECT COUNT(users.user_id) AS count_id FROM users
        WHERE users.user_id = ?
    `, [user_id], (err, results) => {
        if (err) throw err;
        if (results[0].count_id === 0) {
            pool.query(`
                SELECT COUNT(users.email) AS count_email FROM users
                WHERE users.email = ?
            `, [email.trim()], (err, results2) => {
                if (err) throw err;
                if (results2[0].count_email === 0) {
                    res.json({ success: true, msg: 'New user id and email' });
                } else {
                    res.json({ success: false, msg: 'email already in use' });
                }
            })
        } else {
            res.json({ success: false, msg: 'User id already in use' });
        }
    });
});

// post: insert registerd user to db (register.c)
app.post('/api/register', (req, res) => {
    const { user_id, first_name, last_name, email, password, city, street } = req.body;

    if (!email.trim() || !password.trim() || !first_name.trim() || !last_name.trim() || !city.trim() || !street.trim()) {
        return res.json({ success: false, msg: 'Missing fields.' });
    } else if (!email.includes('@') || !email.includes('.')) {
        return res.json({ success: false, msg: 'Incorrect email syntax.' });
    } else if (password.length > password.trim().length) {
        return res.json({ success: false, msg: 'White spaces used befor or after password.' });
    } else if (isNaN(user_id)) {
        return res.json({ success: false, msg: 'Invalid ID' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;
        pool.query(`
                INSERT INTO users (user_id, first_name, last_name, email, password, city, street)
                VALUES (?,?,?,?,?,?,?);
            `, [user_id, first_name, last_name, email.trim(), hash, city, street], (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.json({ success: false, msg: 'Email already exists' });
                }
                throw err;
            }
            res.json({ success: true, msg: results });
        });
    });
});

// post: check if user exists, his cart status, if he is the admin, save user data as cookie. (home.c)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email.trim() || !password.trim()) {
        return res.json({ success: false, msg: 'Missing fields.' });
    } else if (!email.includes('@') || !email.includes('.')) {
        return res.json({ success: false, msg: 'Incorrect email syntax.' });
    } else if (password.length > password.trim().length) {
        return res.json({ success: false, msg: 'White spaces used befor or after input.' });
    }

    pool.query(`
            SELECT * FROM users
            WHERE email = ?
        `, [email.trim()], (err, results) => {
        if (err) throw err;
        if (results.length) {
            const { user_id, first_name, last_name, password: hash, city, street, admin } = results[0];
            bcrypt.compare(password, hash, (err, same) => {
                if (err) throw err;
                // success login
                if (same) {
                    req.session.user = { first_name: first_name, last_name: last_name, city: city, street: street, user_id: user_id };
                    if (admin === 1) { // only admin gets this cookie
                        req.session.user.admin = true
                        res.json({ success: true, msg: 'admin' });
                    } else if (admin === 0) {
                        pool.query(`
                                SELECT COUNT(cart_id) AS user_carts FROM carts
                                WHERE user_id_fk = ?
                            `, [user_id], (err, isCartRes) => {
                            if (err) throw err;
                            // Check if user have carts
                            if (isCartRes[0].user_carts === 0) {
                                // New client (dosnt have cart)
                                res.json({ success: true, msg: `Welcome to your first WiStore experience.`, data: { first_name: req.session.user.first_name, last_name: req.session.user.last_name }, newCart: true });
                                return
                            } else if (isCartRes[0].user_carts > 0) {
                                // client have carts
                                pool.query(`
                                        SELECT cart_id, time_created_cart FROM carts
                                        WHERE user_id_fk = ? AND status = 1 
                                    `, [user_id], (err, resumeCartRes) => {
                                    if (err) throw err;
                                    // Check if user have OPEN carts
                                    if (resumeCartRes.length) {
                                        //client have open cart
                                        pool.query(`
                                                SELECT SUM(cp.sum_price) AS total_price FROM cart_products AS cp
                                                WHERE cp.cart_id_fk = ?
                                            `, [resumeCartRes[0].cart_id], (err, resumePriceRes) => {
                                            let cartDate = new Date(resumeCartRes[0].time_created_cart).toLocaleString()
                                            res.json({ success: true, msg: `You have open cart from ${cartDate}.\n Total price: ${resumePriceRes[0].total_price}$.`, data: { first_name: req.session.user.first_name, last_name: req.session.user.last_name }, newCart: false });
                                        })
                                        return
                                    } else {
                                        // client have old cart (after order)
                                        pool.query(`
                                                SELECT total_price, shipping_date, time_created_order FROM orders
                                                WHERE order_user_id_fk = ?
                                                ORDER BY time_created_order DESC
                                                LIMIT 1;
                                            `, [user_id], (err, lastOrderRes) => {
                                            let orderDate = new Date(lastOrderRes[0].time_created_order).toLocaleString()
                                            let shippingDate = new Date(lastOrderRes[0].shipping_date).toLocaleString().substring(0, 10)
                                            res.json({ success: true, msg: `Your last order placed at: ${orderDate}.\n Total price: ${lastOrderRes[0].total_price}$.\n Shipping date: ${shippingDate}`, data: { first_name: req.session.user.first_name, last_name: req.session.user.last_name }, newCart: true });
                                        })
                                        return
                                    }
                                })
                            }
                        })
                    }
                } else {
                    res.json({ success: false, msg: 'Invalid fields' });
                }
            });
        } else {
            res.json({ success: false, msg: 'The user is not Registered' });
        }
    });
});

// post: check if new/resume cart, send cart_id and cart_products to user (used in home.c(button to shop),shop.c)
app.route('/api/userCart')
    .post(isAuth, (req, res) => {
        pool.query(`
                SELECT COUNT(cart_id) AS activeUserCarts, cart_id FROM carts
                WHERE user_id_fk= ? AND status = 1
            `, [req.session.user.user_id], (err, results) => {
            if (err) throw err;
            if (results[0].activeUserCarts === 1) {
                // User have an active cart
                pool.query(`
                        SELECT cp.cart_product_id, cp.sum_price, cp.units, p.product_name, p.image FROM cart_products AS cp
                        LEFT JOIN products AS p
                        ON cp.product_id_fk = p.id
                        WHERE cp.cart_id_fk = ?
                    `, [results[0].cart_id], (err, cpRes) => {
                    if (err) throw err;
                    req.session.active_cart_id = results[0].cart_id
                    res.json({ cartProducts: cpRes, msg: 'resume last cart' });
                })
                return
            } else if (results[0].activeUserCarts === 0) {
                // No active cart for this user
                pool.query(`
                        INSERT INTO carts (user_id_fk)
                        VALUES (?)
                    `, [req.session.user.user_id], (err, results2) => {
                    if (err) throw err;
                    req.session.active_cart_id = results2.insertId
                    res.json({ cartProducts: [], msg: 'new active cart' });
                    return
                })
            }
        });
    })

// get: send categories and products data to user (use in shop.component)
// post: insert/update product to db (admin.c)
app.route('/api/products')
    .get(isAuth, (req, res) => {
        pool.query(`SELECT * FROM categories`, (err, results) => {
            if (err) throw err;
            pool.query(`SELECT * FROM products`, (err, results2) => {
                if (err) throw err;
                res.json({ success: true, categoriesData: results, productsData: results2 });
            })
        })
    })
    .post(isAdmin, (req, res) => {
        const { id, category_id, image, price, product_name, isNew } = req.body

        if (!product_name.trim()) {
            return res.json({ success: false, msg: 'Missing product name.' });
        } else if (!image.trim()) {
            return res.json({ success: false, msg: 'Missing image.' });
        } else if (typeof isNew !== "boolean") {
            return res.json({ success: false, msg: 'Something Went wrong, Referesh page.' });
        } else if (isNaN(price) || price === null) {
            return res.json({ success: false, msg: 'Invalid price' });
        } else if (isNaN(category_id) || category_id === null) {
            return res.json({ success: false, msg: 'Missing category.' });
        }

        if (isNew) {
            // New product
            pool.query(`
                    INSERT INTO products (product_name, category_id, price, image)
                    VALUES (?,?,?,?)
                `, [product_name, category_id, price, image], (err, results) => {
                if (err) throw err;

                res.json({ success: true, product_id: results.insertId });
                return
            })
        } else if (!isNew) {
            // Update product
            if (isNaN(id) || id === null) {
                return res.json({ success: false, msg: 'Something Went wrong, Referesh page.' });
            }

            pool.query(`
                    UPDATE products SET product_name = ?, category_id = ?, price = ?, image = ?
                    WHERE (id = ?);
                `, [product_name, category_id, price, image, id], (err, results) => {
                if (err) throw err;

                res.json({ success: true });
                return
            })
        }
    })

// post: insert chosen product to cart product with users cart id. (shop.c)
app.post('/api/productToCart', isAuth, (req, res) => {
    const { product_id_fk, units } = req.body
    // Second units secure as natural number
    let unitsNatural = Math.sqrt(Math.pow(Math.floor(units), 2))

    if (isNaN(product_id_fk)) {
        return new Error('Product id changed')
    }// In case user change product_id state

    pool.query(`
            SELECT price FROM jbh_4th_project.products
            WHERE id = ?
        `, [product_id_fk], (err, priceCheckRes) => {
        if (err) throw err;
        let sumPriceCheck = priceCheckRes[0].price * unitsNatural

        pool.query(`
                INSERT INTO cart_products (cart_id_fk, product_id_fk, units, sum_price)
                VALUES (?,?,?,?)
            `, [req.session.active_cart_id, product_id_fk, unitsNatural, sumPriceCheck], (err, results) => {
            if (err) throw err;
            res.json({ success: true, cart_product_id: results.insertId, real_sum_price: sumPriceCheck });
            return
        })
    })
})

// post: deletes users chosen product from cart, remove it from cart products in db  (shop.c)
app.post('/api/deleteProductFromCart', isAuth, (req, res) => {
    const { cart_product_id } = req.body

    if (isNaN(cart_product_id)) {
        return new Error('Product id changed')
    }// In case user change product_id state

    pool.query(`
            DELETE FROM jbh_4th_project.cart_products
            WHERE cart_product_id = ?;
        `, [cart_product_id], (err, results) => {
        if (err) throw err;
        res.json({ success: true, data: results });
        return
    })
})

// post: deletes all user cart product, remove from db (shop.c)
app.post('/api/deleteAllProductFromCart', isAuth, (req, res) => {
    pool.query(`
            DELETE FROM jbh_4th_project.cart_products
            WHERE cart_id_fk = ?;
        `, [req.session.active_cart_id], (err, results) => {
        if (err) throw err;

        res.json({ success: true });
        return
    })
})

// get: bring all orders shipping dates that exists 3 times in db and put them in a array. (shop.c)
app.get('/api/unavailableDates', isAuth, (req, res) => {
    let unavailableDatesArr = []

    pool.query(`
            SELECT shipping_date, COUNT(order_id) AS times_picked FROM orders
            GROUP BY shipping_date 
        `, (err, results) => {
        if (err) throw err;
        if (results.length) {
            for (let i = 0; i < results.length; i++) {
                if (results[i].times_picked >= 3) {
                    let localDateArr = new Date(results[i].shipping_date).toLocaleString().substring(0, 10).split('/')
                    let localDateToStr = localDateArr[2] + '-' + localDateArr[0] + '-' + localDateArr[1]
                    // create a valid local date and push to array. 
                    // cant find a better method to create the correct date string
                    if (localDateToStr.includes(' ') || localDateToStr.includes(',')) {
                        localDateToStr = localDateToStr.replace(' ', '').replace(',', '')
                    }
                    unavailableDatesArr.push(localDateToStr)
                }
            }
        }
        res.json({ success: true, unavailableDates: unavailableDatesArr });
        return
    })
})

// post: insert user order to db, update his active cart status to obsolete (shop.c)
app.post('/api/order', isAuth, (req, res) => {
    const { order_city, order_street, shipping_date } = req.body

    if (!order_city.trim() || !order_street.trim()) {
        return res.json({ success: false, msg: 'Missing fields.' });
    } else if (new Date(shipping_date) < new Date() || new Date(shipping_date) == 'Invalid Date') {
        return res.json({ success: false, msg: 'Invalid Date.' });
    }

    //Chosen date to local date yyyy-mm-dd
    let localDateArr = new Date(shipping_date).toLocaleString().substring(0, 10).split('/')
    let localDateToDB = localDateArr[2] + '-' + localDateArr[0] + '-' + localDateArr[1]
    if (localDateToDB.includes(' ') || localDateToDB.includes(',')) {
        localDateToDB = localDateToDB.replace(' ', '').replace(',', '')
    }

    // Check shipping date again, get total price from db with query, insert order, update cart status.
    pool.query(`
            SELECT COUNT(order_id) AS same_date FROM orders
            WHERE shipping_date = ?
        `, [localDateToDB], (err, shippingRes) => {
        if (err) throw err;
        if (shippingRes[0].same_date >= 3) {
            res.json({ success: false, msg: 'Shipping date unavailable, Please chose different date' });
            return
        } else if (shippingRes[0].same_date < 3) {
            pool.query(`
                    SELECT SUM(cp.sum_price) AS total_price FROM cart_products AS cp
                    WHERE cp.cart_id_fk = ?
                `, [req.session.active_cart_id], (err, results) => {
                if (err) throw err;
                pool.query(`
                        INSERT INTO orders (order_user_id_fk, order_cart_id_fk, total_price, order_city, order_street, shipping_date)
                        VALUES (?,?,?,?,?,?)
                    `, [req.session.user.user_id, req.session.active_cart_id, results[0].total_price, order_city, order_street, localDateToDB], (err, orderRes) => {
                    if (err) throw err;
                    pool.query(`
                            UPDATE carts SET status = 0 
                            WHERE cart_id = ?;
                        `, [req.session.active_cart_id], (err, orderRes) => {
                        if (err) throw err;
                        req.session.lastOrder = { last_cart_id: req.session.active_cart_id, order_user_id: req.session.user.user_id };
                        res.json({ success: true, msg: 'Order successful' });
                        return
                    })
                })
            })
        }
    })
})

// get: verify user order complete (used in conclude-order.c)
app.get('/api/auth/conclusion', isAuth, (req, res) => {
    if (req.session.lastOrder) {
        res.json({ success: true, msg: 'User Order verified' });
        return
    }
    res.json({ success: false, msg: 'Unidentified user' });
})

// get: create a receipt txt file and send it as download to user (conclusion.c)
// post: delete the receipt from folder
app.route('/api/receipt')
    .get(isAuth, (req, res) => {
        // check if current user have lastOrder cookie.
        // in case change user in same browser check if the receipt user id = current user id
        if (!req.session.lastOrder || req.session.lastOrder.order_user_id !== req.session.user.user_id) return res.sendStatus(403);

        pool.query(`
                SELECT cp.sum_price, cp.units, p.product_name FROM cart_products AS cp
                LEFT JOIN products AS p
                ON cp.product_id_fk = p.id
                WHERE cp.cart_id_fk = ?
            `, [req.session.lastOrder.last_cart_id], (err, cpRes) => {
            if (err) throw err;

            let textStr = ''
            let totalPrice = 0
            for (let i = 0; i < cpRes.length; i++) {
                textStr += `${cpRes[i].product_name}, *${cpRes[i].units}, ${cpRes[i].sum_price}$.\n`
                totalPrice += cpRes[i].sum_price
            }
            textStr += `\n Total Price: ${totalPrice}$`

            fs.writeFile(path.join(__dirname, 'user_receipt', `${req.session.lastOrder.last_cart_id}receipt.txt`), textStr, (err) => {
                if (err) throw err;
                const file = `${__dirname}/user_receipt/${req.session.lastOrder.last_cart_id}receipt.txt`;
                res.download(file) // Set disposition and send it.
            });
        })
    })
    .post(isAuth, (req, res) => {
        fs.unlink(path.join(__dirname, 'user_receipt', `${req.session.lastOrder.last_cart_id}receipt.txt`), (err) => {
            if (err) throw err;
        })
        res.json({ success: true, msg: `${req.session.lastOrder.last_cart_id}receipt.txt Deleted` })
    })

// post: upload image to folder and send his file name (admin.c)
app.post('/api/images', isAdmin, upload.single('image'), (req, res) => {
    res.json({ success: true, fileName: req.file.filename })
})

// post: delete/update changed image (admin.c)
app.post('/api/imageUpdateDelete', isAdmin, (req, res) => {
    const { isNew, lastImage, newImage, id } = req.body

    if (typeof isNew !== "boolean") {
        return res.json({ success: false, msg: 'Something Went wrong, Referesh page.' });
    }

    if (isNew) {
        // Changed image to a new product befor submit
        fs.unlink(path.join('./uploads', lastImage), (err) => {
            if (err) throw err
            res.json({ success: true, msg: `${lastImage} deleted successfuly` })
            return
        })
    } else if (!isNew) {
        // Changed image to Updated product
        if (isNaN(id) || id === null) {
            return res.json({ success: false, msg: 'Something Went wrong, Referesh page.' });
        }

        fs.unlink(path.join('./uploads', lastImage), (err) => {
            if (err) throw err
            pool.query(`
                    UPDATE products SET image = ?
                    WHERE (id = ?);
                `, [newImage, id], (err, results) => {
                if (err) throw err;
                res.json({ success: true, msg: `${newImage} updated successfuly` });
                return
            })
        })
    }
})

// get: send apiDoc.html, opens at http://localhost:3000/shopping/api
app.get('/shopping/api', (req, res) => {
    res.sendFile(path.join(__dirname + '/apiDoc/apiDoc.html'));
})

app.listen(port, () => console.log(`Server running on port ${port}`));