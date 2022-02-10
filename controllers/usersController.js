const {User, Photo} = require('../models/models')
const ApiError = require('../error/apiError')


class UsersController {
    async getUsers(req, res, next) {
        let {count, page} = req.query;
        page = page || 1;
        count = count || 10;
        let offset = page * count - count;
        try {

            //Запрашиваем из БД пользователей с указанным сдвигом и количеством

            const usersResponse = await User.findAndCountAll({limit: count, offset: offset})

            //Перебираем массив элементов полученный из usersResponse в массиве row
            let idArray=[];
            usersResponse.rows.forEach(user => idArray.push(user.id))

            //Запрашиваем из БД пути к файлам для большой и маленькой картинки из папки статик для полльзователей
            //из массива idArray

            const photoResponse = await Photo.findAll({where:{userId:idArray}})

            let items =[];

            //Перебираем массив пользователей для создания массива items

            usersResponse.rows.forEach(user =>{
                let sphoto, lphoto;

            //Перебираем массив с данными о фото и по пользователю ищем большую и маленькую картинки

                photoResponse.forEach(element => {
                    if (element.dataValues.id === user.id) {
                        sphoto = element.dataValues.small;
                        lphoto = element.dataValues.large;
                    }
                })

            //Формируем массив items для ответа клиенту

                items.push({name:user.name, id:user.id, photos:{small:sphoto, large:lphoto}, status:user.status, followed:false});
            })

            res.status(200).json({items:items, totalCount:usersResponse.count, error:null});

        } catch (e) {
            return next(ApiError.internal("Ошибка при получении данных"))
        }
    }
}

module.exports = new UsersController();

//request GET - http://localhost:5000/api/users?page=2&count=2
// если page или count остутствуют, тогда занчения по умолчанию
// page=1
// count=10
//response
//Список пользователей со страницы page в количестве count
//{
//     "items": [
//     {
//         "name": "Shubert",
//         "id": 1,
//         "photos": {
//             "small": null,
//             "large": null
//         },
//         "status": null,
//         "followed": false
//     },
//     {
//         "name": "Hacker",
//         "id": 2,
//         "photos": {
//             "small": null,
//             "large": null
//         },
//         "status": null,
//         "followed": false
//     }
// ],
//     "totalCount": 30,
//     "error": null
// }