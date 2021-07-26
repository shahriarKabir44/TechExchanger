
function getel(x) {
    return document.getElementById(x)
}
var acptbtn = document.getElementsByClassName('ownerLogd')
for (let n = 0; n < acptbtn.length; n++) {
    acptbtn[n].style.display = 'none'
}

var active = getel('loggedin')
active.style.display = 'none'


var userStatus = 0
userLoggedIn();


function userLoggedIn() {
    userStatus = 1;
    active.style.display = 'block'
    $('signup-modal').modal('hide')
    for (let n = 0; n < acptbtn.length; n++) {
        acptbtn[n].style.display = 'block'
    }
}

var productroot = document.getElementsByClassName('product')
for (let n = 0; n < productroot.length; n++) {
    productroot[n].onclick = () => {
        window.location.href = './productpage.html'
    }
}

getel('searchBtn').onclick = () => {
    var vl = getel('prods').value
    var pc = getel('searchbar').value
    var a = document.getElementsByClassName('prixe')
    for (let n = 0; n < a.length; n++) {
        let m = parseInt(pc) + (n * 9);
        a[n].innerHTML = `Price: ৳ ${m}`
    }
    var b = document.getElementsByClassName('ctgr')
    for (let n = 0; n < a.length; n++) {
        b[n].innerHTML = `Category: ${vl}`
    }
    var b = document.getElementsByClassName('negro')
    for (let n = 0; n < a.length; n++) {
        b[n].src = `./assets/products/${vl}${n + 1}.jpg`
    }
    $('#searchResultModal').modal({ show: true })
}
getel('postAdd').onclick = () => {
    var posted = getel('products-posted')
    posted.innerHTML = `
    <div class="d-flex justify-content-between">
        <img src="./assets/products/a.jpg" style="height: 50px;width:50px" alt="">
        Table -> 500 taka.
        <a href="./adsPage.html" class="btn btn-primary">view</a>
    </div>
    `
        + posted.innerHTML;
    $('#postAd-modal').modal('hide')
    $('#product-modal-ads').modal({ show: true })

}
