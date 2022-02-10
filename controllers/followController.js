const {User, Followed} = require('../models/models.js')
const ApiError = require("../error/apiError");

class FollowController {
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async getCheckFollowedUserId (req, res, next) {
        //Получаем данные из мидлвара, который передал данные в реквест в объект юзер ID авторизированного пользователя

        const authUserID = req.user.id;

        //Достаем данные из параметров URL адреса :userID и помещаем ее в переменную setUserID
        //Если значение подписываемого пользователя заданы не верно, то полылается ошибка

        let getUserID;
        try {
            getUserID = req.params.userId.replace(/\s/g, '');
        }
        catch (e) {
            getUserID = req.params.userId;
        }
        if (!getUserID || getUserID ==='') return next(ApiError.badRequest("Не указан ID пользователя. Измените параметр и сделайте новый запрос"));

        //Проверяем не хотят ли проверить подписку на самого себя

        if (Number(getUserID) === authUserID) return next(ApiError.badRequest("Вы не можете проверить подписку на самого себя!"));
        //Проверяем наличие пользователя на которого подписываемся в БД

        let dataGetUserId;

        try {
            dataGetUserId = await User.findOne({where: {id: getUserID}});
        }
        catch (e){
            return next(ApiError.badRequest("Пользователь с таким id не найден. Проверить подписку не возможно"));
        }

        // Если пользователь возвращается нулевым или undefined, то ошибка

        if (!dataGetUserId) return next(ApiError.badRequest("Пользователь с таким id не найден. Проверить подписку не возможно"));

        //Проверяем наличие подписки на этого пользователя в БД

        try {
            const checkUserFollowed = await Followed.findOne({where:{userId:authUserID, followedUserId:getUserID}})
            if (checkUserFollowed) res.status(200).json({message:"true", userId:authUserID, followedUserId:getUserID});
            else res.status(200).json({message:"false"})
        }catch (e){
            return next(ApiError.internal("Произошла ошибка чтения из БД на сервере"));
        }
    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async setFollowUserId (req, res, next) {

        //Получаем данные из мидлвара, который передал данные в реквест в объект юзер ID авторизированного пользователя

        const authUserID = req.user.id;

        //Достаем данные из параметров URL адреса :userID и помещаем ее в переменную setUserID
        //Если значение подписываемого пользователя заданы не верно, то полылается ошибка

        let setUserID;
        try {
            setUserID = req.params.userId.replace(/\s/g, '');
        }
        catch (e) {
            setUserID = req.params.userId;
        }
        if (!setUserID || setUserID ==='') return next(ApiError.badRequest("Не указан ID пользователя. Измените параметр и сделайте новый запрос"));

        //Проверяем не хотят ли подписаться сами на себя

        if (Number(setUserID) === authUserID) return next(ApiError.badRequest("Вы не можете подписаться сами на себя!"));

        //Проверяем наличие пользователя на которого подписываемся в БД

        let dataSetUserId;
        try {
            dataSetUserId = await User.findOne({where: {id: setUserID}});
        }
        catch (e){
            return next(ApiError.badRequest("Пользователь с таким id не найден. Подписка не возможна"));
        }

        // Если пользователь возвращается нулевым или undefined, то ошибка

        if (!dataSetUserId) return next(ApiError.badRequest("Пользователь с таким id не найден. Подписка не возможна"));

        //Проверяем наличие подписки на этого пользователя в БД

        try {
            const checkUserFollowed = await Followed.findOne({where:{userId:authUserID, followedUserId:setUserID}})
            if (checkUserFollowed) return next(ApiError.badRequest("Вы уже подписаны на этого пользователя"));
        }catch (e){
            return next(ApiError.internal("Произошла ошибка чтения из БД на сервере"));
        }

        //Если все хорошо, то записываем данные о подписке в БД

        try {
            const follow = await Followed.create({userId:authUserID, followedUserId:setUserID})
        } catch (e)
        {
            return next(ApiError.internal("Произошла ошибка записи в БД на сервере"));
        }

        res.status(200).json({"authID":authUserID, "setID":setUserID, "message":"Все хорошо! Пользователь подписан"});
    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async setUnfollowUserId (req, res, next) {
        //Получаем данные из мидлвара, который передал данные в реквест в объект юзер ID авторизированного пользователя

        const authUserID = req.user.id;

        //Достаем данные из параметров URL адреса :userID и помещаем ее в переменную setUserID
        //Если значение подписываемого пользователя заданы не верно, то полылается ошибка

        let deleteUserID;
        try {
            deleteUserID = req.params.userId.replace(/\s/g, '');
        }
        catch (e) {
            deleteUserID = req.params.userId;
        }
        if (!deleteUserID || deleteUserID ==='') return next(ApiError.badRequest("Не указан ID пользователя. Измените параметр и сделайте новый запрос"));

        //Проверяем не хотят ли проверить подписку на самого себя

        if (Number(deleteUserID) === authUserID) return next(ApiError.badRequest("Вы не можете удалить подписку на самого себя!"));

        //Проверяем наличие пользователя на которого подписываемся в БД

        let dataDeleteUserId;

        try {
            dataDeleteUserId = await User.findOne({where: {id: deleteUserID}});
        }
        catch (e){
            return next(ApiError.badRequest("Пользователь с таким id не найден. Проверить подписку не возможно"));
        }

        // Если пользователь возвращается нулевым или undefined, то ошибка

        if (!dataDeleteUserId) return next(ApiError.badRequest("Пользователь с таким id не найден. Проверить подписку не возможно"));

        //Проверяем наличие подписки на этого пользователя в БД

        try {
            const checkUserFollowed = await Followed.findOne({where:{userId:authUserID, followedUserId:deleteUserID}})
            if (checkUserFollowed) {
                await checkUserFollowed.destroy();
                res.status(200).json({message:"Подписка удалена", userId:authUserID, followedUserId:deleteUserID});
            }
            else next(ApiError.internal("Этот пользователь на Вас не подписан"));
        }catch (e){
            return next(ApiError.internal("Произошла ошибка чтения или записи БД на сервере"));
        }

    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}

module.exports = new FollowController();

//request - GET - http://localhost:5000/api/follow/2
//headers {authorization:"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJOaWtpdGEiLCJpYXQiOjE2NDQzMD
//                                           M5ODgsImV4cCI6MTY0NDM5MDM4OH0.Rzhd-vVMnNc_Sie38MTxGnhv-dSXzbv8BQhFWNKq44Y"}
//response - {
//     "message": "true",
//     "userId": 2,
//     "followedUserId": "3"
// }


//request - POST - http://localhost:5000/api/follow/1
//headers {authorization:"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJOaWtpdGEiLCJpYXQiOjE2NDQzMD
//                                           M5ODgsImV4cCI6MTY0NDM5MDM4OH0.Rzhd-vVMnNc_Sie38MTxGnhv-dSXzbv8BQhFWNKq44Y"}
//response - {
//     "message": "Вы уже подписаны на этого пользователя"
// }
//или
// {
//     "authID": 2,
//     "setID": "4",
//     "message": "Все хорошо! Пользователь подписан"
// }

// request -DELETE - http://localhost:5000/api/follow/5
//headers {authorization:"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJOaWtpdGEiLCJpYXQiOjE2NDQzMD
//                                           M5ODgsImV4cCI6MTY0NDM5MDM4OH0.Rzhd-vVMnNc_Sie38MTxGnhv-dSXzbv8BQhFWNKq44Y"}
//response - {
//     "message": "Подписка удалена",
//     "userId": 2,
//     "followedUserId": "5"
// }