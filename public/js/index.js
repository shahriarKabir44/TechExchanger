
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
            }
            else {
                $scope.isAuthorized = 0
                $scope.currentUser = null
            }
        }, () => { })
    }
    //authorized parts
    $scope.mycarts = []
    $scope.getmycarts = () => {

    }
    $scope.myads = []
    $scope.getMyAds = () => {
        console.log('object')
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
        $scope.httpPost('/signup', $scope.signupModel, ({ data }) => {
            if (!data) alert('invalid Phone number')
            else {
                localStorage.setItem('token', data.token)
                $scope.currentUser = data.user
                upload('profilePictures', 'proPic', ['#proPic'], 0, data.user.id, [], (urls) => {
                    $scope.httpPost('/updateProfilePicture', { id: $scope.currentUser.id, imageURL: urls[0] }, ({ data }) => {
                        localStorage.setItem('token', data.token)
                        $('#signup-modal').modal('hide')
                        $scope.currentUser = data.user
                        alert(`Welcome ${data.user.firstName}!`)
                        $scope.isAuthorized = 1
                    }, () => { })
                })
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
            }
        }, () => { })
    }

})