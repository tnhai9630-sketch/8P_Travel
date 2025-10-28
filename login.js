// Danh sách user demo
const users = [
  { username: 'admin', password: '123456', fullname: 'Admin 8P' },
  { username: 'user1', password: '111111', fullname: 'Nguyễn Văn A' },
  { username: 'user2', password: '222222', fullname: 'Trần Thị B' }
];

// Lấy các phần tử cần thiết
const loginBtn = document.getElementById('loginBtn');
const loginPopup = document.getElementById('loginPopup');
const closeBtn = document.querySelector('.popup .close');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const dropdownBtn = document.querySelector('.dropbtn');

// Mở popup khi click Đăng nhập
loginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  loginPopup.style.display = 'block';
});

// Đóng popup khi click dấu x
closeBtn.addEventListener('click', () => {
  loginPopup.style.display = 'none';
});

// Đóng popup khi click ra ngoài popup
window.addEventListener('click', (e) => {
  if (e.target === loginPopup) {
    loginPopup.style.display = 'none';
  }
});

// Hàm cập nhật menu dựa trên trạng thái đăng nhập
function updateMenu() {
  const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
  if (loggedUser) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    dropdownBtn.textContent = loggedUser.fullname + ' ';
    dropdownBtn.innerHTML += '<i class="fas fa-user"></i>';
  } else {
    loginBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    dropdownBtn.textContent = 'Khách hàng ';
    dropdownBtn.innerHTML += '<i class="fas fa-user"></i>';
  }
}

// Xử lý submit form đăng nhập
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const user = users.find(u => u.username === username && u.password === password);
  if(user) {
    alert(`Đăng nhập thành công! Xin chào ${user.fullname}`);
    localStorage.setItem('loggedUser', JSON.stringify(user));
    loginPopup.style.display = 'none';
    updateMenu();
  } else {
    alert('Tên đăng nhập hoặc mật khẩu sai');
  }
});

// Xử lý đăng xuất
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('loggedUser');
  alert('Đã đăng xuất');
  updateMenu();
});

// Khi load trang, cập nhật menu dựa trên trạng thái đăng nhập
updateMenu();
