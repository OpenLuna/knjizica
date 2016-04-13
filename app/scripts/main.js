var gun=null;

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
      cache:false,
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
    var user = gun.get('people').get(CryptoJS.SHA256($("#emailinput").val()).toString(CryptoJS.enc.Base64));
    user.not(function(usr){
      alert("Email ne ustreza nobenemu uporabniku")
    });
    user.val(function(usr) {
      isUser = true;
      if (usr.password == CryptoJS.SHA256($('#passwordinput').val()).toString(CryptoJS.enc.Base64)) {
        localStorage.setItem('user', CryptoJS.SHA256($('#emailinput').val()).toString(CryptoJS.enc.Base64))

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

function createUser() {
  //TODO:send email to server
  /*$.ajax({
    url: "http://",
    cache:false,
    success: function(result){
      //Do nothing
    },
    error: function(result){
      localStorage.setItem('mail', $('#registeremailinput').val())
    }
  });*/
  /*var peaks = gun.get("peaks").put({
    triglav: false,
    smarna: false,
    neki: false,
    morje: false,
    krma: false,
    kum: false,
    mangart: false,
    spik: false,
    roznik: false,
    stol: false,
  });*/

  var user = gun.get(CryptoJS.SHA256($('#registeremailinput').val()).toString(CryptoJS.enc.Base64)).put({
    name: $('#registernameinput').val(),
    email: CryptoJS.SHA256($('#registeremailinput').val()).toString(CryptoJS.enc.Base64),
    password: CryptoJS.SHA256($('#registerpasswordinput').val()).toString(CryptoJS.enc.Base64),
    peaks: {
      triglav: false,
      smarna: false,
      neki: false,
      morje: false,
      krma: false,
      kum: false,
      mangart: false,
      spik: false,
      roznik: false,
      stol: false,
    },
  });
  //user.set(peaks);

  var people = gun.get('people');
  people.set(user)

  localStorage.setItem('user', CryptoJS.SHA256($('#registeremailinput').val()).toString(CryptoJS.enc.Base64))

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
    var user = gun.get('people').get(CryptoJS.SHA256($('#registeremailinput').val()).toString(CryptoJS.enc.Base64));
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
  console.log(nameOfPeak);
  userObj.val(function(user){
    myPeaks=user.peaks;
    
    myPeaks[nameOfPeak] = true;
    console.log(myPeaks);
    userObj.put({
      peaks: myPeaks
    });

  console.log('Dodal ' + nameOfPeak + '!');
  $('#addstamp').addClass('hidden');
  $('#stamps').removeClass('hidden');
  initStampScreen();
  });
}


function initStampScreen() {
  var user = localStorage.getItem('user');
  var userObj = gun.get("people").get(user);
  
  userObj.path("name").val(function(name){
    $("#my_name").text(name)
  });
  userObj.path("peaks").val(function(peaks){
    console.log(peaks);
    //var peakz = JSON.parse(peaks);
    //for (var i=0; i<peakz.length; i++)
    //{
    //  $("#"+peakz[i]).addClass("stamped");
    //}
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

$(document).ready(function() {
  ping("http://pelji.se:81",
    function(){
      gun = Gun(["http://pelji.se:81/"]);
      init();
    },
    function(){
      gun = Gun();
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
  }
});
