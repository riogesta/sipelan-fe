import { useState } from "react"
import { login, register } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Loader2, GalleryVerticalEnd } from "lucide-react"
import { cn } from "@/lib/utils"

type AuthMode = "login" | "signup"

export function AuthPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const [mode, setAuthMode] = useState<AuthMode>("login")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [errorFields, setErrorFields] = useState<string[]>([])

    const isLogin = mode === "login"

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setErrorFields([])
        const newErrorFields: string[] = []

        if (!username.trim()) newErrorFields.push("username")
        if (!password.trim()) newErrorFields.push("password")
        if (!isLogin && !confirmPassword.trim()) newErrorFields.push("confirmPassword")

        if (newErrorFields.length > 0) {
            setErrorFields(newErrorFields)
            setError("Harap isi semua field yang wajib")
            setLoading(false)
            return
        }

        if (!isLogin && password !== confirmPassword) {
            setErrorFields(["password", "confirmPassword"])
            setError("Konfirmasi password tidak cocok")
            setLoading(false)
            return
        }

        try {
            if (isLogin) {
                const res = await login(username, password)
                if (res.data) {
                    if (res.data.token) {
                        localStorage.setItem("sipelan-token", res.data.token)
                    }
                    localStorage.setItem("sipelan-is-logged-in", "true")
                    onLoginSuccess()
                }
            } else {
                await register(username, password)
                setAuthMode("login")
                setError("")
                setUsername("")
                setPassword("")
                setConfirmPassword("")
                alert("Akun berhasil dibuat! Silakan login.")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan")
        } finally {
            setLoading(false)
        }
    }

    const sidePanelData = {
        login: {
            image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2022&auto=format&fit=crop",
            title: "Kelola Keuangan Lebih Cerdas",
            description: "SIPELAN membantu anda memantau setiap pemasukan dan pengeluaran dengan presisi dan kemudahan."
        },
        signup: {
            image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop",
            title: "Mulai Langkah Finansial Anda",
            description: "Daftar sekarang untuk mulai merencanakan masa depan keuangan yang lebih stabil dan terukur."
        }
    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2 fixed inset-0 w-full h-full bg-background z-50 overflow-y-auto lg:overflow-hidden">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    {/* ini di comment dulu jangan di ubah */}
                    {/* <a href="#" className="flex items-center gap-2 font-medium">
                        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        SIPELAN Inc.
                    </a> */}
                </div>
                <div className="flex flex-1 items-center justify-center py-10">
                    <div className="w-full max-w-xs">
                        <form className={cn("flex flex-col gap-6")} onSubmit={handleSubmit}>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold">
                                    {isLogin ? "Masuk ke akun anda" : "Buat akun baru"}
                                </h1>
                                <p className="text-sm text-balance text-muted-foreground">
                                    {isLogin 
                                        ? "Masukkan username anda di bawah untuk mengakses dashboard" 
                                        : "Lengkapi form di bawah untuk mulai menggunakan SIPELAN"}
                                </p>
                            </div>
                            
                            {error && (
                                <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-md animate-in fade-in zoom-in-95 duration-200 font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-5">
                                <div className="grid gap-2">
                                    <label 
                                        htmlFor="username"
                                        className={cn(
                                            "text-sm font-medium leading-none",
                                            errorFields.includes("username") && "text-destructive"
                                        )}
                                    >
                                        Username
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className={cn(
                                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                                            errorFields.includes("username") && "border-destructive text-destructive bg-destructive/5"
                                        )}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    {/* ini di comment dulu jangan di ubah */}
                                    {/* <div className="flex items-center">
                                        <label 
                                            htmlFor="password"
                                            className={cn(
                                                "text-sm font-medium leading-none",
                                                errorFields.includes("password") && "text-destructive"
                                            )}
                                        >
                                            Password
                                        </label>
                                        {isLogin && (
                                            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                                                Lupa password?
                                            </a>
                                        )}
                                    </div> */}
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={cn(
                                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                                            errorFields.includes("password") && "border-destructive text-destructive bg-destructive/5"
                                        )}
                                    />
                                </div>

                                {!isLogin && (
                                    <div className="grid gap-2">
                                        <label 
                                            htmlFor="confirmPassword"
                                            className={cn(
                                                "text-sm font-medium leading-none",
                                                errorFields.includes("confirmPassword") && "text-destructive"
                                            )}
                                        >
                                            Konfirmasi Password
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={cn(
                                                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                                                errorFields.includes("confirmPassword") && "border-destructive text-destructive bg-destructive/5"
                                            )}
                                        />
                                    </div>
                                )}

                                <Button type="submit" className="w-full h-10" disabled={loading}>
                                    {loading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : isLogin ? "Login" : "Daftar Sekarang"}
                                </Button>
                            </div>

                            <div className="text-center text-sm">
                                {isLogin ? (
                                    <>
                                        Belum punya akun?{" "}
                                        <button 
                                            type="button"
                                            onClick={() => setAuthMode("signup")}
                                            className="underline underline-offset-4 font-semibold hover:text-primary transition-colors"
                                        >
                                            Daftar sekarang
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Sudah punya akun?{" "}
                                        <button 
                                            type="button"
                                            onClick={() => setAuthMode("login")}
                                            className="underline underline-offset-4 font-semibold hover:text-primary transition-colors"
                                        >
                                            Masuk kembali
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <img
                    key={mode}
                    src={sidePanelData[mode].image}
                    alt="Auth Background"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] brightness-90 grayscale-[0.1] animate-in fade-in duration-1000"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent flex items-end p-12">
                    <div className="max-w-md space-y-2 animate-in slide-in-from-bottom-5 duration-700">
                        <h3 className="text-3xl font-bold text-white tracking-tight">
                            {sidePanelData[mode].title}
                        </h3>
                        <p className="text-white/80 text-lg leading-relaxed">
                            {sidePanelData[mode].description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
