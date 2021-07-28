


function getMyAdsGQL(id) {
    return {
        query: `query {User(id: "${id}"){
                Owned{
                    id      
                    type     
                    details 
                    image1  
                    image2  
                    image3  
                    image4  
                    askedPrice
                    owner     
                    postedOn  
                }
            }}
         `
    }
}

function getMyCarts(id) {
    return {
        query: ` query{
            User(id: ${id}){
                Carts{
                    Product{
                        id          
                        type        
                        details     
                        image1      
                        image2      
                        image3      
                        image4      
                        askedPrice  
                        owner         
                        postedOn    
                    }
                    offeredPrice
                }
            }
        } `
    }
}

function getMyNotificationsGQL(id) {
    return {
        query: ` query{
            User(id: ${id}){
                Notification{
                    senderId   
                    receiverId 
                    type       
                    productId  
                    offer      
                    time       
                }
            }
        } `
    }
}




/**
 * 
 * @param {string} folderName 
 * @param {string} fileName 
 * @param {string[]} filesArray 
 * @param {Number} index 
 * @param {Number} ID 
 * @param {function} callback 
 * @param {string[]} URLs 
 */
function upload(folderName, fileName, filesArray, index, ID, URLs, callback) {
    const ref = firebase.storage().ref()
    const file = document.querySelector(filesArray[index]).files[0]
    const name = folderName + '/' + fileName + ID
    const metadata = {
        contentType: file.type
    }
    const task = ref.child(name).put(file, metadata)
    task
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then(url => {
            URLs.push(url)
            index++;
            if (index < filesArray.length) {
                upload(folderName, fileName, filesArray, index, ID, URLs, callback)
            }
            else {
                callback(URLs)
            }
        }).catch(er => alert('er'))
}