const notificationSchema = require('../MongoDBSchemas/NotificationSchema')
module.exports = {
    create: async function (data) {
        var newNotif = new notificationSchema(data)
        await newNotif.save()
        return newNotif;
    },
    getNotificationsOfUser: async function (id) {
        return await notificationSchema.find({ receiverId: id })
    }
}