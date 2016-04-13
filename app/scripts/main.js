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
    var user = gun.get('people').get($("#emailinput").val());
    user.not(function(usr){
      alert("Email ne ustreza nobenemu uporabniku")
    });
    user.val(function(usr) {
      isUser = true;
      if (usr.password == CryptoJS.SHA256($('#passwordinput').val()).toString(CryptoJS.enc.Base64)) {
        localStorage.setItem('user', $('#emailinput').val())

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
  var user = gun.get($('#registeremailinput').val()).put({
    name: $('#registernameinput').val(),
    email: $('#registeremailinput').val(),
    peaks: JSON.stringify([""]),
    password: CryptoJS.SHA256($('#registerpasswordinput').val()).toString(CryptoJS.enc.Base64)
  })

  var people = gun.get('people');
  people.set(user)

  localStorage.setItem('user', $('#registeremailinput').val())

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
    var user = gun.get('people').get($("#registeremailinput").val());
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
  var list = null;
  console.log(nameOfPeak);
  userObj.val(function(peak){
    console.log(peak);
    list=peak.peaks;
    if (list == '[""]'){
      console.log("bil je prazn");
      userObj.put({
        peaks: JSON.stringify([nameOfPeak])
      })
    }
  else {
      list = JSON.parse(list);
      console.log(peak.peaks);
      console.log(list);
      
      list.push(nameOfPeak);
      console.log(JSON.stringify(list));
      userObj.put({
        peaks: JSON.stringify($.unique(list))
      })
  }
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
    var peakz = JSON.parse(peaks);
    for (var i=0; i<peakz.length; i++)
    {
      $("#"+peakz[i]).addClass("stamped");
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
