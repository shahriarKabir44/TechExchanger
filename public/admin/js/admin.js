var app = angular.module('adminApp', [])

app.directive('unAuthorized', function () {
    return {
        scope: {

        },
        controller: "unAuthorized",

        templateUrl: './admin/templates/login.html',
        link: function (scope) {
        }
    }
})