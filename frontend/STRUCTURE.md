# Frontend Structure

Cấu trúc thư mục frontend đã được tái cấu trúc theo mô hình hiện đại và dễ bảo trì:

## 📁 Cấu trúc thư mục

```
src/
├── app/                    # App configuration và main components
│   └── App.tsx            # Root component
├── shared/                 # Shared resources across features
│   ├── components/         # Common components
│   │   ├── ui/            # UI component library (shadcn/ui)
│   │   └── index.ts       # Component exports
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services và external integrations
│   ├── utils/             # Utility functions
│   ├── constants/         # Application constants
│   ├── types/             # TypeScript type definitions
│   ├── contexts/          # React contexts
│   └── index.ts           # Shared exports
├── features/              # Feature-based modules
│   ├── auth/              # Authentication feature
│   │   ├── components/    # Auth-specific components
│   │   ├── pages/         # Auth pages
│   │   ├── AuthRoutes.tsx # Auth routing
│   │   └── index.ts       # Auth exports
│   ├── blog/              # Blog feature
│   │   ├── components/    # Blog-specific components
│   │   ├── pages/         # Blog pages
│   │   ├── BlogRoutes.tsx # Blog routing
│   │   └── index.ts       # Blog exports
│   └── admin/             # Admin feature
│       ├── components/    # Admin-specific components
│       ├── pages/         # Admin pages
│       ├── layouts/       # Admin layouts
│       └── index.ts       # Admin exports
├── assets/                # Static assets (images, icons, etc.)
├── styles/                # Global styles
│   ├── App.css           # App-specific styles
│   └── index.css         # Global styles
├── main.tsx              # Application entry point
└── vite-env.d.ts         # Vite type definitions
```

## 🎯 Nguyên tắc tổ chức

### 1. **Feature-based Architecture**
- Mỗi feature (auth, blog, admin) được tổ chức trong thư mục riêng
- Mỗi feature có components, pages và routing riêng
- Dễ dàng thêm/xóa features mà không ảnh hưởng đến code khác

### 2. **Shared Resources**
- Components dùng chung được đặt trong `shared/components`
- Hooks, utils, types được tập trung trong `shared`
- Dễ dàng tái sử dụng code giữa các features

### 3. **Clear Separation of Concerns**
- App configuration tách biệt trong `app/`
- Business logic trong `services/`
- UI components trong `components/`
- Type definitions trong `types/`

### 4. **Index Files for Clean Imports**
- Mỗi thư mục có file `index.ts` để export
- Import statements ngắn gọn và rõ ràng
- Dễ dàng refactor và maintain

## 📦 Các thư mục chính

### `/app`
Chứa App component chính và cấu hình ứng dụng.

### `/shared`
Chứa tất cả resources dùng chung:
- **components**: UI components, layout components
- **hooks**: Custom React hooks
- **services**: API calls, external integrations
- **utils**: Helper functions, formatters
- **constants**: App constants, API endpoints
- **types**: TypeScript interfaces và types
- **contexts**: React contexts cho state management

### `/features`
Mỗi feature được tổ chức như một module độc lập:
- **components**: Feature-specific components
- **pages**: Page components cho feature
- **layouts**: Layout components (nếu cần)
- **hooks**: Feature-specific hooks (nếu cần)

### `/assets`
Static files như images, icons, fonts.

### `/styles`
Global styles và CSS files.

## 🚀 Lợi ích của cấu trúc mới

1. **Scalability**: Dễ dàng mở rộng với features mới
2. **Maintainability**: Code được tổ chức rõ ràng, dễ maintain
3. **Reusability**: Shared resources có thể tái sử dụng
4. **Developer Experience**: Import paths ngắn gọn, dễ hiểu
5. **Team Collaboration**: Nhiều developer có thể làm việc song song
6. **Testing**: Dễ dàng test từng feature độc lập

## 📋 Quy tắc đặt tên

- **PascalCase**: Components, Pages, Types
- **camelCase**: Functions, variables, hooks
- **kebab-case**: File names (ngoại trừ components)
- **UPPER_CASE**: Constants

## 🔄 Migration từ cấu trúc cũ

Tất cả files đã được di chuyển và imports đã được cập nhật:
- `components/` → `shared/components/`
- `lib/` → `shared/services/`
- `types/` → `shared/types/`
- `contexts/` → `shared/contexts/`
- Features đã được nhóm vào `features/`
