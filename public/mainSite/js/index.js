

var app = angular.module('homepage', [])
app.controller('myController', ($scope, $http) => {
    //common part
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
            if (onError) onError(error)
        });
    }
    $scope.isAuthorized = 0
    $scope.currentUser = {}
    $scope.InitializeApp = () => {
        $scope.httpPost('/isAuthorized', {}, ({ data }) => {
            if (data.unauthorized) {
                localStorage.clear()
                $scope.isAuthorized = 0
                $scope.currentUser = null
            }
            else {
                $scope.isAuthorized = 1
                $scope.currentUser = data
                console.log(data)
                //subscribeToPush()
            }
            $scope.httpGet('/getStat', ({ data }) => {
                $scope.least_price = JSON.parse(data.least_price)
                $scope.least_used = JSON.parse(data.least_used)
                $scope.most_popular = JSON.parse(data.most_popular)

            })
        }, () => { })
    }

    $scope.parseTime = (x) => {
        var time = new Date(x * 1)
        var res = time.getHours() + ":" + time.getMinutes() + " " + time.getDate() + '/' + time.getMonth() + '/' + time.getFullYear()
        return res
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
        console.log($scope.currentUser.id)
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
                $('#product-modal-ads').modal('hide')

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
                //subscribeToPush()
            }
        }, () => { })
    }

    $scope.products = {}
    $scope.getProductsBycategory = () => {
        $scope.httpPost('/graphql', GetProductByCategoryGQL('Chair'), ({ data }) => {
            $scope.products['Chair'] = data.GetProductByCategory
            $scope.httpPost('/graphql', GetProductByCategoryGQL('Bed'), ({ data }) => {
                $scope.products['Bed'] = data.GetProductByCategory
                $scope.httpPost('/graphql', GetProductByCategoryGQL('Table'), ({ data }) => {
                    $scope.products['Table'] = data.GetProductByCategory
                })
            })
        })


    }
    $scope.getProductsBycategory()
    //common part end
    $scope.viewProd = (id) => {
        console.log(id)
        location.href = "product/" + id
    }

})


app.directive('productCard', function () {
    return {
        scope: {
            'currentProduct': '='
        },
        templateUrl: './mainSite/shared/templates/productCard.html',
        controller: "myController",

        link: function (scope) {
        }

    }
})

app.directive('cardList', function () {
    return {
        scope: {
            'productList': '='
        },
        controller: "myController",

        templateUrl: './mainSite/shared/templates/horizontalDisplayRow.html',
        link: function (scope) {
        }
    }
})