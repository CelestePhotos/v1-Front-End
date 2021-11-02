//---   URL Perams   ---//
var perams = document.cookie
var userToken = perams.split('token=')[1];
if (userToken.includes("&")) {
    userToken = userToken.split('&')[0];
} 

//--- Variables ---//

var domains = [];
var wildcards = [];

var busy;
var $subdomain = '';

const account_types = ['Basic', 'Premium', 'Moderator', 'Administrator', 'Developer'];




//--- Sleep Function ---//
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

//--- Copy Text Function ---//
function copyText(text){
    const $temp = document.createElement('input');
    $temp.type = 'text';
    $temp.value = text;

    document.body.appendChild($temp);

    $temp.select();
    $temp.setSelectionRange(0, 99999);
    document.execCommand('copy');

    document.body.removeChild($temp);
};

setTimeout(() => {
    document.getElementById("takingForever").style.visibility = "visible";
}, 3000);

window.addEventListener('load', async () => {
    //---   Defines   ---//
    const submit = document.getElementById('submit');
    const displayusername = document.getElementById('uname');
    const accounttype = document.getElementById('accounttype');
    const displayphotos = document.getElementById('uploadedphotoscount')
    const pfp = document.getElementById('usericon')
    const embedtitle = document.getElementById('title')
    const embeddescription = document.getElementById('description')
    const embedcolor = document.getElementById('hexcolor')
    const showauthor = document.getElementById('showauthor');
    const showembed = document.getElementById('showembed');
    const invisURL = document.getElementById('invisurl');


    


    // Setup Domain Picker //
    $.ajax({
        url: '/domains.json?' + Date.now(),
        type: 'get',
        success: function(response){
            for(const domain in response){
                domains.push(domain);
                if(typeof response[domain].tags.wildcard !== 'undefined') wildcards.push(domain);
                const element = document.createElement('option');
                element.id = domain;
                element.value = domain;
                element.innerHTML = domain;
                document.getElementById('domainpicker').appendChild(element);
                $.ajax({
                    url: '/api/settings',
                    type: 'post',
                    success: function(response){
                        const settings = response.split('██');
                        const domain = (domains.includes(settings[0]) ? settings[0] : settings[0].split('.').slice(1).join('.'));
                        document.getElementById(domain).selected = true;
                        if(!wildcards.includes(domain)){
                            document.getElementById('subdomain').disabled = true;
                            document.getElementById('subdomain').placeholder = "Subdomain not available";
                        }
                        embedtitle.defaultValue = settings[1];
                        embeddescription.defaultValue = settings[2];
                        // Emit description input to size textarea
                        embeddescription.dispatchEvent(new Event('input', {
                            'bubbles': true,
                            'cancelable': true
                        }));
                    
                        embedcolor.defaultValue = settings[3];
                        if(settings[4] == 'true') showauthor.checked = true;
                        if(settings[5] == 'true'){ 
                            embedtitle.disabled = false;
                            embeddescription.disabled = false;
                            embedcolor.disabled = false;
                            showauthor.disabled = false;
                            submit.disabled = false;
                            showembed.checked = true;
                        };
                        if(settings[6] == 'true') {
                            invisURL.checked = true;
                        };
                        if(settings[7] !== 'undefined') {
                            document.getElementById('fakeurlenabled').checked = true;
                            document.getElementById('fakeurlinput').defaultValue = settings[7];
                        }else{
                            document.getElementById('fakeurlinput').disabled = true;
                        }
                        submit.style.visibility = 'inherit';
                        var subdomain;
                        if(document.getElementById(settings[0])) subdomain = ''
                        else subdomain = settings[0].split('.')[0];
                        document.getElementById('subdomain').defaultValue = subdomain;
                        $subdomain = subdomain;
                    }
                })
            };
        }
    });

    
    document.getElementById('tkn').innerHTML = userToken;

    document.getElementById('tkn').addEventListener('click', function(){
 
        copyText(document.getElementById('tkn').innerHTML);
        alertify.notify('Copied token to clipboard!', 'success');
    });
    

    //---   URL Checker   ---//
    function PngExists(url){
        var http = new XMLHttpRequest();
        http.open('GET', url, false);
        http.send();
        return http.getResponseHeader('Content-Type')=='image/png';
    }

    //---   Pre Setup   ---//
    //Get Username From Token
    var url = '/api/token'; var http = new XMLHttpRequest();http.open('POST', url, true);http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');http.onreadystatechange = function() {if(http.readyState == 4 && http.status == 200) {
        var username = http.responseText;
        displayusername.innerHTML = username;
    }};http.send(perams);

    //Get User Photos From Token
    var url = '/api/photos'; var http2 = new XMLHttpRequest();http2.open('POST', url, true);http2.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');http2.onreadystatechange = function() {if(http2.readyState == 4 && http2.status == 200) {
        const photos = http2.responseText;
        displayphotos.innerHTML = photos;
    }};http2.send(perams);

    //Get Account Type From Token
    var url = '/api/premium'; var http3 = new XMLHttpRequest();http3.open('POST', url, true);http3.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');http3.onreadystatechange = function() {if(http3.readyState == 4 && http3.status == 200) {
        const type = http3.responseText;
        accounttype.innerHTML = type;
        if(account_types.indexOf(type) > 0) {
            invisURL.disabled = false
            document.getElementById('fakeurlenabled').disabled = false;
            document.getElementById('fakeurlinput').disabled = false;
            document.getElementById('submitfakeurl').disabled = false;
        };
    }};http3.send(perams);

    var url = '/api/uuid'; var http5 = new XMLHttpRequest();http5.open('POST', url, true);http5.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');http5.onreadystatechange = function() {if(http5.readyState == 4 && http5.status == 200) {
        const uuid = http5.responseText;
        if (PngExists(`/uploads/${uuid}/profile.png?${Date.now()}`)) {
            pfp.src = `/uploads/${uuid}/profile.png?${Date.now()}`
        } else {
            pfp.src = `/assets/images/usericon.png`
        }
    }};http5.send(perams);


    //---   Load Dashboard   ---//
    setTimeout(() => {
        document.body.removeChild(document.getElementById('loading'));
        document.body.style.visibility = 'visible';
        document.getElementById('dashboard').classList.add('contentactive');
        //--- Hash Handler ---//
        if(location.hash === '#invites') nav_invites();
        if(location.hash === '#account') nav_account();
        if(location.hash === '#logout') nav_logout();
        if(location.hash === '#changeusername'){
            changeUsername();
        };
        if(location.hash === '#changepassword'){
            changePassword();
        };
        if(location.hash === '#purge'){
            purge();
        };
        window.addEventListener('hashchange', () => {
            if(location.hash === '') nav_dash();
            if(location.hash === '#invites') nav_invites();
            if(location.hash === '#account') nav_account();
            if(location.hash === '#logout') nav_logout();
            if(location.hash === '#changeusername'){
                changeUsername();
            };
            if(location.hash === '#changepassword'){
                changePassword();
            };
            if(location.hash === '#purge'){
                purge();
            };
        });
    }, 2000);
});

//---   Navigation Handler   ---//
function navigate() {
    document.getElementById('nav_dash').classList.remove('navigationactive');
    document.getElementById('dashboard').classList.remove('contentactive');

    document.getElementById('nav_account').classList.remove('navigationactive');
    document.getElementById('account').classList.remove('contentactive');

    document.getElementById('nav_invites').classList.remove('navigationactive');
    document.getElementById('invites').classList.remove('contentactive');
    
    /*
    document.getElementById('nav_store').classList.remove('navigationactive');
    document.getElementById('store').classList.remove('contentactive');

    document.getElementById('nav_upload').classList.remove('navigationactive');
    document.getElementById('upload').classList.remove('contentactive');

    document.getElementById('nav_uploaded').classList.remove('navigationactive');
    document.getElementById('uploaded').classList.remove('contentactive');

    document.getElementById('nav_beta').classList.remove('navigationactive');
    document.getElementById('beta').classList.remove('contentactive');
    */
}

function nav_dash(e) {
    navigate();
    document.getElementById('nav_dash').classList.add('navigationactive');
    document.getElementById('dashboard').classList.add('contentactive');
    if(!e) location.hash = "";
};

async function nav_invites(e) {
    navigate();
    document.getElementById('nav_invites').classList.add('navigationactive');
    document.getElementById('invites').classList.add('contentactive');
    if(!e) location.hash = "invites";

    document.getElementById('invites').innerHTML = `<center id="loading" class="loadingbox">
    <div class="loading"><div></div><div></div><div></div></div>
<br>
<p>Loading your invites...</p>
</center>`;

    await $.ajax({
        url: '/api/invites?' + Date.now(),
        type: 'GET'
    }).then(invites => {
        if(invites.type) return alertify.notify(response.message, response.type);
        document.getElementById('invites').innerHTML = `<center>
        <table id="invites-table">
            <tr>
                <th class="tl">Invite Code (Click to copy)</th>
                <th class="tr">Delete</th>
            </tr>
        </table>
        <br>
        <button class="widgetbutton" id="createinvite" onclick="createInvite();">Create Invite</button>
    </center>`;
    document.getElementById('createinvite').innerHTML += ` (${invites.data.amount})`;
        if(invites.data.amount === 0) document.getElementById('createinvite').disabled = true;
        invites.data.invites.forEach(invite => {
            document.getElementById('invites-table').innerHTML += `
            <tr>
                <td>
                    <token onclick="copyText('https://celeste.gift/' + this.innerHTML);alertify.success('Copied invite to clipboard')">${invite.key}</token>
                </td>
                <td>
                    <button class="widgetbutton" onclick="deleteInvite('${invite.key}')">Delete</button>
                </td>
            <tr>
            `
        });
    });
};

function nav_account(e) {
    navigate();
    document.getElementById('nav_account').classList.add('navigationactive');
    document.getElementById('account').classList.add('contentactive');
    if(!e) location.hash = "account";
};

function nav_profile() {
    window.open(`/user/${document.getElementById('uname').innerHTML}`, '_blank');
};

function nav_discord() {
    window.open('/discord', '_blank');
};

function nav_logout(){
    alertify.confirm('Are you sure you would like to logout?', function(confirmed){
            alertify.notify('Logging out...');
            location.href='/logout';
    }).set({
        closable: false,
        closableByDimmer: false,
        maximizable: false,
        movable: false,
        transition: 'fade',
        labels: {
            ok: 'Yes',
            cancel: 'No'
        }
    });
    location.hash = "logout";
};

//---   End Navigation Handler   ---//

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}


//--- Create Invites ---//
function createInvite() {
    $.ajax({
        url: '/api/invites',
        type: 'post',
        success: function(response){
            if(response.type) return alertify.notify(response.message, response.type);
            alertify.notify('Successfully created invite', 'success');
            nav_invites();
        }
    })
};

//---   Make ShareX Files   ---//
function gensharex() { 
    console.log('Generating ShareX Custom Uploader')
    download(`${document.getElementById('uname').innerHTML}_Celeste.sxcu`,`{
        "Version": "13.2.1",
        "Name": "Celeste",
        "DestinationType": "ImageUploader",
        "RequestMethod": "POST",
        "RequestURL": "https://celestephoto.com/upload",
        "Headers": {
        "token": "${userToken}",
        "json": "true"
        },
        "Body": "MultipartFormData",
        "Arguments": {
        "imgfile": null
        },
        "FileFormName": "imgfile",
        "URL": "$json:url$"
    }`)
}













// Show Modal
function purge() {
    location.hash = "purge";
    nav_dash(true);
    alertify.prompt('To delete all your uploads type: "confirm" below', '', function(evt, i){
        location.hash = "";
        if(i !== 'confirm') return alertify.notify('You didn\'t type "confirm" in the box!', 'error');
        alertify.notify('Deleting all uploads...');
        $.ajax({
            url: '/api/purge',
            type: 'post',
            success: function(response){
                if(response.type === 'success') document.getElementById('uploadedphotoscount').innerHTML = '0';
                    alertify.notify(response.message, response.type);
            }
        });
    }, function(){
        location.hash = '';
    }).set({
        closable: false,
        closableByDimmer: false,
        maximizable: false,
        movable: false,
        transition: 'fade',
        labels: {
            ok: 'Purge'
        }
    });
}

// Change Username
function changeUsername(){
    location.hash = 'changeusername'
    alertify.genericDialog($('#changeUsernameForm').clone(true, true).css('display', 'block')[0]).set({
        movable: false,
        transition: 'fade'
    });
    nav_account(true);
};

$('[id="changeUsernameForm"]').submit(function(e){
    e.preventDefault();
    alertify.notify('Changing Username...');
    $.ajax({
        url: '/api/change/username',
        type: 'post',
        data: $(this).last().serialize(),
        success: function(response){
            if(response.type === 'success') {
                 document.getElementById('uname').innerHTML = response.data.username;
                 alertify.genericDialog().close().set('closable', true);
                 location.hash = "account";
            };
            alertify.notify(response.message, response.type);
        }
    })
});

// Change Password
function changePassword(){
    location.hash = 'changepassword';
    alertify.genericDialog($('#changePasswordForm').clone(true, true).css('display', 'block')[0]).set({
        movable: false,
        transition: 'fade'
    });
    nav_account(true);
};

$('[id="changePasswordForm"]').submit(function(e){
    e.preventDefault();
    alertify.notify('Changing Password...');
    $.ajax({
        url: '/api/change/password',
        type: 'post',
        data: $(this).last().serialize(),
        success: function(response){
            if(response.type === 'success') {
                 alertify.genericDialog().close().set('closable', true);
                 location.hash = "account";
            };
            alertify.notify(response.message, response.type);
        }
    });
});

// Reset Token
function resetToken(){
    $.ajax({
        url: '/api/reset/token',
        type: 'post',
        success: function(response){
            perams = document.cookie;
            if(response.type === 'success'){
                document.getElementById('tkn').innerHTML = userToken;
                alertify.alert('Your token has been reset. <br><br><b>Note</b>: Remember to regenerate your ShareX configuration file').set({
                    movable: false,
                    transition: 'fade'
                });
                return;
            };  
            alertify.notify(response.message, response.type);
        }
    });
}

// Text Area
function autoExpand (field) {

	field.style.height = 'inherit';

	var computed = window.getComputedStyle(field);

	var height = parseInt(computed.getPropertyValue('border-top-width'), 10)
	             + parseInt(computed.getPropertyValue('padding-top'), 10)
	             + field.scrollHeight
	             + parseInt(computed.getPropertyValue('padding-bottom'), 10)
	             + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

	field.style.height = height + 'px';

};

document.addEventListener('input', function (event) {
	if (event.target.tagName.toLowerCase() !== 'textarea') return;
	autoExpand(event.target);
}, false);


document.getElementById('file-input').onchange = function() {
    document.getElementById('pfpform').submit();
};


// JQuery Stuff

// Change Fake Domain
$('#fakeurlform').submit(function(e){
    e.preventDefault();
    if(busy) return alertify.notify(busy, 'error');
    busy = 'Already Changing Fake Domain. Please Wait.';
    alertify.notify('Changing Fake Domain...');
    $.ajax({
        url: '/api/fakeurl',
        type: 'POST',
        data: $('#fakeurlform').serialize(),
        success: function(response){
            busy = false;
            alertify.notify(response.message, response.type);
        }
    })
});

// Change Embed
$('#form').submit(function(e){
    e.preventDefault();
    if(busy) return alertify.notify(busy, 'error');
    busy = 'Already updating embed! Please wait';
    alertify.notify('Updating embed...');
    $.ajax({
        url: '/api/embed',
        type: 'post',
        data: $('#form').serialize(),
        success: function(response){
            busy = false;
            alertify.notify(response.message, response.type)
        }
    });
});


// Change Domain
$('#pickdomain').submit(function(e){
    e.preventDefault();
    if(busy) return alertify.notify(busy, 'error');
    busy = 'Already updating domain! Please wait';
    alertify.notify('Updating domain....');
    $.ajax({
        url: '/api/domain',
        type: 'post',
        data: $('#pickdomain').serialize(),
        success: function(response){
            busy = false;
            alertify.notify(response.message, response.type);
        }
    });
});

// Lock subdomain field on non-wildcard
$('#domainpicker').on('change', function() {
    if(!wildcards.includes(this.value)){
        document.getElementById('subdomain').disabled = true;
        $subdomain = document.getElementById('subdomain').value || "";
        document.getElementById('subdomain').value = "";
        document.getElementById('subdomain').placeholder = "Subdomain not available";
        return;
    }
    document.getElementById('subdomain').value = $subdomain;
    document.getElementById('subdomain').placeholder = "Subdomain";
    document.getElementById('subdomain').disabled = false;
});

$('#subdomain').on('input', function(){
    $subdomain = $(this).val();
});

//Toggle Fake URL
function togglefakeurl(){
    if(busy){
        alertify.notify(busy, 'error');
        document.getElementById('fakeurlenabled').checked = !document.getElementById('fakeurlenabled').checked;
        return;
    };
    document.getElementById('fakeurlinput').disabled = !document.getElementById('fakeurlenabled').checked;

};

// Toggle Embed
function toggleembed(){
    if(busy){
        alertify.notify(busy, 'error');
        document.getElementById('showembed').checked = !document.getElementById('showembed').checked;
        return;
    };
    const embedtitle = document.getElementById('title')
    const embeddescription = document.getElementById('description')
    const embedcolor = document.getElementById('hexcolor')
    const showauthor = document.getElementById('showauthor');
    const submit = document.getElementById('submit');
    embedtitle.disabled = !embedtitle.disabled;
    embeddescription.disabled = !embeddescription.disabled;
    embedcolor.disabled = !embedcolor.disabled;
    showauthor.disabled = !showauthor.disabled;
    submit.disabled = !submit.disabled;
    if(busy) return alertify.notify(busy, 'error');
    busy = 'Already toggling embed! Please wait';
    alertify.notify('Toggling embed...');
    $.ajax({
        url: '/api/embed',
        type: 'post',
        data: $('#form').serialize(),
        success: function(response){
            busy = false;
            alertify.notify(response.message, response.type)
        }
    });
};

// Delete Invite
function deleteInvite(inviteCode) {
    alertify.confirm('Are you sure you would like to delete this invite?<br><br><b>Note</b>: Deleting invites will not allow you to regenerate them.<br>Once deleted they are gone forever', function(confirmed){
        $.ajax({
            url: '/api/invites?invite=' + inviteCode,
            type: 'DELETE',
            success: function(response){
                if(response.type) {
                    alertify.notify(response.message, response.type);
                    nav_invites();
                    return;
                }
            }
        });
    }).set({
        closable: false,
        closableByDimmer: false,
        maximizable: false,
        movable: false,
        transition: 'fade',
        labels: {
            ok: 'Delete',
            cancel: 'Cancel'
        }
    });

};
