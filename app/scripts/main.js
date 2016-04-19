var gun = null;
var offline = false;
var offlineMode = false;


// cosmetics
function makeStampsPretty() {
  $('.stamp').height($('.stamp').width());
  $('.stamp').on('click', function() {
    $('#stamps').addClass('hidden');
    $('#addstamp').removeClass('hidden');
  });
}

//check if gun server is available
function ping(url, sCallback, eCallback){
   $.ajax({
      url: url,
      //cache:false,
      success: function(result){
        sCallback();
      },
      error: function(result){
        eCallback();
      }
   });
}

function initLogin() {
  $('#loginform').on('submit', function(event) {
    event.preventDefault();
    var isUser = false;
    var user = gun.get('people').get("person/"+CryptoJS.SHA256($("#emailinput").val()).toString(CryptoJS.enc.Base64));
    user.not(function(usr){
      alert("Email ne ustreza nobenemu uporabniku")
    });
    user.val(function(usr) {
      isUser = true;
      if (usr.password == CryptoJS.SHA256($('#passwordinput').val()).toString(CryptoJS.enc.Base64)) {
        localStorage.setItem('user', "person/"+CryptoJS.SHA256($('#emailinput').val()).toString(CryptoJS.enc.Base64))

        $('#login').addClass('hidden');
        $('#register').addClass('hidden');
        $('#stamps').removeClass('hidden');
        makeStampsPretty();
        location.reload();

      } else {
        alert("Geslo ne ustreza uporabniku")
      }
    });
  });
}

function saveEmail(email){
  $.ajax({
    url: "http://luna.webfactional.com/api/save_email/"+$('#registeremailinput').val(),
    cache:false,
    success: function(result){
      return result.saved
    },
    error: function(result){
      localStorage.setItem('mail', $('#registeremailinput').val())
    }
  });
}

function createUser() {
  //TODO:send email to server
  saveEmail($('#registeremailinput').val());
  
  if (offlineMode===true)
  {
    offline = true;
    localStorage.setItem('update', "person/"+CryptoJS.SHA256($('#registeremailinput').val()).toString(CryptoJS.enc.Base64));
    localStorage.setItem('lpeaks', JSON.stringify({}));
    localStorage.setItem('lperson', JSON.stringify({
      name: $('#registernameinput').val(),
      email: CryptoJS.SHA256($('#registeremailinput').val()).toString(CryptoJS.enc.Base64),
      password: CryptoJS.SHA256($('#registerpasswordinput').val()).toString(CryptoJS.enc.Base64),
    }));

  }
  else{

    var peaks = gun.get("peaks").put({

    });

    var user = gun.get("person/"+CryptoJS.SHA256($('#registeremailinput').val()).toString(CryptoJS.enc.Base64)).put({
      name: $('#registernameinput').val(),
      email: CryptoJS.SHA256($('#registeremailinput').val()).toString(CryptoJS.enc.Base64),
      password: CryptoJS.SHA256($('#registerpasswordinput').val()).toString(CryptoJS.enc.Base64),
    });
    user.set(peaks);

    var people = gun.get('people');
    people.set(user)
  }

  localStorage.setItem('user', "person/"+CryptoJS.SHA256($('#registeremailinput').val()).toString(CryptoJS.enc.Base64))

  $('#login').addClass('hidden');
  $('#register').addClass('hidden');
  $('#stamps').removeClass('hidden');
  makeStampsPretty();
  location.reload();

};

function initReg() {

  $('#registerform').on('submit', function(event) {
    event.preventDefault();

    var isUser = false;
    var user = gun.get('people').get("person/"+CryptoJS.SHA256($('#registeremailinput').val()).toString(CryptoJS.enc.Base64));
    user.val(function(usr) {
      if (usr.name !== "undefined" && !isUser) {
        isUser = true;
        alert("Uporabnik s tem emailom že obstaja");
      }
    });
    user.not(function(usr){
      isUser=true;
      createUser();
    });
  });
}


function addPeak(userObj, nameOfPeak) {
  var myPeaks = null;

  if(userObj!==false){
    userObj.path("peaks").path(nameOfPeak).put(true)
  }
  else{
    //offline mode
    var peaks = JSON.parse(localStorage.getItem("lpeaks"))
    peaks[nameOfPeak]=true
    localStorage.setItem("lpeaks", JSON.stringify(peaks))
  }

  console.log('Dodal ' + nameOfPeak + '!');
  $('#addstamp').addClass('hidden');
  $('#stamps').removeClass('hidden');
  initStampScreen();
}


function initStampScreen() {
  var user = localStorage.getItem('user');
  if(offline===false){
    var userObj = gun.get("people").get(user);
  
    userObj.path("name").val(function(name){
      $("#my_name").text(name)
    });
    userObj.path("peaks").val(function(peaks){
      console.log(peaks);
      for (var key in peaks){
        console.log("kluc:"+key)
        if (peaks[key]===true)
        {
          $("#"+key).addClass("stamped");
        }
      }

    
    });
    return userObj;
  }
  else{
    var peaks = JSON.parse(localStorage.getItem("lpeaks"))
    for (var key in peaks){
      console.log("kluc:"+key)
      if (peaks[key]===true)
      {
        $("#"+key).addClass("stamped");
      }
    }
    return false
  }
  
}

$(document).ready(function() {
  ping("http://luna.webfactional.com/api/ping/",
    function(){
      console.log("online");
      gun = Gun(["http://luna.webfactional.com/gun/"]);
      //gun = Gun("http://10.103.6.48:8080/");

      var local = localStorage.getItem("update");
      var mail = localStorage.getItem('mail');

      if (mail!==null){
        var resp = saveEmail(mail)
        if (resp===true){
          localStorage.removeItem("mail");
        }
      }

      if (local!==null){
        var lpeaks = JSON.parse(localStorage.getItem("lpeaks"));
        var luser = JSON.parse(localStorage.getItem("lperson"));
        if (local.localeCompare("person/"+luser.email)===0){
          console.log("Update user is in progres");
          gun.get("people").get("person/"+luser.email).put(luser)
          gun.get("people").get("person/"+luser.email).path("peaks").put(lpeaks)
          localStorage.removeItem("lpeaks");
          localStorage.removeItem("lperson");
          localStorage.removeItem("update");
        }
      }

      //gun = Gun();
      init();
    },
    function(){
      console.log("offline")
      //offline mode
      var local = localStorage.getItem("update");
      if (local!==null){
        offline=true;
      }
      gun = Gun();
      offlineMode=true;
      init();
    });
  function init(){
    initLogin();
    initReg();
    var userObj = initStampScreen();

    $(".stampme").lunastamps.init(function(peakname) {
      addPeak(userObj, peakname);
    });
    var user = localStorage.getItem('user');
    console.log(user)
    if (user !== null){
      $('#login').addClass('hidden');
      $('#register').addClass('hidden');
      $('#stamps').removeClass('hidden');
      makeStampsPretty();
    }
    initStampScreen();
  }
});
