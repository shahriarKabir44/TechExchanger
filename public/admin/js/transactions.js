var x = document.getElementsByClassName('pd')

for (let n = 0; n < x.length; n++) {
    x[n].onclick = () => {
        $('#myModal1').modal({ show: true })
    }
}
function cancel(x) {
    if (window.confirm('are you sure?')) document.getElementById('rw-' + x).style.display = 'none'
}
function aprv(x) {
    if (window.confirm('are you sure?')) {
        document.getElementById('rw-' + x).style.display = 'none'
        document.getElementById('tbd').innerHTML += `
        <tr id="dn-5">
			<th scope="row">6</th>
			<td class="pd"><a>Modern Bed</a></td>
			<td class="us">
				<ul>Kader</ul>
			</td>
			<td class="us">
				<ul>Kabir</ul>
			</td>
			<td>10-12-2020 12:30</td>
			<td>9,000৳</td>
			<td>kjbv7yklPC</td>
			<td>
				<a class="acpbtn" onclick="conf(5)">Confirm</a>
			</td>
		</tr>`
    }
}

var us = document.getElementsByClassName('us')
for (let n = 0; n < us.length; n++) {
    us[n].onclick = () => {
        $('#seeUsers').modal({ show: true })
    }
}

function conf(x) {
    if (window.confirm('Are you sure?')) {
        document.getElementById('dn-' + x).style.display = 'none';
        document.getElementById('txt').innerHTML += `
        <tr>
        <th scope="row">6</th>
        <td class="pd"><a>Modern Bed</a></td>
        <td class="us">
            <ul>Kader</ul>
        </td>
        <td class="us">
            <ul>Kabir</ul>
        </td>
        <td>10-12-2020 12:30</td>
        <td>9,000৳</td>
        <td>kjbv7yklPC</td>
        <td>
            Monir </td>
    </tr>
        `
    }
}