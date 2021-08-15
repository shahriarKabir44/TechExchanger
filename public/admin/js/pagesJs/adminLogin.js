// var app = angular.module('adminApp', [])

app.controller('unAuthorized', ($scope, $http) => {

    $scope.httpReq = async (url, body) => {
        var req = {
            url: SERVER_ROOT + url,
            method: body ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json',
                'jeffreyepstein': `bearer ${localStorage.getItem('joe_biden')}`
            },
            data: body
        }
        var resp = await $http(req)
        return resp.data.data
    }
    $scope.isAuthorized = 0
    $scope.initApp = async () => {
        var response = await $scope.httpReq('/')
    }
    $scope.loginModel = {}
    $scope.adminLogin = async () => {
        console.log($scope.loginModel)
        var resp = await $scope.httpReq('/login', $scope.loginModel)
        if (!resp) alert('Invalid Credentials!')
        else {
            localStorage.setItem('joe_biden', (resp.token))
            location.reload()
        }
    }
})
