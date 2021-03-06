var app = angular.module('produstPage', [])

app.controller('productController', ($scope, $http) => {
    $scope.isAJAXBusy = 0
    $scope.httpPost = (url, data, onSuccess, onError) => {
        $scope.isAJAXBusy = 1
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
            $scope.isAJAXBusy = 0
            onSuccess(data)
        }, function (error) {
            $scope.isAJAXBusy = 0
            if (onError) onError(error)
        });
    }
    $scope.httpReq = async (url, toSend) => {
        $scope.isAJAXBusy = 1
        var req = {
            method: toSend ? 'POST' : 'GET',
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${localStorage.getItem('token')}`
            },
            data: toSend
        }
        var resp = await $http(req)
        $scope.$apply(function () {
            $scope.isAJAXBusy = 0
        })
        return resp.data.data
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

    }

    $scope.currentDisplayingProduct = {}
    $scope.userToProductRelation = 0
    $scope.p = "y"

    $scope.userToProductRelation = 0
    $scope.customerList = []
    $scope.setUserToProductRelation = () => {
        if ($scope.isAuthorized) {
            if ($scope.currentDisplayingProduct.owner == $scope.currentUser.id) {
                $scope.userToProductRelation = 1;
                $scope.setView()
                return
            }
            $scope.customerList.forEach(offerer => {
                if (offerer.Buyer.id == $scope.currentUser.id) {
                    $scope.userToProductRelation = 2
                    return
                }
            });
            $scope.setView()
        }

        else $scope.setView()

    }
    $scope.parseTime = (x) => {
        var time = new Date(x * 1)
        var res = time.getHours() + ":" + time.getMinutes() + " " + time.getDate() + '/' + time.getMonth() + '/' + time.getFullYear()
        return res
    }
    $scope.isAuthorized = 0
    $scope.currentUser = {}

    $scope.InitProductPage = () => {

        $scope.runPipeLine()
    }

    $scope.checkAuthorized = async () => {
        var userDat = await $scope.httpReq('/isAuthorized', {})
        if (!userDat.unauthorized) {
            $scope.isAuthorized = 1
            $scope.currentUser = userDat
        }
        else {
            $scope.isAuthorized = 0
            $scope.currentUser = null
        }
    }
    $scope.getProductDetails = async () => {

        var data = await $scope.httpReq('/graphql', getProductDetailsById($scope.productId))
        $scope.$apply(function () {
            $scope.currentDisplayingProduct = data.GetProductById

        })
    }

    $scope.getCustomers = async () => {
        var data = await $scope.httpReq('/graphql', getCustomerList($scope.productId))
        $scope.customerList = data.GetProductById.Offerers
    }
    $scope.getProductsBycategory = async () => {
        var data = await $scope.httpReq('/graphql', GetProductByCategoryGQL($scope.currentDisplayingProduct.category))
        $scope.$apply(function () {
            $scope.toShow = data.GetProductByCategory.filter(x => x.id != $scope.productId)
        })
    }

    $scope.runPipeLine = async () => {
        $scope.getProductId()
        await $scope.checkAuthorized()
        await $scope.getCustomers()
        await $scope.getProductDetails()
        await $scope.getProductsBycategory()
        $scope.isAJAXBusy = 0
        $scope.setUserToProductRelation()
    }

    $scope.setView = () => {
        if ($scope.userToProductRelation == 2) {
            $scope.myCartDetails = $scope.customerList.filter(x => x.Buyer.id == $scope.currentUser.id)[0]
        }
        else if ($scope.userToProductRelation == 0) {
            $scope.productStat = {
                maxOfffer: 0,
                minOffer: 10 ** 10,
                offerers: $scope.currentDisplayingProduct.customerCount
            }
            $scope.customerList.forEach(x => {
                $scope.productStat.maxOfffer = Math.max($scope.productStat.maxOfffer, x.offeredPrice)
                $scope.productStat.minOffer = Math.min($scope.productStat.minOffer, x.offeredPrice)

            })
        }
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
            $('#myCarts').modal('show')
        }, () => { })
    }
    $scope.myads = []
    $scope.getMyAds = () => {
        $scope.httpPost('/graphql', getMyAdsGQL($scope.currentUser.id), ({ data }) => {
            $scope.myads = data.User.Owned
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
        var usageNumber = $scope.usedFor.year * 12 + $scope.usedFor.month * 1

        if (usedFor == "") usedFor = "Brand new!"

        $scope.newProduct = { ...$scope.newProduct, owner: $scope.currentUser.id, usedFor: usedFor, usageNumber: usageNumber }
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
                $('#product-modal-ads').modal('hide')
            }, () => { })
        })

    }

    $scope.viewFullSize = (name) => {
        $scope.selectedImg = name
        $('#modal-fullscreen-xl').modal('show')
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
                    $scope.setUserToProductRelation()
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
                $scope.currentUser = data.user
                $('#login-modal').modal('hide')
                alert(`Welcome ${data.user.firstName}!`)
                localStorage.setItem('token', data.token)
                $scope.isAuthorized = 1
                $scope.setUserToProductRelation()

            }
        }, () => { })
    }

    $scope.products = {}
    $scope.toShow = []


    $scope.initiateAcceptOffer = (offerer) => {
        $scope.selectedBuyer = offerer
        $('#confirmationModal').modal('show')
    }

    $scope.cart = {

    }

    $scope.initializePostAd = () => {
        if (!$scope.isAuthorized) {
            $('#login-or-signup-modal').modal('show')
            return
        }
        $scope.initPostAd()
    }

    $scope.initAddToCart = () => {
        if (!$scope.isAuthorized) {
            $('#login-or-signup-modal').modal('show')
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
            whereToReceive: $scope.cart.whereToReceive
        }
        $scope.httpPost('/addToCart', newCart, ({ data }) => {
            $('#bargain-modal').modal('hide')
            $scope.userToProductRelation = 2
            $scope.customerList.push({
                Buyer: $scope.currentUser,
                offeredPrice: newCart.offeredPrice,
                time: (new Date() * 1) + '',
                whereToReceive: $scope.cart.whereToReceive
            })
            $scope.setView()
        })

    }

    $scope.removeFromCart = () => {
        if (!window.confirm('Are you sure?'))
            return
        $scope.httpPost('/graphql', removeCartGQL($scope.currentUser.id, $scope.productId), ({ data }) => {
            $scope.customerList = $scope.customerList.filter(x => x.Buyer.id != $scope.currentUser.id)
            $scope.userToProductRelation = 0
        })
    }
    $scope.viewProd = (id) => {
        location.href = "http://localhost:3000/product/" + id
    }


})


app.directive('customerlistComponent', function () {
    return {
        scope: {
            'customerList': '='
        },
        templateUrl: './mainSite/shared/templates/customerList.html',
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
        templateUrl: './mainSite/shared/templates/productCard.html',
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

        templateUrl: './mainSite/shared/templates/horizontalDisplayRow.html',
        link: function (scope) {
        }
    }
})

