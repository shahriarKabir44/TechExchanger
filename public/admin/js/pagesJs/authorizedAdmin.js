app.controller('authorized', ($scope, $http) => {

})

app.directive('adminNav', function () {
    return {
        scope: {
        },
        controller: "authorized",

        templateUrl: './admin/templates/authorized/navbar.html',
        link: function (scope) {
            console.log(scope)
        }
    }
})