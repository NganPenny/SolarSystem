var initialTime = 60 * 60; // Thời gian ban đầu (60 phút)
var remainingTime = initialTime; // Thời gian còn lại

function updateClock() {
  // Giảm thời gian còn lại
  remainingTime--;

  // Kiểm tra nếu thời gian còn lại là 0 và đóng tab
  if (remainingTime <= 0) {
    window.close(); // Đóng tab hiện tại
  }

  // Hiển thị thời gian còn lại trong đồng hồ
  document.getElementById("clock").innerHTML = formatTime(remainingTime * 1000);

  // Cập nhật vị trí
  updateLocation();
}

function formatTime(timeMs) {
  var remainingMinutes = Math.floor(timeMs / 60000);
  var remainingSeconds = Math.floor((timeMs % 60000) / 1000);

  // Thêm số 0 đầu tiên cho phút và giây nếu nhỏ hơn 10
  remainingMinutes = (remainingMinutes < 10 ? "0" : "") + remainingMinutes;
  remainingSeconds = (remainingSeconds < 10 ? "0" : "") + remainingSeconds;

  return "Time remaining: " + remainingMinutes + ":" + remainingSeconds;
}

// Lưu trạng thái đồng hồ vào sessionStorage
function saveClockState() {
  sessionStorage.setItem("clockState", remainingTime);
}

// Khôi phục trạng thái đồng hồ từ sessionStorage
function restoreClockState() {
  var clockState = sessionStorage.getItem("clockState");

  if (clockState !== null) {
    var remainingTimeMs = parseInt(clockState) * 1000;
  } else {
    // Set the initial remaining time to 1 hour
    var remainingTimeMs = 3600000;
  }

  document.getElementById("clock").innerHTML = formatTime(remainingTimeMs);

  if (remainingTimeMs <= 0) {
    window.close(); // Close the tab if time is up
  }
}

// Gọi hàm updateClock mỗi giây
var clockInterval = setInterval(updateClock, 1000);

// Lưu trạng thái đồng hồ khi trang web được tải lại hoặc đóng
window.addEventListener("beforeunload", saveClockState);

// Khôi phục trạng thái đồng hồ khi trang web được tải lại
window.addEventListener("load", restoreClockState);
