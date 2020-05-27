const MySqli = require ( 'mysqli' );

let conn = new MySqli({
    host: 'localhost',
    post: 3306,
    user: 'mega_user',
    pass: 'xZUuN6XOShUPvspF',
    db: 'mega_shop'
});

let db = conn.emit(false, '');

module.exports = {
    database: db
};