// var app = angular.module('adminApp', [])
app.controller('unAuthorized', ($scope, $http) => {

    $scope.httpReq = async (url, body) => {
        var req = {
            url: url,
            method: body ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${localStorage.getItem('joe_biden')}`
            },
            data: body
        }
        var resp = await $http(req)
        return resp.data.data
    }
    $scope.isAuthorized = 0
    $scope.initApp = async () => {
        var user = $scope.httpReq('/isAuthorized')
        if (user) {
            $scope.isAuthorized = 1;
        }
    }
    $scope.f = () => {
        console.log($scope.xnXx)
    }
})
