app.controller('productDetails', function ($scope, $http, $routeParams, $location) {
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
    $scope.currentProductId = 0
    $scope.canShowModal = 0
    $scope.initProductDetails = async () => {
        $scope.currentProductId = $routeParams.productId
        await $scope.getBasicInfo()
        await $scope.getOwnerInfo()
        $scope.$apply(function () {
            $scope.canShowModal = 1
        })
        $('#productDetailsModal').modal('show')
    }
    $scope.closeModal = () => {
        $('#productDetailsModal').modal('hide')
        $location.path('/')
        $scope.canShowModal = 0
    }

    $scope.currentProduct = {
        basicInfo: {},
        customerList: {},
        ownerInfo: {}
    }
    $scope.getCustomerList = () => { }
    $scope.getOwnerInfo = async () => {
        var ownerInfo = await $scope.httpReq(biden, {
            query: `query{
                        User(id:"${$scope.currentProduct.basicInfo.owner}"){
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
        })

        $scope.$apply(function () {
            $scope.currentProduct.ownerInfo = ownerInfo.User
        })
    }
    $scope.getBasicInfo = async () => {
        var basicInfo = await $scope.httpReq(biden, {
            query: `query{
                GetProductById(id:"${$scope.currentProductId}"){
                  image1
                  image2
                  image3
                  image4
                  category
                  postedOn
                  askedPrice
                  owner
                  details
                  customerCount
                  postedFrom
                }
            }`
        })
        if (basicInfo == null) {
            $scope.$apply(function () {
                $location.path('/')
            })
        }
        $scope.$apply(function () {
            $scope.currentProduct.basicInfo = basicInfo.GetProductById
            $scope.currentProduct.images = [basicInfo.GetProductById.image1, basicInfo.GetProductById.image2, basicInfo.GetProductById.image3, basicInfo.GetProductById.image4]
        })

    }
    $scope.viewImage = (x) => {
        $scope.selectedImageForView = x
        $('#fillScreenImage').modal('show')
    }
    $scope.parseTime = (x) => {
        var time = new Date(x * 1)
        var res = time.getHours() + ":" + time.getMinutes() + " " + time.getDate() + '/' + time.getMonth() + '/' + time.getFullYear()
        return res
    }
    $scope.viewUser = (x) => {
        $location.path('/showUser/' + x)
    }
    $scope.canShowCustomers = 0
    $scope.viewCustomers = async () => {
        var Offerers = await $scope.httpReq(biden, {
            query: `query{
                GetProductById(id:"${$scope.currentProductId}"){
                  Offerers{
                    customerId
                    offeredPrice
                    whereToReceive
                    time
                    Buyer{
                      fullName
                      imageURL
                    }
                  }
                }
              }`
        })
        $scope.$apply(function () {
            $scope.currentProduct.customerList = Offerers.GetProductById.Offerers
            $scope.canShowCustomers = 1
        })
    }
})