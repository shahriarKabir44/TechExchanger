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

function getMyNotifs(id, success, failure) {
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

