app.controller('users', ($scope, $http) => {
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
    $scope.currentPageNumber = 1
    $scope.pageSize = 2;
    $scope.userCount = 0
    $scope.pageCount = 0
     $scope.userList = []
    $scope.getUserNumber = async () => {
        var x = await $scope.httpReq('/countEntities/1')
        $scope.pageCount = Math.ceil(x / $scope.pageSize)
        $scope.$apply(() => {
            $scope.userCount = x
            $scope.pageButtonsArray = new Array($scope.pageCount).fill(0).map((x, ind) => { return ind + 1 })
            $scope.pageButtonsArray = [-1, ...$scope.pageButtonsArray,-2]
        })

    }
    $scope.initUserPage = () => {
        $scope.getUserNumber()
        $scope.getUsers()
    }
    $scope.getUsers = async () => {
        var getUsersGQL = {
            query: `query{
                Users(pageNo:${$scope.currentPageNumber},pageSize:${$scope.pageSize}){
                  
                  fullName
                  phoneNumber
                  imageURL
                  id
                  createdOn
                }
              }`
        }
        var users = await $scope.httpReq('/biden', getUsersGQL)

        $scope.$apply(() => {
            $scope.userList = users.Users
        })
    }
    $scope.gotoPage = (x) => {
        $scope.currentPageNumber = x
        $scope.getUsers()
    }
    $scope.changePage = (x) => {
        if ($scope.currentPageNumber + x == 0 || $scope.currentPageNumber + x == $scope.pageCount + 1) return
         $scope.gotoPage($scope.currentPageNumber + x )
    }
    $scope.parseDate = (x) => {
        var time = new Date(x * 1)
        var res = time.getHours() + ":" + time.getMinutes() + " " + time.getDate() + '/' + time.getMonth() + '/' + time.getFullYear()
        return res
    }

})