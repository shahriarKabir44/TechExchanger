

function httpGet(url, success, errorfn) {
    fetch(url)
        .then(res => res.json())
        .then(({ data }) => {
            success(data)
        })
        .catch(err => {
            errorfn(err)
        })
}
function httpPost(url, data, success, errorfn) {
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'appliction/json',
            'authorization': `bearer ${localStorage.getItem('token')}`
        }
    })
        .then(res => res.json())
        .then(({ data }) => {
            success(data)
        })
        .catch(err => {
            errorfn(err)
        })
}

function getMyAds(id, success, failure) {
    httpPost('/graphql', {
        query: ` query{
            User(id: ${id}){
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
            }
        } `
    }, (data) => {
        success(data)
    }, (error) => {
        failure(error)
    })
}

function getMyCarts(id, success, failure) {
    httpPost('/graphql', {
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
                }
            }
        } `
    }, (data) => {
        success(data)
    }, (error) => {
        failure(error)
    })
}

function getMyNotifications(id, success, failure) {
    httpPost('/graphql', {
        query: ` query{
            User(id: ${id}){
                Notification{
                    senderId   
                    recieverId 
                    type       
                    productId  
                    offer      
                    time       
                }
            }
        } `
    }, (data) => {
        success(data)
    }, (error) => {
        failure(error)
    })
}

function checkAuthorization(success, failure) {
    httpPost('/isAuthorized', {}, (data) => {
        if (data) {
            success(data)
        }
        else {
            failure(data)
        }
    }, () => { })
}

function login(loginData, success, failuer) {
    httpPost('/login', loginData, (data) => {
        success(data)
    }, failuer(data))
}

function signUp(signupData, success, failure) {
    httpPost('/signup', signupData, (data) => {
        success(data)
    }, failuer(data))
}
function postAd() {

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
function upload(folderName, fileName, filesArray, index, ID, callback, URLs) {
    const ref = firebase.storage().ref()
    const file = document.querySelector(filesArray[index]).files[0]
    const name = folderName + fileName + ID
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
                upload(folderName, fileName, filesArray, index, ID, callback)
            }
            else {
                callback(URLs)
            }
        }).catch(er => alert('er'))
}