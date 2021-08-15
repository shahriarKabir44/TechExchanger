
app.controller('rootController', ($scope, $http) => {
    $http.isAuthorized = 0
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
    console.log('object')
    $scope.initAdmin = async () => {
        var authStat = await $scope.httpReq('/isAuthorized')
        console.log(authStat)
        if (authStat) {
            $scope.$apply(() => {
                $scope.isAuthorized = 1
            })
            $scope.currentUser = authStat.user
            localStorage.setItem('user', JSON.stringify($scope.currentUser))
        }
        else {
            $scope.$apply(() => {
                $scope.isAuthorized = 0
            })
            $scope.currentUser = null
            //localStorage.clear()
        }
    }
})





