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
  },
} as const;
