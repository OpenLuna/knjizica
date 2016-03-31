// init Gun
var gun = Gun("http://luna.webfactional.com/gun/gun:22280");
// cosmetics
function makeStampsPretty() {
  $('.stamp').height($('.stamp').width());
  $('.stamp').on('click', function() {
    $('#stamps').addClass('hidden');
    $('#addstamp').removeClass('hidden');
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
        sessionStorage.setItem('user', $('#emailinput').val())

        $('#login').addClass('hidden');
        $('#register').addClass('hidden');
        $('#stamps').removeClass('hidden');
        makeStampsPretty();

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

  sessionStorage.setItem('user', $('#registeremailinput').val())

  $('#login').addClass('hidden');
  $('#register').addClass('hidden');
  $('#stamps').removeClass('hidden');
  makeStampsPretty();
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
  if (userObj.peaks == '[""]')
    userObj.put({
      peaks: JSON.stringify([nameOfPeak])
    })
  else {
    userObj.val(function(peaks) {
      console.log(peaks.peaks);
      var list = JSON.parse(peaks.peaks);
      list.push(nameOfPeak);
      console.log(JSON.stringify(list));
        //peaks.peaks = JSON.stringify(list)
      userObj.put({
        peaks: JSON.stringify([...new Set(list)])
      })
    })

  }
  alert('Dodal ' + nameOfPeak + '!');
    //peaksObj.put({name:nameOfPeak})
  $('#addstamp').addClass('hidden');
  $('#stamps').removeClass('hidden');
  initStampScreen();
}

function initStampScreen() {
  var user = sessionStorage.getItem('user');
  var userObj = gun.get("people").get(user);
  //var stamps = Gun().get('stamps')
  
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
  
  $(".stampme").lunastamps.init(function(peakname) {
    addPeak(userObj, peakname);
  });

}

$(document).ready(function() {
  initLogin();
  initReg();
  initStampScreen();
  var user = sessionStorage.getItem('user');
  console.log(user)
  if (user !== null){
    $('#login').addClass('hidden');
    $('#register').addClass('hidden');
    $('#stamps').removeClass('hidden');
    makeStampsPretty();
  }
});
