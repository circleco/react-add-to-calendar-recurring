"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var helpers = function () {
  function helpers() {
    _classCallCheck(this, helpers);
  }

  _createClass(helpers, [{
    key: "getRandomKey",
    value: function getRandomKey() {
      var n = Math.floor(Math.random() * 999999999999).toString();
      return new Date().getTime().toString() + "_" + n;
    }
  }, {
    key: "formatTime",
    value: function formatTime(date) {
      var formattedDate = _moment2.default.utc(date).format("YYYYMMDDTHHmmssZ");
      return formattedDate.replace("+00:00", "Z");
    }
  }, {
    key: "calculateDuration",
    value: function calculateDuration(startTime, endTime) {
      // snag parameters and format properly in UTC
      var end = _moment2.default.utc(endTime).format("DD/MM/YYYY HH:mm:ss");
      var start = _moment2.default.utc(startTime).format("DD/MM/YYYY HH:mm:ss");

      // calculate the difference in milliseconds between the start and end times
      var difference = (0, _moment2.default)(end, "DD/MM/YYYY HH:mm:ss").diff((0, _moment2.default)(start, "DD/MM/YYYY HH:mm:ss"));

      // convert difference from above to a proper momentJs duration object
      var duration = _moment2.default.duration(difference);

      return Math.floor(duration.asHours()) + _moment2.default.utc(difference).format(":mm");
    }
  }, {
    key: "buildUrl",
    value: function buildUrl(event, type, isCrappyIE) {
      var calendarUrl = "";

      var buildRecurringEvent = function buildRecurringEvent() {
        if (!event.recurring) return '';

        if (typeof event.recurring === 'string') {
          return event.recurring;
        }

        var recur = "RRULE:FREQ=" + event.recurring.repeat + ";INTERVAL=" + (event.recurring.interval || 1) + ";WKST=" + (event.recurring.weekStart || 'SU');
        if (event.recurring.count) {
          recur = recur + ";COUNT=" + event.recurring.count;
        }
        if (event.recurring.byDay) {
          recur = recur + ";BYDAY=" + event.recurring.byDay;
        }
        if (event.recurring.byMonth) {
          recur = recur + ";BYMONTH=" + event.recurring.byMonth;
        }

        return recur.toUpperCase();
      };

      // allow mobile browsers to open the gmail data URI within native calendar app
      // type = (type == "google" && this.isMobile()) ? "outlook" : type;

      switch (type) {
        case "google":
          calendarUrl = "https://calendar.google.com/calendar/render";
          calendarUrl += "?action=TEMPLATE";
          calendarUrl += "&dates=" + this.formatTime(event.startTime);
          calendarUrl += "/" + this.formatTime(event.endTime);

          if (event.recurring) {
            calendarUrl += "&recur=" + buildRecurringEvent();
          }

          calendarUrl += "&ctz=" + encodeURIComponent(event.timeZone);
          calendarUrl += "&location=" + encodeURIComponent(event.location);
          calendarUrl += "&text=" + encodeURIComponent(event.title);
          calendarUrl += "&details=" + encodeURIComponent(event.description);
          break;

        case "yahoo":
          // yahoo doesn't utilize endTime so we need to calulate duration
          var duration = this.calculateDuration(event.startTime, event.endTime);
          calendarUrl = "https://calendar.yahoo.com/?v=60&view=d&type=20";
          calendarUrl += "&title=" + encodeURIComponent(event.title);
          calendarUrl += "&st=" + this.formatTime(event.startTime);
          calendarUrl += "&dur=" + duration;
          calendarUrl += "&desc=" + encodeURIComponent(event.description);
          calendarUrl += "&in_loc=" + encodeURIComponent(event.location);
          break;

        case "outlookcom":
          calendarUrl = "https://outlook.live.com/owa/?rru=addevent";
          calendarUrl += "&startdt=" + this.formatTime(event.startTime);
          calendarUrl += "&enddt=" + this.formatTime(event.endTime);
          calendarUrl += "&subject=" + encodeURIComponent(event.title);
          calendarUrl += "&location=" + encodeURIComponent(event.location);
          calendarUrl += "&body=" + encodeURIComponent(event.description);
          calendarUrl += "&allday=false";
          calendarUrl += "&uid=" + this.getRandomKey();
          calendarUrl += "&path=/calendar/view/Month";
          break;

        default:
          calendarUrl = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", "URL:" + document.URL, "DTSTART:" + this.formatTime(event.startTime), "DTEND:" + this.formatTime(event.endTime), "SUMMARY:" + event.title, "DESCRIPTION:" + event.description, "LOCATION:" + event.location];

          if (event.recurring) {
            calendarUrl = calendarUrl.concat([buildRecurringEvent()]);
          }

          calendarUrl = calendarUrl.concat(["END:VEVENT", "END:VCALENDAR"]);

          calendarUrl = calendarUrl.join("\n");

          if (!isCrappyIE && this.isMobile()) {
            calendarUrl = encodeURI("data:text/calendar;charset=utf8," + calendarUrl);
          }
      }

      return calendarUrl;
    }

    // determine if a mobile browser is being used

  }, {
    key: "isMobile",
    value: function isMobile() {
      var mobile = false;

      (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) ||
        // eslint-disable-next-line no-useless-escape
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) mobile = true;
      })(window.navigator.userAgent || window.navigator.vendor || window.opera);

      return mobile;
    }
  }]);

  return helpers;
}();

exports.default = helpers;
