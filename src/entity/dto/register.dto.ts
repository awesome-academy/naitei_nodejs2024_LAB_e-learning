const { body, validationResult } = require('express-validator');
exports.registerValidation = [
  body('name')
    .notEmpty().withMessage('Tên người dùng là bắt buộc.')
    .isLength({ min: 3, max: 50 }).withMessage('Tên người dùng phải có từ 3 đến 50 ký tự.'),
  
  body('email')
    .isEmail().withMessage('Email không hợp lệ.')
    .notEmpty().withMessage('Email là bắt buộc.'),
  
  body('phone_number')
    .notEmpty().withMessage('Số điện thoại là bắt buộc.')
    .matches(/^\d{10,15}$/).withMessage('Số điện thoại không hợp lệ.'),
  
  body('date_of_birth')
    .notEmpty().withMessage('Ngày sinh là bắt buộc.')
    .isDate().withMessage('Ngày sinh không hợp lệ.'),
  
  body('gender')
    .notEmpty().withMessage('Giới tính là bắt buộc.')
    .isIn(['male', 'female', 'other']).withMessage('Giới tính không hợp lệ.'),
  
  body('address')
    .notEmpty().withMessage('Địa chỉ là bắt buộc.')
    .isLength({ max: 100 }).withMessage('Địa chỉ không được vượt quá 100 ký tự.'),
  
  body('role')
    .notEmpty().withMessage('Vai trò là bắt buộc.')
    .isIn(['user', 'professor']).withMessage('Vai trò không hợp lệ.'),
  
    body('department')
    .if(body('role').equals('professor')) 
    .notEmpty().withMessage('Bộ phận là bắt buộc cho vai trò giáo sư.')
    .isLength({ max: 50 }).withMessage('Bộ phận không được vượt quá 50 ký tự.'),
  
  body('years_of_experience')
    .if(body('role').equals('professor')) 
    .notEmpty().withMessage('Số năm kinh nghiệm là bắt buộc cho vai trò giáo sư.')
    .isInt({ min: 0 }).withMessage('Số năm kinh nghiệm phải là số nguyên không âm.'),
  
  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc.')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự.')
    .matches(/[A-Z]/).withMessage('Mật khẩu phải có ít nhất một ký tự chữ hoa.')
    .matches(/[0-9]/).withMessage('Mật khẩu phải có ít nhất một số.'),
  
  body('identity_card')
    .notEmpty().withMessage('Chứng minh thư là bắt buộc.')
    .isLength({ min: 9, max: 12 }).withMessage('Chứng minh thư phải có từ 9 đến 12 ký tự.'),
  
];