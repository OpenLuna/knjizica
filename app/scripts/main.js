var gun = null;
var offline = false;
var offlineMode = false;
var thisPeak = null;
var userObj = null;
// cosmetics
function makeStampsPretty() {
  $('.stamp').height($('.stamp').width());
  $('.stamp').on('click', function() {
    showPeak(this);
    //history.pushState({"stamp":"stamp"}, "stamp", "index.html");
  });
}

function showPeak(peak){
  thisPeak = peak;
  $('#stamps').addClass('hidden');
  $('#addstamp').removeClass('hidden');
  $('#stampme').removeClass();
  $('#stampme').addClass(peak.id);
  if ($(peak).hasClass("stamped")){
    $('#stampme').addClass("stamped");
  }
  $(".vrhname").text($(peak).data().peak);
  $(".vrhheight").text($(peak).data().height);

  $(".prev-peak").off().on("click", function(e){
    console.log("nazaj");
    try{
      showPeak($(peak).prev()[0]);
    }
    catch(exception){
      showPeak($(".stamp").slice(-1)[0]);
    }
  });
  $(".next-peak").off().on("click", function(e){
    console.log("naprej");
    try{
      showPeak($(peak).next()[0]);
    }
    catch(exception){
      showPeak($(".stamp")[0]);
    }
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
      createUser();
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
        swal("Geslo ne ustreza uporabniku")
      }
    });
  });
}

function saveEmail(email){
  $.ajax({
    url: "https://knedl.si/api/save_email/"+email,
    success: function(result){
      localStorage.removeItem("mail");
      return result.saved
    },
    error: function(result){
      localStorage.setItem('mail', $('#emailinput').val())
    }
  });
}

function createUser() {
  //TODO:send email to server
  saveEmail($('#emailinput').val());
  
  if (offlineMode===true)
  {
    offline = true;
    localStorage.setItem('update', "person/"+CryptoJS.SHA256($('#emailinput').val()).toString(CryptoJS.enc.Base64));
    localStorage.setItem('lpeaks', JSON.stringify({}));
    localStorage.setItem('lperson', JSON.stringify({
      email: CryptoJS.SHA256($('#emailinput').val()).toString(CryptoJS.enc.Base64),
      password: CryptoJS.SHA256($('#passwordinput').val()).toString(CryptoJS.enc.Base64),
    }));

  }
  else{

    var peaks = gun.get("peaks").put({

    });

    var user = gun.get("person/"+CryptoJS.SHA256($('#emailinput').val()).toString(CryptoJS.enc.Base64)).put({
      email: CryptoJS.SHA256($('#emailinput').val()).toString(CryptoJS.enc.Base64),
      password: CryptoJS.SHA256($('#passwordinput').val()).toString(CryptoJS.enc.Base64),
    });
    user.set(peaks);

    var people = gun.get('people');
    people.set(user)
  }

  localStorage.setItem('user', "person/"+CryptoJS.SHA256($('#emailinput').val()).toString(CryptoJS.enc.Base64))

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
        swal("Uporabnik s tem emailom že obstaja");
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
  $("#"+nameOfPeak).addClass("stamped");

  showPeak($("#"+nameOfPeak)[0]);
  setTimeout(function(){
    
    $('#addstamp').addClass('hidden');
    $('#stamps').removeClass('hidden');
    makeStampsPretty();
  }, 3000);

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
    makeStampsPretty();
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
    makeStampsPretty();
    return false
  }
  
}

$(document).ready(function() {
  ping("https://knedl.si/api/ping/",
    function(){
      console.log("online");
      gun = Gun(["https://knedl.si/gun/gun"]);

      var local = localStorage.getItem("update");
      var mail = localStorage.getItem('mail');

      if (mail!==null){
        var resp = saveEmail(mail)
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
    userObj = initStampScreen();

    $("#stampme").lunastamps.init(function(peakname) {
      addPeak(userObj, peakname);
    });
    var user = localStorage.getItem('user');
    console.log(user)
    //splash();
    initStampScreen();
  }
  $(".btn-nazaj").on("click", function(){
    onBackKeyDown();
  });

  $('.stampme').on('swiperight', function(e) {
    console.log("right");
    try{
      showPeak($(thisPeak).prev()[0]);
    }
    catch(exception){
      showPeak($(".stamp").slice(-1)[0]);
    }
  }).on('swipeleft', function(e) {
    console.log("left");
    try{
      showPeak($(thisPeak).next()[0]);
    }
    catch(exception){
      showPeak($(".stamp")[0]);
    }
  })
  /*$("#dodaj").on("click", function(){
    var koda = $(".vpisikodo-input").val();
    var peak = $("#stampme")[0].classList;
    if(peak.length>1)
    {
      swal("Štempl za "+names[peak[0]]+" že imaš.")
    }
    else
    {
      if (stampsIDs[peak[0]] === parseInt(koda))
      {
        addPeak(userObj, peak[0])
      }
      else
      {
        swal("To ni koda za "+names[peak[0]]+".")
      }
    }
    $(".vpisikodo-input").val("");
  });*/
});

function onBackKeyDown() {
  console.log("BACK");
  if(!$('#addstamp').hasClass('hidden'))
  {
    console.log("fkorze");
    $('#stampme').removeClass();
    $('#addstamp').addClass('hidden');
    $('#stamps').removeClass('hidden');
  }
}
function back(e){
  if(!$('#addstamp').hasClass('hidden')){
    e.preventDefault();
    onBackKeyDown();
  }
  else{
    console.log("Doma si dj zapri");
    navigator.app.exitApp();
  }
  console.log("back btn event");
  
}
function onDeviceReady() {
  console.log("device ready");
  document.addEventListener("backbutton", back, false);
  splash();
  
}
function onLoad() {
    console.log("onLoad");
    document.addEventListener("deviceready", onDeviceReady, false);

}
function splash(){
  var user = localStorage.getItem('user');
  if (user !== null){
    $('#splash').addClass('hidden');
    $('#login').addClass('hidden');
    $('#register').addClass('hidden');
    $('#stamps').removeClass('hidden');
    makeStampsPretty();
  }
  else{
    $('#splash').addClass('hidden');
    $('#login').removeClass('hidden');
  }
}