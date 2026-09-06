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

    //- key lưu cache thông tin user kèm role và permissions
    USER_PERMISSIONS: (userId: string) => `auth:user_permissions:${userId}`,
    //- tiền tố tìm kiếm hoặc xóa hàng loạt cache user permissions
    USER_PERMISSIONS_PREFIX: 'auth:user_permissions:*',
  },
} as const;

//- định nghĩa thời gian sống mặc định của các cache trên redis (tính theo giây)
export const REDIS_TTL = {
  //- thời gian sống của cache user permissions (15 phút)
  USER_PERMISSIONS: 15 * 60,
} as const;
