var mongoDBUserModel = require('../MongoDBSchemas/UserSchema')
var jwt = require('jsonwebtoken')

const webPush = require('web-push')
webPush.setVapidDetails('mailto:abc@def.com', process.env.public_key, process.env.private_key)


module.exports = {

    findOneById: async function (id) {
        if (id == undefined) return null
        return await mongoDBUserModel.findById(id)
    },
    findOne: async function (filter) {
        return await mongoDBUserModel.findOne(filter)
    },
    getMany: async function (args) {
        var filterObject = {
            $and: []
        }
        if (args.firstName != undefined) {
            var pattern = RegExp(`^${args.firstName}`, 'i')
            filterObject.$and.push({ firstName: { $regex: pattern } })
        }
        if (args.lastName != undefined) {
            var pattern = RegExp(`^${args.lastName}`, 'i')
            filterObject.$and.push({ lastName: { $regex: pattern } })
        }
        if (args.phoneNumber != undefined) {
            var pattern = RegExp(`^${args.phoneNumber}`, 'i')
            filterObject.$and.push({ phoneNumber: { $regex: pattern } })
        }
        return await mongoDBUserModel.find(filterObject.$and.length ? filterObject : {}).limit(args.pageSize).skip((args.pageNo - 1) * args.pageSize)

    },
    updateInfo: async function (data) {
        var { id, curPassword } = data
        if (req.body.toStore.password == "") {
            delete data.toStore.password
        }
        var realUser = await this.findOne(id)

        if (realUser.password == curPassword) {
            var toSave = { ...data.toStore }
            await this.updateGeneral(id, toSave)
            toSave.id = id
            var user = { ...req.user, ...toSave }
            var token = jwt.sign(user, process.env.secret)
            return {
                data: {
                    user: user,
                    token: token
                }
            }
        }
        else {
            return { data: null }
        }
    },
    updateImage: async function (req) {
        var { id, imageURL } = req.body
        await this.updateGeneral(id, { imageURL: imageURL })
        var userToSave = { ...req.user, imageURL: imageURL }
        var authToken = jwt.sign(userToSave, process.env.secret)
        return {
            data: {
                token: authToken,
                user: userToSave
            }
        }

    },
    updateGeneral: async function (id, data) {
        return await mongoDBUserModel.findByIdAndUpdate(id, data)
    },
    create: async function (newUser) {
        try {
            var toSave = new mongoDBUserModel({ ...newUser, createdOn: (new Date() * 1) + '' })
            await toSave.save();
            var tempdata = {
                ...newUser,
                id: toSave._id
            }
            var token = jwt.sign(tempdata, process.env.secret)
            return {
                data: {
                    token: token,
                    user: tempdata
                }
            }
        } catch (error) {
            return { data: null }
        }
    },
    login: async function ({ phoneNumber, password }) {
        var data = await this.findOne({
            phoneNumber: phoneNumber,
            password: password
        })
        if (data == null) return ({ data: null })
        else {
            data.id = data._id
            delete data.password
            var toSend = {
                id: data.id,
                phoneNumber: data.phoneNumber,
                email: data.email,
                address: data.address,
                imageURL: data.imageURL,
                firstName: data.firstName,
                lastName: data.lastName,
                notificationId: data.notificationId,
            }
            var authHeader = jwt.sign(toSend, process.env.secret)
            return ({
                data: {
                    token: authHeader,
                    user: toSend
                }
            })
        }
    },
    sendPushNotification: async function (userId, message) {
        var user = await this.findOneById(userId)
        var notificationId = user.notificationId;
        if (notificationId != '') {
            await webPush.sendNotification(JSON.parse(sellerNotificationId), JSON.stringify(message))
        }
    }
}