// Import các file từ file con vào
// import { NhanVien } from '../models/NhanVien.js';
// import { Validation } from '../models/Validation.js';

// Tạo đối tượng validation
let kiemTra = new Validation();

// Lấy API data
function getApiData() {
  let promise = axios({
    url: 'http://svcy.myclass.vn/api/QuanLyNhanVienApi/LayDanhSachNhanVien',
    method: 'GET',
    responseType: 'json',
  });

  // ĐN trường hợp gọi API thành công
  promise.then(function (result) {
    // Hàm này sẽ tự gọi khi API thành công
    console.log('result', result.data);

    // render ra giao diện người dùng
    renderTable(result.data); // mảng nhân viên từ API trả về
  });

  // ĐN trường hợp gọi API thất bại
  promise.catch(function (error) {
    console.log('error', error.data);
  });
}
getApiData(); // Dựa vào giá trị trả về chúng ta mới viết hàm renderTable

function renderTable(arrNhanVien) {
  //
  let ketQua = '';

  for (let nv of arrNhanVien) {
    // Tạo đối tượng nhân viên
    let nhanVien = new NhanVien(
      nv.maNhanVien,
      nv.tenNhanVien,
      nv.chucVu,
      nv.heSoChucVu,
      nv.luongCoBan,
      nv.soGioLamTrongThang
    );

    ketQua += `
      <tr>
        <td>${nhanVien.maNhanVien}</td>
        <td>${nhanVien.tenNhanVien}</td>
        <td>${nhanVien.chucVu}</td>
        <td>${nhanVien.heSoChucVu}</td>
        <td>${nhanVien.luongCoBan}</td>
        <td>${nhanVien.soGioLamTrongThang}</td>
        <td>
          <button class="btn btn-danger" onclick="xoaNhanVien('${nhanVien.maNhanVien}')">Xóa</button>
          <button class="btn btn-primary" onclick="suaNhanVien('${nhanVien.maNhanVien}')">Sửa</button>
        </td>
      </tr>
    `;
  }

  document.querySelector('tbody').innerHTML = ketQua;
  return ketQua;
}

// Xây hàm lấy thông tin chức vụ
const getInfo = (id) => {
  let selectChucVu = document.querySelector(id);
  let arrTagOption = selectChucVu.options; // lấy ra các thẻ option là con của selectChucVu
  let indexOptionsSelected = selectChucVu.selectedIndex; // trả về các giá trị index của options

  let result = '';
  result = arrTagOption[indexOptionsSelected].innerHTML;

  return result;
};

// Xây dựng hàm thêm Nhân Viên
document.querySelector('#btnThemNhanVien').onclick = () => {
  // Tọa đối tượng nhân viên
  let nhanVien = new NhanVien();

  nhanVien.maNhanVien = document.querySelector('#txtMaNV').value;
  nhanVien.tenNhanVien = document.querySelector('#txtTenNV').value;
  // lấy ra hệ số chức vụ

  nhanVien.chucVu = getInfo('#txtChucVu'); // gán nội dung của mỗi thẻ option vào trong thuộc tính chức vụ
  // console.log(nhanVien.chucVu);
  nhanVien.heSoChucVu = document.querySelector('#txtChucVu').value;
  nhanVien.luongCoBan = document.querySelector('#txtLuongCoBan').value;
  nhanVien.soGioLamTrongThang = document.querySelector('#txtGioLam').value;

  // Kiểm tra validation cho nó
  let valid = true;

  // Kiểm tra hàm input người dùng nhập vào có bị rỗng hay không
  valid &=
    kiemTra.kiemTraRong(nhanVien.maNhanVien, '#spanMaNV') &
    kiemTra.kiemTraRong(nhanVien.tenNhanVien, '#spanTenNV') &
    kiemTra.kiemTraRong(nhanVien.luongCoBan, '#spanLuongCoBan') &
    kiemTra.kiemTraRong(nhanVien.soGioLamTrongThang, '#spanGioLam');

  // Kiểm tra tất cả là kí tự (Tên Nhân Viên)
  valid &= kiemTra.kiemTraTatCaKyTu(
    nhanVien.tenNhanVien,
    '#error_allLetter_tenNhanVien'
  );

  // Kiểm Tất cả là số
  valid &=
    kiemTra.kiemTraTatCaLaSo(nhanVien.maNhanVien, '#error_isNumber_maNV') &
    kiemTra.kiemTraTatCaLaSo(nhanVien.luongCoBan, '#error_isNumber_luongCB') &
    kiemTra.kiemTraTatCaLaSo(
      nhanVien.soGioLamTrongThang,
      '#error_isNumber_gioLam'
    );

  // Kiểm tra mã nhân Viên
  valid &= kiemTra.kiemTraMaNhanVien(
    nhanVien.maNhanVien,
    '#error_minMaxLength_maNV',
    'Mã nhân viên '
  );

  // Kiểm tra lương nhân viên
  valid &= kiemTra.kiemTraGiaTriLuong(
    nhanVien.luongCoBan,
    '#error_minMaxNumber_luongCoBan',
    1000000,
    20000000
  );

  // Kiểm tra giờ làm nhân viên trong tháng
  valid &= kiemTra.kiemTraGioLam(
    nhanVien.soGioLamTrongThang,
    '#error_minMaxNumber_gioLam',
    50,
    150
  );

  if (!valid) {
    // Nếu valid không phải là true=> false => dừng chương trình lại
    return;
  }

  // dùng Axios gọi API
  let promise = axios({
    url: 'http://svcy.myclass.vn/api/QuanLyNhanVienApi/ThemNhanVien',
    method: 'POST',
    data: nhanVien,
  });

  // Nếu thành công
  promise.then(function (result) {
    console.log('result', result.data);

    // Result
    getApiData();

    // Thêm Nhân Viên xong clear input đi
    clearInput();
  });

  // Nếu thất bại thì
  promise.catch(function (error) {
    console.log('error', error.response?.data); // để biết trong error có chứa data hay không
  });
};

// Xây dựng hàm cập nhật nhân viên
document.querySelector('#btnCapNhatNhanVien').onclick = () => {
  // Tạo đối tượng nhân viên
  let nhanVien = new NhanVien();

  nhanVien.maNhanVien = document.querySelector('#txtMaNV').value;
  nhanVien.tenNhanVien = document.querySelector('#txtTenNV').value;
  nhanVien.heSoChucVu = document.querySelector('#txtChucVu').value;
  nhanVien.luongCoBan = document.querySelector('#txtLuongCoBan').value;
  nhanVien.soGioLamTrongThang = document.querySelector('#txtGioLam').value;
  nhanVien.chucVu = getInfo('#txtChucVu'); // gán nội dung của mỗi thẻ option vào trong thuộc tính chức vụ

  let promise = axios({
    url:
      'http://svcy.myclass.vn/api/QuanLyNhanVienApi/CapNhatThongTinNhanVien?maNhanVien=' +
      nhanVien.maNhanVien,
    method: 'PUT',
    data: nhanVien,
  });

  //  Thành công
  promise.then(function (result) {
    console.log('result', result);
    // thành công thì load lại table
    getApiData();

    // Chỉnh sửa thì clearInput cũ đi
    clearInput1();
  });

  // thất bại
  promise.catch(function (err) {
    console.log('err', err.response.data);
  });
};

// Xây dựng hàm search nhân viên
document.querySelector('#btnSearchNV').onclick = () => {};

// clear Input đi khi thêm Nhân Viên

function clearInput() {
  document.querySelector('#txtMaNV').value = '';
  document.querySelector('#txtTenNV').value = '';
  // document.querySelector('#txtChucVu').value = '';
  document.querySelector('#txtLuongCoBan').value = '';
  document.querySelector('#txtGioLam').value = '';
}

function clearInput1() {
  document.querySelector('#txtMaNV').disabled = false;
  document.querySelector('#txtTenNV').value = '';
  // document.querySelector('#txtChucVu').value = '';
  document.querySelector('#txtLuongCoBan').value = '';
  document.querySelector('#txtGioLam').value = '';
}

// Xóa nhân viên
function xoaNhanVien(maNhanVienClick) {
  console.log('maNhanVien', maNhanVienClick);

  let promise = axios({
    url:
      'http://svcy.myclass.vn/api/QuanLyNhanVienApi/XoaNhanVien?maSinhVien=' +
      maNhanVienClick,
    method: 'DELETE',
  });

  // Nếu thành công
  promise.then(function (result) {
    console.log('result', result);

    getApiData(); // Xóa thành công thì cập nhập lại table
  });

  // Nếu thất bại thì
  promise.catch(function (err) {
    console.log('err', err);
  });
}

// Sửa nhân viên

// const suaNhanVien = () => {};
function suaNhanVien(maNhanVienClick) {
  console.log('maNhanVien', maNhanVienClick);

  let promise = axios({
    url:
      'http://svcy.myclass.vn/api/QuanLyNhanVienApi/LayThongTinNhanVien?maNhanVien=' +
      maNhanVienClick,
    method: 'GET',
  });

  // Sửa nhân viên thì không cần data: nhanVien

  // Nếu thành công thì
  promise.then(function (result) {
    console.log('result', result);

    const nhanVien = result.data;

    // Gán  giá trị lên control phía trên
    document.querySelector('#txtMaNV').value = nhanVien.maNhanVien;
    document.querySelector('#txtTenNV').value = nhanVien.tenNhanVien;
    // lấy ra hệ số chức vụ

    // nhanVien.chucVu = getInfo('#txtChucVu'); // gán nội dung của mỗi thẻ option vào trong thuộc tính chức vụ

    document.querySelector('#txtLuongCoBan').value = nhanVien.luongCoBan;
    document.querySelector('#txtGioLam').value = nhanVien.soGioLamTrongThang;
    document.querySelector('#txtChucVu').value = nhanVien.heSoChucVu;
    document.querySelector('#txtMaNV').disabled = true;

    nhanVien.chucVu = getInfo();
  });

  // Nếu thất bại
  promise.catch(function (err) {
    console.log('err', err.response.data);
  });
}
