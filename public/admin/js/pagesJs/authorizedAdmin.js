app.controller('authorized', ($scope, $http) => {
    $scope.isLoading = 0
    $scope.httpReq = async (url, body) => {
        $scope.isLoading = 1
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
        $scope.$apply(function () {
            $scope.isLoading = 0
        })
        return resp.data.data
    }
    $scope.currentUser = {}
    $scope.initAuthorized = () => {
        $scope.currentUser = JSON.parse(localStorage.getItem('user'))
        localStorage.removeItem('user')
    }
    $scope.showType = 2;
    $scope.changeView = (x) => {
        $scope.showType = x;
    }

})

app.directive('productsView', function () {
    return {
        scope: {
        },
        controller: "products",

        templateUrl: '/admin/templates/authorized/productsView/productsView.html',
        link: function (scope) {
        }
    }
})

app.directive('usersView', function () {
    return {
        scope: {
        },
        controller: "users",

        templateUrl: '/admin/templates/authorized/usersView/usersView.html',
        link: function (scope) {
        }
    }
})
