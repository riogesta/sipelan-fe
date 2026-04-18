import { useState } from "react"
import { login } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            const res = await login(username, password)
            if (res.data?.token) {
                localStorage.setItem("sipelan-token", res.data.token)
                onLoginSuccess()
            } else {
                setError("Token tidak diterima dari server")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login gagal")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div 
            className="fixed inset-0 w-full h-full flex items-center justify-end pr-10 md:pr-32 lg:pr-48 overflow-hidden"
            style={{
                backgroundColor: "#f0f7ff",
                backgroundImage: `repeating-linear-gradient(45deg, #dceeff 0, #dceeff 1px, transparent 0, transparent 50%)`,
                backgroundSize: "8px 8px",
            }}
        >
            <Card className="w-full max-w-[380px] shadow-2xl border-2 animate-in fade-in slide-in-from-right-10 duration-500">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">Masuk SIPELAN</CardTitle>
                    <CardDescription>
                        Silakan masukkan kredensial anda untuk mengakses dashboard.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        {error && (
                            <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
                                {error}
                            </div>
                        )}
                        
                        <div className="grid gap-2">
                            <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Masukkan username"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="pt-6">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mohon Tunggu...
                                </>
                            ) : (
                                "Login"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
