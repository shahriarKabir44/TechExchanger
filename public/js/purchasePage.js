var app = angular.module('produstPage', [])

app.controller('productController', ($scope, $http) => {
    $scope.httpPost = (url, data, onSuccess, onError) => {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${localStorage.getItem('token')}`
            },
            data: data
        }
        $http(req).then(function ({ data }) {
            onSuccess(data)
        }, function (error) {
            if (onError) onError(error)
        });
    }
    $scope.httpGet = (url, onSuccess, onError) => {
        var req = {
            method: 'GET',
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${localStorage.getItem('token')}`
            },
        }
        $http(req).then(function ({ data }) {
            onSuccess(data)
        }, function (error) {
            onError(error)
        });
    }
    $scope.productId = 0
    $scope.getProductId = () => {
        var s = location.href.split('/')[4]
        $scope.productId = s;
        $scope.httpPost('/graphql', getCustomerList(s), ({ data }) => {
            $scope.customerList = data.GetProductById.Offerers
            renderCustomers(data.GetProductById.Offerers)
            $scope.setUserToProductRelation()
        })
    }

    $scope.currentDisplayingProduct = {}
    $scope.userToProductRelation = 0
    $scope.getProductDetails = () => {
        $scope.getProductId()
        console.log($scope.productId)
        $scope.httpPost('/graphql', getProductDetailsById($scope.productId), ({ data }) => {

            $scope.currentDisplayingProduct = data.GetProductById


        })
    }
    $scope.userToProductRelation = 0
    $scope.customerList = []
    $scope.setUserToProductRelation = () => {

        if ($scope.currentDisplayingProduct.owner == $scope.currentUser.id)
            $scope.userToProductRelation = 1

        $scope.customerList.forEach(offerer => {
            if ($scope.isAuthorized && offerer.Buyer.id == $scope.currentUser.id) {
                $scope.userToProductRelation = 2
                return
            }
        });
        console.log($scope.customerList)
    }

    $scope.isAuthorized = 0
    $scope.currentUser = {}
    $scope.getCurrentUser = () => {
        $scope.httpPost('/isAuthorized', {}, ({ data }) => {
            if (data) {
                $scope.isAuthorized = 1
                $scope.currentUser = data
                console.log(data)
                //subscribeToPush()
            }
            else {
                localStorage.clear()
                $scope.isAuthorized = 0
                $scope.currentUser = null
            }
            $scope.getProductDetails()

        }, () => { })
    }
    $scope.InitProductPage = () => {

        $scope.getCurrentUser()
    }

    //authorized parts

    $scope.toStore = {}
    $scope.UpdateInfo = () => {
        var toStore = { ...$scope.toUpdate }
        delete toStore.id
        delete toStore.curPassword
        var tosend = {
            id: $scope.currentUser.id,
            curPassword: $scope.toUpdate.curPassword,
            toStore: toStore
        }
        console.log(tosend)
        $scope.httpPost('/updateUser', tosend, ({ data }) => {
            if (data == null) {
                alert('Incorrect password!')
            }
            else {
                localStorage.setItem('token', data.token)
                $scope.currentUser = data.user
                alert('Updating sucessful!')
                $('#update-modal').modal('hide')
            }
        }, () => { })
    }

    $scope.initUpdate = () => {
        $scope.toUpdate = { ...$scope.currentUser }
        delete $scope.toUpdate.password

        $('#update-modal').modal('show')
    }

    $scope.mycarts = []
    $scope.getmycarts = () => {
        $scope.httpPost('/graphql', getMyCarts($scope.currentUser.id), ({ data }) => {
            $scope.mycarts = data.User.Carts
            console.log($scope.mycarts)
            $('#myCarts').modal('show')
        }, () => { })
    }
    $scope.myads = []
    $scope.getMyAds = () => {
        $scope.httpPost('/graphql', getMyAdsGQL($scope.currentUser.id), ({ data }) => {
            $scope.myads = data.User.Owned
            console.log(data.User.Owned)
            $('#product-modal-ads').modal('show')
        })
    }
    $scope.notifications = []
    $scope.getNotifications = () => {
        $scope.httpPost('/graphql', getMyNotificationsGQL($scope.currentUser.id), ({ data }) => {
            $scope.notifications = data.User.Notification
            $('#notif_modal').modal('show')
        }, () => { })
    }
    $scope.uploadStat = [0, 0, 0, 0]
    $scope.newProduct = {
        category: "",
        details: "",
        image1: "",
        image2: "",
        image3: "",
        image4: "",
        askedPrice: "",
        owner: $scope.currentUser.id,
        postedOn: "",
        lastUpdated: "",
        postedFrom: ""
    }
    $scope.usedFor = {
        "month": "0",
        "year": "0"
    }
    $scope.initPostAd = () => {
        for (let n = 0; n < 4; n++) {
            toggleUploadStatus(n, 0)
            getel(`file${n + 1}`).value = null
        }
        $scope.usedFor = {
            "month": "0",
            "year": "0"
        }
        $scope.uploadStat = [0, 0, 0, 0]
        $scope.newProduct = {
            category: "",
            details: "",
            image1: "",
            image2: "",
            image3: "",
            image4: "",
            askedPrice: "",
            owner: "",
            lastUpdated: "",
            postedFrom: ""
        }
        $('#postAd-modal').modal('show')
    }
    $scope.postAd = async () => {
        var imageIds = ['#file1', '#file2', '#file3', '#file4']
        var imageURLProperties = ['image1', 'image2', 'image3', 'image4']
        for (let n = 0; n < 4; n++) {
            toggleUploadStatus(n, 0)
        }
        var usedFor = ($scope.usedFor.year * 1 ? $scope.usedFor.year + "year(s)" : "") + ($scope.usedFor.month * 1 ? $scope.usedFor.month + "month(s)" : "")
        if (usedFor == "") usedFor = "Brand new!"

        $scope.newProduct = { ...$scope.newProduct, owner: $scope.currentUser.id, usedFor: usedFor }
        $scope.httpPost('/postAd', $scope.newProduct, async (data) => {
            $scope.newProduct.id = data.newProductid
            for (let n = 0; n < 4; n++) {
                toggleUploadStatus(n, 1)
                let url = await upload(`products/${$scope.currentUser.firstName + $scope.currentUser.firstName}/${$scope.newProduct.category}s/`, imageURLProperties[n], imageIds[n], data.newProductid)
                $scope.newProduct[imageURLProperties[n]] = url
                toggleUploadStatus(n, 2)

            }
            $scope.httpPost('/updateProduct', $scope.newProduct, ({ data }) => {
                $('#postAd-modal').modal('hide')
                alert('Your ad as been successfully posted!')
            }, () => { })
        })

    }

    navigator.serviceWorker.onmessage = e => {
        $scope.$apply(function () {
        })
    }

    $scope.logout = () => {
        if (window.confirm('Are you sure?')) {
            $scope.httpPost('/logout', {}, ({ data }) => {
                if (data) {
                    alert(`Hope we meet again, ${$scope.currentUser.firstName}!`)
                    $scope.isAuthorized = 0
                    $scope.currentUser = {}
                    localStorage.clear()
                    $scope.userToProductRelation = 0
                }

            })
        }
    }


    //authorized part end
    $scope.signupModel = {
        password: "",
        phoneNumber: "",
        email: "",
        address: "",
        imageURL: "",
        firstName: "",
        lastName: "",
    }
    $scope.submitSignUp = () => {
        $scope.httpPost('/signup', $scope.signupModel, async ({ data }) => {
            if (!data) alert('invalid Phone number')
            else {
                localStorage.setItem('token', data.token)
                $scope.currentUser = data.user

                var imageURL = await upload('profilePictures', 'propic', '#proPic', $scope.currentUser.id)
                $scope.httpPost('/updateProfilePicture', { id: $scope.currentUser.id, imageURL: imageURL }, ({ data }) => {
                    localStorage.setItem('token', data.token)
                    $('#signup-modal').modal('hide')
                    $scope.currentUser = data.user
                    alert(`Welcome ${data.user.firstName}!`)
                    $scope.isAuthorized = 1
                    $scope.setUserToProductRelation()

                    // subscribeToPush()
                }, () => { })
            }
        }, () => { })
    }


    $scope.loginEntity = {
        phoneNumber: "",
        password: ""
    }
    $scope.login = () => {
        $scope.httpPost('/login', $scope.loginEntity, ({ data }) => {
            if ((!data)) alert('Invalid credentials')
            else {
                console.log(data)
                $scope.currentUser = data.user
                $('#login-modal').modal('hide')
                alert(`Welcome ${data.user.firstName}!`)
                localStorage.setItem('token', data.token)
                $scope.isAuthorized = 1
                $scope.setUserToProductRelation()
                //subscribeToPush()
            }
        }, () => { })
    }

    $scope.products = {}
    $scope.getProductsBycategory = (category) => {
        $scope.httpPost('/graphql', GetProductByCategoryGQL(category), ({ data }) => {
            $scope.products[category] = data.GetProductByCategory
        })
    }
    $scope.getProductsBycategory('Bed')
    $scope.getProductsBycategory('Chair')
    $scope.getProductsBycategory('Table')

    $scope.cart = {

    }

    $scope.initAddToCart = () => {
        if (!$scope.isAuthorized) {
            return
        }
        $scope.cart = {
        }
        $('#bargain-modal').modal('show')

    }
    $scope.addToCart = () => {
        var newCart = {
            ownerId: $scope.currentDisplayingProduct.owner,
            productId: $scope.productId,
            customerId: $scope.currentUser.id,
            offeredPrice: $scope.cart.offeredPrice,
            productName: $scope.currentDisplayingProduct.category,
            customerName: $scope.currentUser.firstName + $scope.currentUser.lastName,
        }
        $scope.httpPost('/addToCart', newCart, ({ data }) => {
            $('#bargain-modal').modal('hide')
            $scope.userToProductRelation = 2
            $scope.customerList.push({
                Buyer: $scope.currentUser,
                offeredPrice: newCart.offeredPrice
            })
            renderCustomers($scope.customerList)
        })
    }

})


app.directive('customerlistComponent', function () {
    return {
        scope: {
            'currentProduct': '='
        },
        templateUrl: './shared/templates/customerList.html',
        controller: "productController",

        link: function (scope) {
        }

    }
})

app.directive('productCard', function () {
    return {
        scope: {
            'currentProduct': '='
        },
        templateUrl: './shared/templates/productCard.html',
        controller: "productController",

        link: function (scope) {
        }

    }
})

app.directive('cardList', function () {
    return {
        scope: {
            'productList': '='
        },
        controller: "productController",

        templateUrl: './shared/templates/horizontalDisplayRow.html',
        link: function (scope) {
        }
    }
})