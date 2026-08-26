import * as bcrypt from 'bcrypt';

//- số vòng lặp tạo muối mặc định cho bcrypt
const DEFAULT_SALT_ROUNDS = 10;

//- hàm băm mật khẩu bằng bcrypt
export const hashPassword = async (
  password: string,
  saltRounds: number = DEFAULT_SALT_ROUNDS,
): Promise<string> => {
  //- tạo chuỗi muối ngẫu nhiên
  const salt = await bcrypt.genSalt(saltRounds);
  //- thực hiện băm mật khẩu với muối
  return await bcrypt.hash(password, salt);
};

//- hàm so sánh mật khẩu thô với mật khẩu đã băm
export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  //- đối chiếu mật khẩu
  return await bcrypt.compare(password, hash);
};
