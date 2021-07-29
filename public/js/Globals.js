function getel(x) {
    return document.getElementById(x)
}

var firebaseConfig = {
    apiKey: "AIzaSyBQSes_ECwHaryrF8vfsjVD_1wWf7cz8Wc",
    authDomain: "pqrs-9e8eb.firebaseapp.com",
    databaseURL: "https://pqrs-9e8eb.firebaseio.com",
    projectId: "pqrs-9e8eb",
    storageBucket: "pqrs-9e8eb.appspot.com",
    messagingSenderId: "998501066190",
    appId: "1:998501066190:web:0be1a2a2d5116d7c77b79f",
    measurementId: "G-54PCTERKRM"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

function getMyAdsGQL(id) {
    return {
        query: `query {User(id: "${id}"){
                Owned{
                    id      
                    type     
                    image1  
                    askedPrice
                    postedOn  
                }
            }}
        `
    }
}

function getMyCarts(id) {
    return {
        query: `query {User(id: "${id}"){
            Carts{
                Product{
                    id          
                    type        
                    details     
                    image1      
                    postedOn    
                }
                offeredPrice
            }
        }}`
    }
}

function getMyNotificationsGQL(id) {
    return {
        query: `query {User(id: "${id}"){
            Notification{
                senderId   
                receiverId 
                type       
                productId  
                offer      
                time   
                Sender{
                    firstName
                    lastName
                } 
                Product{
                    type
                    image1
                }   
            }
        }}`
    }
}

/**
 * 
 * @param {string} folderName 
 * @param {string} fileName 
 * @param {string} fileId 
 * @param {string} ID 
 */
function upload(folderName, fileName, fileId, ID) {
    const ref = firebase.storage().ref()
    const file = document.querySelector(fileId).files[0]
    const name = folderName + '/' + fileName + ID
    const metadata = {
        contentType: file.type
    }
    const task = ref.child(name).put(file, metadata)
    return task.then(snapshot => snapshot.ref.getDownloadURL())
}

function toggleUploadStatus(index, stat) {
    var spin = getel(`uploadstat${index}0`)
    var tick = getel(`uploadstat${index}1`)
    switch (stat) {
        case 0:
            spin.style.display = 'none'
            tick.style.display = 'none'
            break;
        case 1:
            spin.style.display = 'block'
            tick.style.display = 'none'
            break;
        case 2:
            spin.style.display = 'none'
            tick.style.display = 'block'
            break;
        default:
            break;
    }
}