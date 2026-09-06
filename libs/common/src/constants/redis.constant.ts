//- định nghĩa cấu trúc và hàm sinh key redis tập trung cho toàn bộ hệ thống
export const REDIS_KEYS = {
  AUTH: {
    //- key lưu token id đang hoạt động của người dùng để phát hiện token cũ tái sử dụng
    REFRESH_TOKEN: (userId: string) => `auth:refresh_token:${userId}`,
    //- tiền tố tìm kiếm hoặc xóa hàng loạt refresh token
    REFRESH_TOKEN_PREFIX: 'auth:refresh_token:*',

    //- key lưu token đã bị đưa vào danh sách đen do đăng xuất
    BLACKLIST_TOKEN: (token: string) => `blacklist:token:${token}`,
    //- tiền tố tìm kiếm hoặc xóa hàng loạt token trong blacklist
    BLACKLIST_TOKEN_PREFIX: 'blacklist:token:*',

    //- key lưu cache thông tin cơ bản của user (user profile)
    USER: (userId: string) => `auth:user:${userId}`,
    //- tiền tố tìm kiếm hoặc xóa hàng loạt cache user
    USER_PREFIX: 'auth:user:*',

    //- key lưu cache danh sách quyền hạn theo mã vai trò (role code)
    ROLE_PERMISSIONS: (roleCode: string) =>
      `auth:role_permissions:${roleCode.toUpperCase()}`,
    //- tiền tố tìm kiếm hoặc xóa hàng loạt cache quyền hạn của các vai trò
    ROLE_PERMISSIONS_PREFIX: 'auth:role_permissions:*',
  },
} as const;

//- định nghĩa thời gian sống mặc định của các cache trên redis (tính theo giây)
export const REDIS_TTL = {
  //- thời gian sống của cache thông tin user cá nhân (15 phút - khớp thời hạn access token)
  USER_PROFILE: 15 * 60,
  //- thời gian sống của cache danh sách quyền của một vai trò (24 giờ)
  ROLE_PERMISSIONS: 24 * 60 * 60,
} as const;
