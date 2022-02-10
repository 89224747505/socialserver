const sequelize = require('./../db');
const {DataTypes} = require('sequelize');

const User = sequelize.define('users',{
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    login: {type: DataTypes.STRING, unique: false},
    password: {type: DataTypes.STRING, allowNull: false},
    email: {type: DataTypes.STRING, unique: false},
    name:{type: DataTypes.STRING, allowNull: false},
    fullName:{type: DataTypes.STRING, allowNull: false},
    status:{type:DataTypes.STRING, allowNull: true},
    lookingForAJob:{type: DataTypes.BOOLEAN, defaultValue: 'false'},
    lookingForAJobDescription:{type: DataTypes.STRING, allowNull: true},
    jwt:{type:DataTypes.STRING, allowNull: true},
});

const Photo = sequelize.define('photo', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    small:{type: DataTypes.STRING, allowNull: true},
    large:{type: DataTypes.STRING, allowNull: true},
});

const Contacts = sequelize.define('contacts', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    github:{type: DataTypes.STRING, allowNull: true},
    vk:{type: DataTypes.STRING, allowNull: true},
    facebook:{type: DataTypes.STRING, allowNull: true},
    instagram:{type: DataTypes.STRING, allowNull: true},
    twitter:{type: DataTypes.STRING, allowNull: true},
    website:{type: DataTypes.STRING, allowNull: true},
    youtube:{type: DataTypes.STRING, allowNull: true},
    mainLink:{type: DataTypes.STRING, allowNull: true},
});

const Followed = sequelize.define('followed', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    userId: {type: DataTypes.INTEGER, allowNull:false},
    followedUserId: {type: DataTypes.INTEGER, allowNull:false},
});

User.hasOne(Photo);
Photo.belongsTo(User);

User.hasOne(Contacts);
Contacts.belongsTo(User);

User.hasMany(Followed);
Followed.belongsTo(User);


module.exports = {User, Photo, Contacts, Followed};