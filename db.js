const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    process.env.DB_NAME,            //Название БД
    process.env.DB_USER,            //Имя пользователя БД
    process.env.DB_PASSWORD,        //Пароль от БД
    {
        dialect: 'postgres',        //Название СУБД
        host: process.env.DB_HOST,  //ХОСТ
        port: process.env.DB_PORT,  //ПОРТ
    }
)