import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "path"

import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        allowedHosts: [".derahujan.my.id", "sipelan.derahujan.my.id"],
        proxy: {
            "/api": {
                target: "https://sipelan-be.derahujan.my.id",
                changeOrigin: true,
                secure: false, // Allow self-signed or mismatching SSL in dev
                cookieDomainRewrite: "localhost", // Rewrite domain to localhost
            },
            "/auth": {
                target: "https://sipelan-be.derahujan.my.id",
                changeOrigin: true,
                secure: false,
                cookieDomainRewrite: "localhost",
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
