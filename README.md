# FE (Vite + React)

## Chạy dự án

```bash
npm run dev
npm run build
npm run lint
```

## Cấu trúc thư mục (gợi ý “cơ bản nhưng đầy đủ”)

```
src/
	app/                # entry UI của app (App, providers, layout root)
	assets/             # ảnh, svg, fonts...
	components/         # UI components tái sử dụng
	pages/              # các trang (route-level)
	layouts/            # layout dùng chung cho pages
	routes/             # cấu hình route (router)
	features/           # module theo nghiệp vụ (cart, auth, product...)
	services/           # gọi API, http client, integrations
	hooks/              # custom hooks
	utils/              # helpers (format, validate...)
	constants/          # hằng số
	config/             # cấu hình app (env, endpoints...)
	styles/             # styles dùng chung
	main.jsx            # entry point của Vite
	index.css           # global css
```

## Alias import `@/…`

- Alias `@` trỏ về `src/` (đã cấu hình trong `vite.config.js` + `jsconfig.json`)
- Ví dụ: `import App from '@/app/App.jsx'`

## Env variables

- Tạo `.env` (hoặc `.env.local`) và khai báo `VITE_API_BASE_URL` nếu cần gọi API.
- Code đọc env: `src/config/env.js`
