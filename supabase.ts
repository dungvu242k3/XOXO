import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';

// Cấu hình Supabase
// Ưu tiên lấy từ biến môi trường của Vite (VITE_*)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback chỉ dùng cho môi trường development nếu cần, 
// nhưng khuyến nghị cấu hình trong .env hoặc Vercel Dashboard
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'CRITICAL: Supabase URL hoặc Anon Key chưa được cấu hình!\n' +
    'Vui lòng kiểm tra file .env (local) hoặc Environment Variables (Vercel Dashboard).\n' +
    'Yêu cầu các biến: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY'
  );
}

// Cấu hình tối ưu cho Supabase client
const supabaseOptions: SupabaseClientOptions<'public'> = {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-client-info': 'xoxo-erp-crm',
    },
    // Tối ưu fetch với timeout
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 giây timeout

      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    },
  },
  // Tối ưu realtime - handle WebSocket errors gracefully
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    // Disable realtime nếu có vấn đề với WebSocket
    // Có thể bật lại sau khi fix WebSocket issues
    // log_level: 'info',
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

// Định nghĩa tên bảng (tên tiếng Việt)
export const DB_TABLES = {
  ORDERS: 'don_hang',
  INVENTORY: 'kho_vat_tu',
  CUSTOMERS: 'khach_hang',
  SERVICES: 'dich_vu_spa',
  PRODUCTS: 'san_pham_ban_le',
  WORKFLOWS: 'quy_trinh',
  WORKFLOW_STAGES: 'cac_buoc_quy_trinh', // Bảng con cho các bước quy trình
  WORKFLOW_TASKS: 'cac_task_quy_trinh', // Bảng con cho các task của mỗi bước
  MEMBERS: 'nhan_su',
  NOTIFICATIONS: 'thong_bao',
  SERVICE_ITEMS: 'hang_muc_dich_vu', // Đổi từ service_items sang hang_muc_dich_vu
};

// Helper functions để tương thích với code cũ (nếu cần)
export const db = {
  ref: (path: string) => ({ path }),
};

// Export để tương thích
export const DB_PATHS = DB_TABLES;

