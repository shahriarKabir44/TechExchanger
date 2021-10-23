const notificationSchema = require('../MongoDBSchemas/NotificationSchema')
module.exports = function () {
    this.create = async function (data) {
        var newNotif = new notificationSchema(data)
        await newNotif.save()
        return newNotif;
    }
    this.getNotificationsOfUser = async function (id) {
        return await notificationSchema.find({ receiverId: id })
    }

}