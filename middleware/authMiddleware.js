const jwt = require('jsonwebtoken');
const {User} = require("../models/models");

module.exports = async function (req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }
    try {

        //Достаем из Хедеров код авторизации jwt

        const token = req.headers.authorization.split(' ')[1];

        //Если кода jwt нет выдаем ошибку авторизации

        if (!token) return res.status(401).json({message:"Пользователь не авторизован"});

        //Декодируем и проверяем токен

        const decodedJwt = jwt.verify(token,process.env.SECRET_JWT_KEY);

        //Проверяем в БД относящийся к данному пользователю токен

        const candidateAuth = await User.findOne({where:{id:decodedJwt.id}});

        //Если токен из БД не совпадает с токеном из запроса, то выдаем ошибку авторизации

        if (candidateAuth.jwt !== token) return res.status(401).json({message:"Пользователь не авторизован!"});

        //Передаем данные из декодированного токена в req и вызываем функцию next

        req.user = decodedJwt;
        next();
    }catch (e){
        return res.status(401).json({message:"Пользователь не авторизован!"})
    }
}