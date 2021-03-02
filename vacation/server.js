const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { pool } = require('./dbconnection');
const apiRouter = require('./apiRouter');
const session = require('express-session');

const port = process.env.PORT || 3001;

const appSession = session({
    secret: process.env.SECRET || 'dasf#R$fg$TRA',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
});

io.use((socket, next) => {
    appSession(socket.request, {}, next);
});

io.use((socket, next) => {
    if (socket.request.session.user) return next();
    socket.disconnect();
});// "isAuth" for socket

io.on('connection', (socket) => {
    console.log(`New connection id ${socket.id}`);

    socket.on('toggle_follow', (data) => {
        let { userId, vacationId, followers, followRequest } = data

        if (userId !== socket.request.session.user.id) {
            return new Error('User id changed')
        }// In case user change id state

        pool.query(`
        SELECT COUNT(vacation_id) as count FROM follow
        WHERE user_id = ? AND vacation_id = ?
        `, [userId, vacationId], (err, results) => {
            if (err) throw err;

            if (results[0].count === 0 && followRequest) {
                pool.query(`
                INSERT INTO follow (user_id, vacation_id)
                VALUES (?,?);
                `, [userId, vacationId], (err, results2) => {
                    if (err) throw err;

                    setFollowersCb(followers, vacationId)
                });
            } else if (results[0].count === 1 && !followRequest) {
                pool.query(`
                DELETE FROM follow
                WHERE (user_id = ?) AND (vacation_id = ?);
                `, [userId, vacationId], (err, results2) => {
                    if (err) throw err;

                    setFollowersCb(followers, vacationId)
                });
            } // Confirm with database the follow/unfollow transaction. Prevent user from follow vacation more then 1 time
        });
    })

    // only admin can use this socket
    if (socket.request.session.user.admin) {
        socket.on('new_vacation', (data) => {
            let { description, destination, image, from_date, to_date, price } = data

            if (!description.trim() || !destination.trim() || !image.trim() || isNaN(new Date(from_date).getTime()) || isNaN(new Date(to_date).getTime()) || isNaN(price)) {
                return new Error('false data')
            }

            pool.query(`
            INSERT INTO vacations (description, destination, image, from_date, to_date, price)
            VALUES (?,?,?,?,?,?);
            `, [description, destination, image, from_date, to_date, price], (err, results) => {
                if (err) throw err;
                io.emit('push_new_vacation', { id: results.insertId, ...data })
            });
        })

        socket.on('update_vacation', (data) => {
            let { vacationId, description, destination, image, from_date, to_date, price } = data

            if (isNaN(vacationId) || !description.trim() || !destination.trim() || !image.trim() || isNaN(new Date(from_date).getTime()) || isNaN(new Date(to_date).getTime()) || isNaN(price)) {
                return new Error('false data')
            }

            pool.query(`
            UPDATE vacations SET description = ?, destination = ?, image = ?, from_date = ?, to_date = ?, price = ? 
            WHERE (id = ?);
            `, [description, destination, image, from_date, to_date, price, vacationId], (err, results) => {
                if (err) throw err;
                io.emit('push_update_vacation', { id: vacationId, ...data })
            });
        })

        socket.on('delete_vacation', (data) => {
            pool.query(`
            DELETE FROM follow
            WHERE (vacation_id = ?);
            `, [data.vacationId], (err, results) => {
                if (err) throw err;

                pool.query(`
                DELETE FROM vacations
                WHERE (id = ?);
                `, [data.vacationId], (err, results) => {
                    if (err) throw err;
                    io.emit('push_delete_vacation', { ...data })
                })
            });
        })// First delete the forign keys (vacation_id in follow table), Second delete vacation
    }// End of admin socket

    const { first_name, last_name, id } = socket.request.session.user

    // Only users that successfuly connected to socket can get vacations data
    pool.query(`SELECT * FROM vacations`, (err, results) => {
        if (err) throw err;

        pool.query(`
            SELECT vacation_id FROM follow
            WHERE user_id = ?
            `, [socket.request.session.user.id], (err, results2) => {
            if (err) throw err;

            if (socket.request.session.user.admin) {
                socket.emit('get_vacations', { vacations: results, onFollow: results2, userData: socket.request.session.user })
                return
            } //Only admin gets userData.admin key and value.

            socket.emit('get_vacations', { vacations: results, onFollow: results2, userData: { first_name: first_name, last_name: last_name, id: id } })
        })
    })

    socket.on('disconnect', () => {
        console.log(`Connection id ${socket.id} disconnected!`);
    });
});

const setFollowersCb = (followers, vacationId) => {
    pool.query(`
    UPDATE vacations SET followers = ? 
    WHERE (id = ?);
    `, [followers, vacationId], (err, results2) => {
        if (err) throw err;
        io.emit('push_follow', { vacationId: vacationId, followers: followers })
    }); // Avoid async emit
}

app.use(appSession);
app.use('/api/images', express.static('./uploads'));
app.use('/api', express.json());
app.use('/api', express.urlencoded({ extended: false }));
app.use('/api', apiRouter);
app.use((err, req, res, next) => {
    if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
    }

    next();
});// Error Catcher

http.listen(port, () => console.log(`Server running on port ${port}`));