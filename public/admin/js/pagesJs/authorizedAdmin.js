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
    $scope.showType = 3;
    $scope.changeView = (x) => {
        $scope.showType = x;
    }

})

app.directive('productList', function () {
    return {
        scope: {
        },
        controller: "products",

        templateUrl: '/admin/templates/authorized/productList/productList.html',
        link: function (scope) {
        }
    }
})

app.directive('usersView', function () {
    return {
        scope: {
        },
        controller: "users",

        templateUrl: '/admin/templates/authorized/userList/userList.html',
        link: function (scope) {
        }
    }
})
app.config(function ($routeProvider) {
    $routeProvider
        .when('/showUser/:id', {
            templateUrl: "/admin/templates/authorized/userDetails/userDetails.html",
            // controller: "authorized"
        })
        .when('/showProduct/:productId', {
            templateUrl: "/admin/templates/authorized/productDetails/productDetails.html",

        })
})