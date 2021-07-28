// function getel(x) {
//     return document.getElementById(x)
// }
// var acptbtn = document.getElementsByClassName('ownerLogd')
// for (let n = 0; n < acptbtn.length; n++) {
//     acptbtn[n].style.display = 'none'
// }
// var active = getel('loggedin')
// var nouser = getel('nouser')
// active.style.display = 'none'
// getel('submit_reg').onclick = () => {
//     nouser.style.display = 'none'
//     active.style.display = 'block'
//     $('signup-modal').modal('hide')
//     for (let n = 0; n < acptbtn.length; n++) {
//         acptbtn[n].style.display = 'block'
//     }
// }

// getel('login-normal').onclick = () => {
//     $('login-normal').modal('hide');

//     nouser.style.display = 'none'
//     active.style.display = 'block'
//     $('signup-modal').modal('hide')
//     for (let n = 0; n < acptbtn.length; n++) {
//         acptbtn[n].style.display = 'block'
//     }
// }
// var productroot = document.getElementsByClassName('product')
// for (let n = 0; n < productroot.length; n++) {
//     productroot[n].onclick = () => {
//         window.location.href = './productpage.html'
//     }
// }

// getel('searchBtn').onclick = () => {
//     var vl = getel('prods').value
//     var pc = getel('searchbar').value
//     var a = document.getElementsByClassName('prixe')
//     for (let n = 0; n < a.length; n++) {
//         let m = parseInt(pc) + (n * 9);
//         a[n].innerHTML = `Price: ৳ ${m}`
//     }
//     var b = document.getElementsByClassName('ctgr')
//     for (let n = 0; n < a.length; n++) {
//         b[n].innerHTML = `Category: ${vl}`
//     }
//     var b = document.getElementsByClassName('negro')
//     for (let n = 0; n < a.length; n++) {
//         b[n].src = `./assets/products/${vl}${n + 1}.jpg`
//     }
//     $('#searchResultModal').modal({ show: true })
// }

// $(".scimg").click(function () {
//     $(this).toggleClass("click");
//     $('.fieldset').toggleClass("show");
// });

// getel('postAdd').onclick = () => {
//     var posted = getel('products-posted')
//     posted.innerHTML = `
//     <div class="d-flex justify-content-between">
//         <img src="./assets/products/a.jpg" style="height: 50px;width:50px" alt="">
//         Table ->500 taka.
//         <a href="./adsPage.html" class="btn btn-primary">view</a>
//     </div>
//     `
//         + posted.innerHTML;
//     $('#postAd-modal').modal('hide')
//     $('#product-modal-ads').modal({ show: true })

// }



var app = angular.module('homepage', [])
app.controller('myController', ($scope, $http) => {
    $scope.httpPost = (url, data, onSuccess, onError) => {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${localStorage.getItem('token')}`
            },
            data: data
        }
        $http(req).then(function ({ data }) {
            onSuccess(data)
        }, function (error) {
            onError(error)
        });
    }
    $scope.httpGet = (url, onSuccess, onError) => {
        var req = {
            method: 'GET',
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${localStorage.getItem('token')}`
            },
        }
        $http(req).then(function ({ data }) {
            onSuccess(data)
        }, function (error) {
            onError(error)
        });
    }
    $scope.isAuthorized = 0
    $scope.currentUser = {}
    $scope.InitializeApp = () => {
        $scope.httpPost('/isAuthorized', {}, ({ data }) => {
            if (data) {
                $scope.isAuthorized = 1

                $scope.currentUser = data.user
            }
            else {
                $scope.isAuthorized = 0
                $scope.currentUser = null
            }
        }, () => { })
    }
    //authorized parts
    $scope.mycarts = []
    $scope.getmycarts = () => {

    }
    $scope.myads = []
    $scope.getMyAds = () => {
        getMyAds($scope.currentUser.id, (data) => {

        }, () => { })
    }
    $scope.notifications = []
    $scope.getNotifications = () => {
        getMyNotifications($scope.currentUser.id, (data) => {

        }, () => { })
    }
    //authorized part end
    $scope.signupModel = {
        password: "",
        phoneNumber: "",
        email: "",
        address: "",
        imageURL: "",
        firstName: "",
        lastName: "",
    }
    $scope.submitSignUp = () => {
        $scope.httpPost('/signup', $scope.signupModel, ({ data }) => {
            if (!data) alert('invalid Phone number')
            else {
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                alert(3)
                // upload('profilePictures','proPic',['#proPic'],0,data.user.id,[],(urls)=>{

                // })
            }
        }, () => { })
    }
})