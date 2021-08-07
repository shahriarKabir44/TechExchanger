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


//graphqls
function getMyAdsGQL(id) {
    return {
        query: `query {User(id: "${id}"){
                Owned{
                    id      
                    category     
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
                    category        
                    details     
                    image1          
                }
                offeredPrice
                time
            }
        }}`
    }
}

function removeCartGQL(user, product) {
    return {
        query: `mutation{
            CartDelete(productId:"${user}",customerId:"${product}"){
              offeredPrice
            }
          }`
    }
}

function getMyNotificationsGQL(id) {
    return {
        query: `query {User(id: "${id}"){
            Notification{
                senderId   
                receiverId 
                category       
                productId  
                offer      
                time   
                Sender{
                    firstName
                    lastName
                } 
                Product{
                    category
                    image1
                }   
            }
        }}`
    }
}

function GetProductByCategoryGQL(category) {
    return {
        query: `query{ GetProductByCategory(Type:"${category}"){
              id
              image1
              customerCount
              askedPrice
              usedFor
            }
          }`
    }
}

var getProductDetailsById = id => {
    return {
        query: `query{ GetProductById(id:"${id}"){
            image1
            image2
            image3
            image4
            askedPrice
            details
            postedOn
            postedFrom
            category
            customerCount
            usedFor
            Owner{
              imageURL
              firstName
              lastName
            }
            owner
          }
        }`
    }
}

function getCustomerList(id) {
    return {
        query: `query{ GetProductById(id:"${id}"){
             
            Offerers{
              Buyer{
                id
                firstName
                lastName
                address
                imageURL
                
              }
              offeredPrice
              time
            }
             
             
          }
        }`
    }
}

//graphqls end

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

// if (navigator.serviceWorker) {
//     navigator.serviceWorker.register('/sw.js')
//         .then(registration => {

//         })
// }

// var public_key = 'BJ6uMybJWBmqYaQH5K8avYnfDQf9e-iX3euxlHrd6lh3ZBBPlmE8qYMhjoQCF7XACxgwe_ENW1DFT6nzsgsiaMc'

// function subscribeToPush() {
//     navigator.serviceWorker.ready.then(async (register) => {
//         const subscription = await register.pushManager.subscribe({
//             userVisibleOnly: true,
//             applicationServerKey: convertToUnit8Array(public_key),
//         })
//         fetch('/subscribe', {
//             method: 'POST',
//             headers: {
//                 'Content-type': 'application/json',
//                 'authorization': `bearer ${localStorage.getItem('token')}`
//             },
//             body: JSON.stringify(subscription)
//         })
//     })
// }

// function convertToUnit8Array(base64str) {
//     const padding = '='.repeat((4 - (base64str.length % 4)) % 4)
//     const base64 = (base64str + padding).replace(/\-/g, '+').replace(/_/g, '/')
//     const rawData = atob(base64)
//     var outputArray = new Uint8Array(rawData.length)
//     for (let n = 0; n < rawData.length; n++) {
//         outputArray[n] = rawData.charCodeAt(n)
//     }

//     return outputArray
// }

function viewProd(id) {
    console.log(id)
}
var parseTime = (x) => {
    var time = new Date(x * 1)
    var res = time.getHours() + ":" + time.getMinutes() + " " + time.getDate() + '/' + time.getMonth() + '/' + time.getFullYear()
    return res
}
function popupShortcut(x) {
    if (window.innerWidth < 1000)
        x ? getel('shortcutList').style.left = "0px" : getel('shortcutList').style.left = "-150px"
}

function renderCustomers(data) {
    var noCustomer = getel('noCustomer')
    var root = getel('customerListRoot')
    if (!data.length) {
        noCustomer.style.display = 'block'
        root.style.display = 'none'
    }
    else {
        noCustomer.style.display = 'none'
        root.style.display = 'block'
        root.innerHTML = `<tr>
        <td>Image </td>
        <td>Name </td>
        <td>offered </td>
        <td>Time </td>
        <td>Action </td>
    </tr>`
        data.forEach(offerer => {
            var s = `
        <tr>
            <td><img src="${offerer.Buyer.imageURL}" style="width: 30px;max-height: 30px;" alt=""></td>
            <td> ${offerer.Buyer.firstName} ${offerer.Buyer.lastName}</td>
            <td>${offerer.offeredPrice} taka </td>
            <td>${parseTime(offerer.time)}    </td>
            <td>  <button class="btn btn-success">Accept offer</button> </td>
        </tr>
        
        `
            root.innerHTML += s
        })
    }
}

function renderSimilarProducts(datas) {
    var productsRoot = getel('similarProductRoot')
    var noProductRoot = getel('noSimilarProductRoot')
    console.log(datas.length == 0)

    if (datas.length == 0) {
        productsRoot.style.display = 'none'
        noProductRoot.style.display = 'block'
        console.log('object')
        return
    }
    else {
        productsRoot.style.display = 'flex'
        noProductRoot.style.display = 'none'
        productsRoot.innerHTML = ''
        datas.forEach(currentProduct => {
            var s = `
            <div class="card" style="width:400px;flex: 0 0 auto">
                <div class="card-body">
                    <div class="crdbod product">
                        <div class="card m-3 pb-3" style="align-items: center;">
                            <img src="${currentProduct.image1}" style="width: 300px;height: 300px;" alt="">
                            <h4 class="text-success">Price: ${currentProduct.askedPrice} taka</h4>
                            <h5>Used for: ${currentProduct.usedFor}</h5>
                            <h6>${currentProduct.customerCount} user(s) have offered</h6>

                            <button onclick="viewProd(${currentProduct.id})" class="btn btn-primary">View Details</button>
                        </div>
                    </div>
                </div>
            </div>
            `
            productsRoot.innerHTML += s
        })
    }
}