// init Gun
var gun = Gun();

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
    if (!isUser)
      alert("Email ne ustreza nobenemu uporabniku")

  });
}

function createUser() {
  console.log("create user 1")
  if (!isUser) {
    console.log("create user 1")
    var isUser = true;
    console.log("there is not that user");
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
  }
};

function initReg() {

  $('#registerform').on('submit', function(event) {
    event.preventDefault();

    var isUser = false;
    var user = gun.get('people').get($("#registeremailinput").val());
    user.val(function(usr) {
      if (usr.name !== "undefined" && !isUser) {
        isUser = true;

        alert("Uporabnik s tem emailom že obstaja")

      } else {
        createUser();
      }
    }, createUser());

  });
}

function addPeak(userObj, nameOfPeak) {
  if (userObj.peaks == '[""]')
    userObj.put({
      peaks: JSON.stringify([nameOfPeak])
    })
  else {
    userObj.val(function(peaks) {
      console.log(peaks.peaks)
      list = JSON.parse(peaks.peaks)
      list.push(nameOfPeak)
      console.log(JSON.stringify(list))
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
}

function initStampScreen() {
  var user = sessionStorage.getItem('user');
  var userObj = gun.get("people").get(user);
  //var stamps = Gun().get('stamps')
  $(".stampme").lunastamps.init(function(peakname) {
    addPeak(userObj, peakname);
  });

}

$(document).ready(function() {
  initLogin();
  initReg();
  initStampScreen();
});
