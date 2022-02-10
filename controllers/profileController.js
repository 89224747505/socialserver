const {User, Contacts, Photo} = require('../models/models');
const ApiError = require('../error/apiError');
const uuid = require('uuid');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//async registration(req, res, next) - функция регистрации нового пользователя
//async setPhotoProfile(req, res, next) - функция установки фотографии пользователя
//async setStatusProfile(req, res, next) - функция установки статуса пользователя
//async getStatusProfileUserId(req, res, next) - функция получения статуса пользователя
//async getProfileUserId(req, res, next) - функция получения профиля пользователя
//Информация по запросам в конце файла

class ProfileController {
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async registration(req, res, next) {
        let userResponse, contactResponse, photoResponse;

        // Получение данных о новом пользователе и записывание в переменные--------------------------------------------

        const newUserProfile = req.body;
        const { login,
                password,
                email,
                name,
                fullName,
                status,
                lookingForAJob,
                lookingForAJobDescription} = newUserProfile;
        const {github, vk, facebook, instagram, twitter, website, youtube, mainLink} = newUserProfile.contacts;

        //Проверяем заполненность пароля и email и логина

        if (!email || !password || !login) return next(ApiError.badRequest("Неверно введеные логин, почта или пароль!"));

        //Делаем запрос в БД на наличие пользователей с таким e-mail и логином

        const candidateMail = await User.findOne({where:{email}});
        const candidateLogin = await User.findOne({where:{login}});

        //Если пользователи с таким емаил существуют, тогда отправить ошибку с выбором другого емайла

        if (candidateMail || candidateLogin) return next(ApiError.badRequest("Пользователь с таким e-mail или логин уже существует. Выберите другой!"));

        //Шифруем переданный нам пароль

        const hashPassword = await bcrypt.hash(password, 5);

        // Запись данных в 3 таблицы БД------------------------------------------------------------------

        try {
            userResponse = await User.create({login, password:hashPassword, email, name, fullName, status,
                                                    lookingForAJob, lookingForAJobDescription, jwt:null})
            contactResponse = await Contacts.create({github, vk, facebook, instagram, twitter,
                                                            website, youtube, mainLink, userId:userResponse.id})
            photoResponse = await Photo.create({small:null, large:null, userId:userResponse.id})
        }
        catch (e) {
            return next(ApiError.internal("Ошибка сервера. Запись в БД не удалась!!!"))
        }

        //Создание JWT токена

        const jwtToken = jwt.sign({id:userResponse.dataValues.id, login:userResponse.dataValues.login},
            process.env.SECRET_JWT_KEY,{expiresIn:'24h'});

        //Добавляем токен в БД

        let userToken = await User.update({jwt:jwtToken},{where:{id:userResponse.dataValues.id}})

        // Оправка ответа если все прошло хорошо и запись в БД состоялась успешно

        res.status(200).json({ user:userResponse.dataValues, contacts:contactResponse.dataValues,
                           photo:photoResponse.dataValues, message:"Все данные получены! Новый пользователь создан!",
                           jwt:jwtToken});
    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async setPhotoProfile(req, res, next) {

        const {userId} = req.body;

        // Проверка корректного ввода запроса с файлом и userId---------------------

        if (!userId || !req.files) return next(ApiError.badRequest("Не указан ID пользователя или не прикреплен файл" +
                                                               " картинки. Измените параметр и сделайте новый запрос"));

        const {image} = req.files;

        if (!image) return next(ApiError.badRequest("Введите корректное имя свойства <<img>>"));

        // Блок проверки и удаления файлов small/large из static, если значения не нулевые

        try {
            let oldPhotoPath;
            oldPhotoPath = await Photo.findOne({where: {userId}});

            const {small, large} = oldPhotoPath.dataValues;

            if (small !== null) {
            fs.unlink(path.resolve(__dirname,'..','static', small),(err)=>{
                if (err) return next(ApiError.badRequest("Ошибка удаление small картинки"))})}

            if (large !== null) {
            fs.unlink(path.resolve(__dirname,'..','static', large),(err)=>{
                if (err) return next(ApiError.badRequest("Ошибка удаление large картинки"))})}
        }
        catch (e){
            return next(ApiError.internal("Ошибка удаления файлов с сервера"))
        }

        // Прописывание путей для большой и маленькой картинки с помощью uuid-------------------------

        let uuidMy = uuid.v4();
        let fileNameSmallWithoutDir =  uuidMy + 'small.jpg';
        let fileNameLargeWithoutDir =  uuidMy + 'large.jpg';
        let fileNameLarge = path.resolve(__dirname, '..', 'static', fileNameLargeWithoutDir);
        let fileNameSmall = path.resolve(__dirname, '..', 'static', fileNameSmallWithoutDir);

        // Из объекта image в котором храниться картинка сохраняет большую картинку в файле-----------------------------

        await image.mv(fileNameLarge);

        // Делает из большой картинки маленькую и записывает в папку статик-------------------------------------------

        await sharp(fileNameLarge).resize(100, 100).toFile(fileNameSmall, function(err) {
                if (err) return next(ApiError.internal("Ошибка сервера. Запись в БД не удалась!!!"))});

        // Обновляет данные о путях расположения большой и маленькой картинки в БД------------------------------------

        await Photo.update({small:fileNameSmallWithoutDir, large:fileNameLargeWithoutDir}, {where: {userId}})
            .then(result => {res.status(200).json({message:'Все хорошо! Фотография загружена в БД'})})
            .catch(err =>{return next(ApiError.internal("Ошибка сервера. Запись в БД не удалась!!!"))});
    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async setStatusProfile(req, res, next) {
        let statusResponse;
        let {id, status} = req.body;

        if (!id || id ==='') {
            return next(ApiError.badRequest("Не указан ID пользователя. Измените параметр и сделайте новый запрос"))
        }
        if (!status || status ==='') {
            return next(ApiError.badRequest("Не указан статус пользователя. Измените параметр и сделайте новый запрос"))
        }
        try {
            statusResponse = await User.update({status},{where: {id}});

            res.status(200).json({message:'Все хорошо!!! Статус пользователя изменен в БД'});
        }
        catch (e){
            return next(ApiError.internal("Ошибка сервера, проверьте корректность записи запроса"))
        }
    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async getStatusProfileUserId(req, res, next) {
        let id;
        let statusUserId;
        try {
            id = req.params.userId.replace(/\s/g, '');
        }
        catch (e) {
            id = req.params.userId;
        }

        if (!id || id ==='') {
            return next(ApiError.badRequest("Не указан ID пользователя. Измените параметр и сделайте новый запрос"))
        }
        try {
            statusUserId = await User.findOne({where: {id}});
            const {status} = statusUserId.dataValues;
            res.status(200).json({status});
        }
        catch (e){
            return next(ApiError.internal("Ошибка сервера"))
        }
    }

    async getProfileUserId(req, res, next) {
        let id;
        let dataUserId, contactsUserId, photoUserId;
        try {
           id = req.params.userId.replace(/\s/g, '');
        }
        catch (e) {
            id = req.params.userId;
        }

        if (!id || id ==='') {
            return next(ApiError.badRequest("Не указан ID пользователя. Измените параметр и сделайте новый запрос"))
        }
        try {
            dataUserId = await User.findOne({where: {id}});
            contactsUserId = await Contacts.findOne({where:{userId:id}});
            photoUserId = await Photo.findOne({where:{userId:id}});

            const {email, name, fullName, status, lookingForAJob, lookingForAJobDescription} = dataUserId.dataValues;
            const {github, vk, facebook, instagram, twitter, website, youtube, mainLink} = contactsUserId.dataValues;
            const {small, large} = photoUserId.dataValues;

            res.status(200).json({userId:id, email, name, fullName, status, lookingForAJob, lookingForAJobDescription,
                contacts:{github, vk, facebook, instagram, twitter, website, youtube, mainLink},
                photos:{small, large}});
        }
        catch (e){
            return next(ApiError.internal("Ошибка сервера"))
        }
    }
}

module.exports = new ProfileController();


//request PUT - http://localhost:5000/api/profile
// {
//     "login": "122",
//     "password":"asdfBAST8495",
//     "email":"2341241289224747505@mail.ru",
//     "name":"212312",
//     "status":"же2нат",
//     "lookingForAJob":"true",
//     "lookingForAJobDescription":"Очень сильно ищу работёнку",
//     "fullName":"Зырянов Иван Валерьевич",
//     "contacts":{
//     "github":"null",
//         "vk":"null",
//         "facebook":"null",
//         "instagram":"null",
//         "twitter":"null",
//         "website":"null",
//         "youtube":"null",
//         "mainLink":"null"
// }
// }
//response
// {
//     "user": {
//     "id": 11,
//         "login": "122",
//         "password": "asdfBAST8495",
//         "email": "2341241289224747505@mail.ru",
//         "name": "212312",
//         "fullName": "Зырянов Иван Валерьевич",
//         "status": "же2нат",
//         "lookingForAJob": true,
//         "lookingForAJobDescription": "Очень сильно ищу работёнку",
//         "updatedAt": "2022-02-05T06:21:27.587Z",
//         "createdAt": "2022-02-05T06:21:27.587Z"
// },
//     "contacts": {
//     "id": 11,
//         "github": "null",
//         "vk": "null",
//         "facebook": "null",
//         "instagram": "null",
//         "twitter": "null",
//         "website": "null",
//         "youtube": "null",
//         "mainLink": "null",
//         "userId": 11,
//         "updatedAt": "2022-02-05T06:21:27.659Z",
//         "createdAt": "2022-02-05T06:21:27.659Z"
// },
//     "photo": {
//     "id": 11,
//         "small": null,
//         "large": null,
//         "userId": 11,
//         "updatedAt": "2022-02-05T06:21:27.663Z",
//         "createdAt": "2022-02-05T06:21:27.663Z"
// },
//     "message": "Все данные получены! Новый пользователь создан!",
//     "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjcsImxvZ2luIjoiZmYiLCJpYXQiOjE2NDQxMzg5MTAsImV4cCI6MTY0NDIyNTMxMH0.2ZH0I9F742q2bc0muvZIEB-79FfFOHaJrdKX1fCpPfw"
// }

// request PUT - http://localhost:5000/api/profile/photo
// BODY
// image:"2.jpg"
// userId:"1"
// response OK

//request PUT - http://localhost:5000/api/profile/status
// {
//     "id":"9",
//     "status":"не женись, жена будет пилить"
// }
//response OK

//request GET - http://localhost:5000/api/profile/status/9
//response
// {
//     "status": "no"
// }

//request GET - http://localhost:5000/api/profile/9
//response
// {
//     "userId": "9",
//     "email": "89224747505@mail.ru",
//     "name": "Peter",
//     "fullName": "Johnson Peter",
//     "status": "не женись, жена будет пилить",
//     "lookingForAJob": true,
//     "lookingForAJobDescription": "No",
//     "contacts": {
//     "github": "github",
//         "vk": "vk",
//         "facebook": "facebook",
//         "instagram": "instagram",
//         "twitter": "twitter",
//         "website": "website",
//         "youtube": "youtube",
//         "mainLink": "mainLink"
// },
//     "photos": {
//     "small": "6a5807c5-2037-4ee5-b53c-e537d767f2e8small.jpg",
//         "large": "6a5807c5-2037-4ee5-b53c-e537d767f2e8large.jpg"
// }
// }