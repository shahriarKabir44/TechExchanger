

var app = angular.module('homepage', [])
app.controller('myController', ($scope, $http) => {
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
            onError(error)
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
    $scope.isAuthorized = 0
    $scope.currentUser = {}
    $scope.InitializeApp = () => {
        $scope.httpPost('/isAuthorized', {}, ({ data }) => {
            if (data) {
                $scope.isAuthorized = 1
                $scope.currentUser = data
                console.log(data)
                subscribeToPush()
            }
            else {
                localStorage.clear()
                $scope.isAuthorized = 0
                $scope.currentUser = null
            }
        }, () => { })
    }
    //authorized parts

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
        type: "",
        details: "",
        image1: "",
        image2: "",
        image3: "",
        image4: "",
        askedPrice: "",
        owner: $scope.currentUser.id,
        postedOn: "",
        lastUpdated: ""
    }
    $scope.initPostAd = () => {
        for (let n = 0; n < 4; n++) {
            toggleUploadStatus(n, 0)
            getel(`file${n + 1}`).value = null
        }
        $scope.uploadStat = [0, 0, 0, 0]
        $scope.newProduct = {
            type: "",
            details: "",
            image1: "",
            image2: "",
            image3: "",
            image4: "",
            askedPrice: "",
            owner: "",
            lastUpdated: ""
        }
        $('#postAd-modal').modal('show')
    }
    $scope.postAd = async () => {
        var imageIds = ['#file1', '#file2', '#file3', '#file4']
        var imageURLProperties = ['image1', 'image2', 'image3', 'image4']
        for (let n = 0; n < 4; n++) {
            toggleUploadStatus(n, 0)
        }
        $scope.newProduct = { ...$scope.newProduct, owner: $scope.currentUser.id },
            $scope.httpPost('/postAd', $scope.newProduct, async (data) => {
                $scope.newProduct.id = data.newProductid
                for (let n = 0; n < 4; n++) {
                    toggleUploadStatus(n, 1)
                    let url = await upload(`products/${$scope.currentUser.firstName + $scope.currentUser.firstName}/${$scope.newProduct.type}s/`, imageURLProperties[n], imageIds[n], data.newProductid)
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
        console.log(e)
        $scope.$apply(function () {
            $scope.name = "xnxx"
            console.log('object')
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
                    subscribeToPush()
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
                subscribeToPush()
            }
        }, () => { })
    }

})