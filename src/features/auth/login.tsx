import { useState } from "react"
import { login, register } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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
                toast.success("Akun berhasil dibuat! Silakan tunggu aktivasi oleh administrator.")
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
            image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "Mulai Langkah Finansial Anda",
            description: "Daftar sekarang untuk mulai merencanakan masa depan keuangan yang lebih stabil dan terukur."
        }
    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2 fixed inset-0 w-full h-full bg-background z-50 overflow-y-auto lg:overflow-hidden">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
                            S
                        </div>
                        SIPELAN
                    </div>
                </div>
                <div className="flex flex-1 items-center justify-center py-10">
                    <div className="w-full max-w-xs">
                        <form className={cn("flex flex-col gap-6")} onSubmit={handleSubmit}>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {isLogin ? "Selamat Datang" : "Buat Akun"}
                                </h1>
                                <p className="text-sm text-balance text-muted-foreground">
                                    {isLogin 
                                        ? "Masukkan kredensial anda untuk masuk" 
                                        : "Daftarkan diri anda untuk mulai mencatat keuangan"}
                                </p>
                            </div>
                            
                            {error && (
                                <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-xl animate-in fade-in zoom-in-95 duration-200 font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-5">
                                <div className="grid gap-2">
                                    <label 
                                        htmlFor="username"
                                        className={cn(
                                            "text-sm font-semibold text-muted-foreground",
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
                                            "flex h-11 w-full rounded-xl border border-input bg-muted/30 px-4 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-none",
                                            errorFields.includes("username") && "border-destructive text-destructive bg-destructive/5"
                                        )}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <label 
                                            htmlFor="password"
                                            className={cn(
                                                "text-sm font-semibold text-muted-foreground",
                                                errorFields.includes("password") && "text-destructive"
                                            )}
                                        >
                                            Password
                                        </label>
                                        {isLogin && (
                                            <a href="#" className="text-xs font-medium text-primary hover:underline underline-offset-4">
                                                Lupa password?
                                            </a>
                                        )}
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={cn(
                                            "flex h-11 w-full rounded-xl border border-input bg-muted/30 px-4 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-none",
                                            errorFields.includes("password") && "border-destructive text-destructive bg-destructive/5"
                                        )}
                                    />
                                </div>

                                {!isLogin && (
                                    <div className="grid gap-2">
                                        <label 
                                            htmlFor="confirmPassword"
                                            className={cn(
                                                "text-sm font-semibold text-muted-foreground",
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
                                                "flex h-11 w-full rounded-xl border border-input bg-muted/30 px-4 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-none",
                                                errorFields.includes("confirmPassword") && "border-destructive text-destructive bg-destructive/5"
                                            )}
                                        />
                                    </div>
                                )}

                                <Button type="submit" className="w-full h-11 rounded-xl text-base font-bold shadow-lg" disabled={loading}>
                                    {loading ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : isLogin ? "Masuk Sekarang" : "Daftar Akun"}
                                </Button>
                            </div>

                            <div className="text-center text-sm">
                                {isLogin ? (
                                    <p className="text-muted-foreground">
                                        Belum punya akun?{" "}
                                        <button 
                                            type="button"
                                            onClick={() => setAuthMode("signup")}
                                            className="text-primary font-bold hover:underline underline-offset-4"
                                        >
                                            Daftar gratis
                                        </button>
                                    </p>
                                ) : (
                                    <p className="text-muted-foreground">
                                        Sudah punya akun?{" "}
                                        <button 
                                            type="button"
                                            onClick={() => setAuthMode("login")}
                                            className="text-primary font-bold hover:underline underline-offset-4"
                                        >
                                            Login kembali
                                        </button>
                                    </p>
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
                    className={cn(
                        "absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] brightness-90 grayscale-[0.1] animate-in fade-in duration-1000",
                        mode === "signup" && "-scale-x-100"
                    )}
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent flex items-end p-16">
                    <div className="max-w-md space-y-4 animate-in slide-in-from-bottom-8 duration-700">
                        <div className="inline-flex px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                            {isLogin ? "Sistem Pencatatan" : "Bergabunglah Sekarang"}
                        </div>
                        <h3 className="text-4xl font-black text-white tracking-tight leading-[1.1]">
                            {sidePanelData[mode].title}
                        </h3>
                        <p className="text-white/80 text-xl leading-relaxed">
                            {sidePanelData[mode].description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
