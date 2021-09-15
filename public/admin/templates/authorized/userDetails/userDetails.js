
app.controller('userDetails', function ($scope, $http, $routeParams, $location) {
    $scope.currentUserId = -1
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
    $scope.currentUser = {
        personalDetails: {},
        ads: [],
        ca: [],
        purchased: []
    }
    $scope.getPersonalDetails = async () => {
        var requestObj = {
            query: `query{
                      User(id:"${$scope.currentUserId}"){
                        id
                        phoneNumber
                        email
                        address
                        imageURL
                        fullName
                        notificationId
                        createdOn
                      }
                    }`
        }
        var personalDetails = await $scope.httpReq(biden, requestObj)
        if (!personalDetails) {
            $location.path('/')
        }
        $scope.$apply(function () {
            $scope.currentUser.personalDetails = personalDetails.User
            console.log($scope.currentUser.personalDetails);
        })
    }
    $scope.initUserDetails = async () => {
        $scope.currentUserId = ($routeParams.id)
        await $scope.getPersonalDetails()
        $('#userDetailsModal').modal()

    }
    $('#userDetailsModal').on('hidden.bs.modal', function () {
        $scope.$apply(function () {
            $location.path('/')
        })
    })
    $scope.parseTime = (x) => {
        var time = new Date(x * 1)
        var res = time.getHours() + ":" + time.getMinutes() + " " + time.getDate() + '/' + time.getMonth() + '/' + time.getFullYear()
        return res
    }
    $scope.canShowCarts = 0
    $scope.getCarts = async () => {
        var productsOwned = await $scope.httpReq(biden, {
            query: `query{
                User(id:"${$scope.currentUserId}"){
                  Carts{
                    id
                    offeredPrice
                    time
                    whereToReceive
                    productId
                    Product{
                      image1
                      category
                    }
                  }
                }
              }`
        })
        $scope.$apply(function () {
            $scope.currentUser.carts = productsOwned.User.Carts
            console.log(productsOwned);
            $scope.canShowCarts = 1
        })
    }
    $scope.canShowProductsOwned = 0
    $scope.getProductsOwned = async () => {
        var productsOwned = await $scope.httpReq(biden, {
            query: `query{
                User(id:"${$scope.currentUserId}"){
                  Owned{
                    id
                    category
                    image1
                    askedPrice
                    customerCount
                    postedOn
                  }
                }
              }`
        })
        $scope.$apply(function () {
            $scope.currentUser.ads = productsOwned.User.Owned
            $scope.canShowProductsOwned = 1
        })
    }
    $scope.viewProductDetails = (x) => {
        $location.path(`/showProduct/${x}`)
    }
})
