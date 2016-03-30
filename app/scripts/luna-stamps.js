/*
Lunastamps jQuery (https://github.com/openluna/lunastamp)
jquery.lunastamp.js
Version 0.0.1
See GitHub project page for Documentation and License
*/

(function($) {
  $.fn.lunastamps = {
    init: function(callback) {
      var stampDiv = $(".stampme");
      if (!("stamps_" in window))
        stampsData = getDefaultStamps()
      var stamps = stampsData;
      var text = ""


      /*$.ajax({
        url: "stamps.json",
        dataType: "json",
        success: function(response) {
      	stamps=response;
        }
      });*/



      stampDiv.on('touchstart', function(event) {
        text = ""
        console.log("touch" + event.originalEvent.touches.length)
        text = "touch" + event.originalEvent.touches.length + "<br>"
        if (event.originalEvent.touches.length === 5) {
          console.log("5")
          var log = Object()
          var touches = event.originalEvent.touches;
          max_distance = 0
          points = []
          pivots = []
          for (i = 0; i < 4; i++) {
            for (j = i + 1; j < 5; j++) {
              dis = vectorDistance(touches[i], touches[j])
              if (dis > max_distance) {
                max_distance = dis;
                if (touches[i].pageY > touches[j].pageY) {
                  points = [touches[i], touches[j]]
                  pivots = [i, j]
                } else {
                  points = [touches[j], touches[i]]
                  pivots = [j, i]
                }
              }
            }
          }
          log.max_distance = max_distance
          log.points = Array()
          revertPivots = 0
            //check if under diagonal two points
          for (i = 0; i < 5; i++) {
            if (pivots.indexOf(i) == -1) {
              if (nonAbsDistanceFromLine(touches[pivots[0]], touches[pivots[1]], touches[i]) < 0) {
                revertPivots++;
              }
            }
          }
          if (revertPivots > 1) {
            points.reverse()
            pivots.reverse()
          }
          for (i = 0; i < 5; i++) {
            if (pivots.indexOf(i) == -1) {
              data = Object()
              data.distance = distanceFromLine(touches[pivots[0]], touches[pivots[1]], touches[i])
              data.height = pointInLineNearestToPoint(touches[pivots[0]], touches[pivots[1]], touches[i])
              log.points.push(data)
                //console.log("Tocka " + (i+1) + " je oddaljena od diagonale: " + distanceFromLine(touches[pivots[0]], touches[pivots[1]], touches[i]) + " in je visoko: " + pointInLineNearestToPoint(touches[pivots[0]], touches[pivots[1]], touches[i]))
            }
          }
          log.points = sortByKey(log.points, "height")
          getStampName(log)

        }
      });

      function vectorDistance(a, b) {
        return Math.sqrt((a.pageY - b.pageY) * (a.pageY - b.pageY) + (a.pageX - b.pageX) * (a.pageX - b.pageX))
      }

      function distanceFromLine(a, b, c) {
        return Math.abs(((b.pageY - a.pageY) * c.pageX - (b.pageX - a.pageX) * c.pageY + b.pageX * a.pageY - b.pageY * a.pageX)) / vectorDistance(a, b)
      }

      function nonAbsDistanceFromLine(a, b, c) {
        return ((b.pageY - a.pageY) * c.pageX - (b.pageX - a.pageX) * c.pageY + b.pageX * a.pageY - b.pageY * a.pageX) / vectorDistance(a, b)

      }

      function pointInLineNearestToPoint(a, b, c) {
        B = vectorDistance(a, c)
        A = distanceFromLine(a, b, c)
        return Math.sqrt(B * B - A * A)
      }

      function sortByKey(array, key) {
        return array.sort(function(a, b) {
          var x = a[key];
          var y = b[key];
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
      }

      function average(data) {
        var sum = data.reduce(function(sum, value) {
          return sum + value;
        }, 0);

        var avg = sum / data.length;
        return avg;
      }

      function getStampName(stamp) {
        console.log("get stamp")

        for (var i = 0; i < stamps.length; i++) {
          norm = stamp.max_distance / stamps[i].distance
          text = text + "max_distance: " + stamp.max_distance + "<br>"
          var calcDistance = Array()
          calcDistance[0] = Math.floor(Math.abs(stamp.points[0].distance / norm - stamps[i].distance1))
          calcDistance[1] = Math.floor(Math.abs(stamp.points[1].distance / norm - stamps[i].distance2))
          calcDistance[2] = Math.floor(Math.abs(stamp.points[2].distance / norm - stamps[i].distance3))
          calcDistance[3] = Math.floor(Math.abs(stamp.points[0].height / norm - stamps[i].height1))
          calcDistance[4] = Math.floor(Math.abs(stamp.points[1].height / norm - stamps[i].height2))
          calcDistance[5] = Math.floor(Math.abs(stamp.points[2].height / norm - stamps[i].height3))
          text = text + "razlika: " + stamps[i].name + " : " + calcDistance + "<br>"
          if (Math.max.apply(null, calcDistance) < 25 / norm) {
            callback(stamps[i].name)
          }
          stampDiv.html(text)
        }
      }

      function getDefaultStamps() {
        console.log("filam")
        var tempStamps = '[{"name":"triglav","distance":788.9165917817996,"distance1":179.52608967525748,"height1":173.0014951786888,"distance2":148.73335245607677,"height2":287.31301467005244,"distance3":394.6227219737723,"height3":393.9254076521277},{"name":"smarna","distance":788.077280397853,"distance1":110.102594303584,"height1":241.27079827042098,"distance2":218.1099195686663,"height2":305.73618706496575,"distance3":197.19972162491547,"height3":546.9373178076386},{"name":"neki","distance":791.5561738003921,"distance1":260.22745128086063,"height1":282.6342245953566,"distance2":225.20739936838243,"height2":286.64157247316086,"distance3":195.9947764957078,"height3":547.488279544431}]';
        return JSON.parse(tempStamps);
      }
    }
  }
})(jQuery);
