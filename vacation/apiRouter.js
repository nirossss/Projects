const express = require('express');
const router = express.Router();
const { pool } = require('./dbconnection');
const { inputEvaluation } = require('./inputEvaluation')
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const { v4: uuid4 } = require('uuid');
const fs = require('fs');

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

const isAuth = (req, res, next) => {
    if (req.session.user) return next();
    res.sendStatus(403);
}

const isAdmin = (req, res, next) => {
    if (req.session.user.admin) return next();
    res.sendStatus(403);
}

router.route('/images')
    .post(isAdmin, upload.single('image'), (req, res) => {

        res.json({ success: true, fileName: req.file.filename })
    })
    .delete(isAdmin, (req, res) => {
        fs.unlink(path.join('./uploads', req.body.file), (err) => {
            if (err) throw err
            res.json({ success: true, msg: `${req.body.file} deleted successfuly` })
        })
    })// Only admin can use this api. (isAdmin middlewere)

router.get('/auth/verify', isAuth, (req, res) => {
    res.sendStatus(200);
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const inputEvalute = await inputEvaluation(req.body, 'login');

        if (!inputEvalute.success) {
            return res.json({ success: inputEvalute.success, msg: inputEvalute.msg });
        }
    } catch (error) {
        return new Error('Input Evaluation Error')
    }

    pool.query(`
            SELECT * FROM users
            WHERE email = ?
        `, [email], (err, results) => {
        if (err) throw err;

        if (results.length) {
            const { id, first_name, last_name, password: hash, admin } = results[0];

            bcrypt.compare(password, hash, (err, same) => {
                if (err) throw err;

                // success login
                if (same) {
                    req.session.user = { first_name: first_name, last_name: last_name, id: id, admin: admin === 1 };
                    res.json({ success: true, msg: 'success login' });
                } else {
                    res.json({ success: false, msg: 'Invalid fields' });
                }
            });
        } else {
            res.json({ success: false, msg: 'The user is not Registered' });
        }
    });
});

router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    try {
        const inputEvalute = await inputEvaluation(req.body, 'register');

        if (!inputEvalute.success) {
            return res.json({ success: inputEvalute.success, msg: inputEvalute.msg });
        }
    } catch (error) {
        return new Error('Input Evaluation Error')
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;

        pool.query(`
                INSERT INTO users (first_name, last_name, email, password)
                VALUES (?,?,?,?);
            `, [first_name, last_name, email, hash], (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.json({ success: false, msg: 'Email already exists' });
                }

                throw err;
            }

            res.json({ success: true, msg: results.insertId });
        });
    });
});

router.get('/logout', isAuth, (req, res) => {
    let dissconnectedID = req.session.user.id
    req.session.destroy();
    res.json({ success: true, msg: `user id: ${dissconnectedID} loged out` });
});

module.exports = router;