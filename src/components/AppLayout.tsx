import { ReactNode, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Music, Search, Menu, X, ChevronRight, ChevronDown, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { daftarLagu, getLaguBySlug } from "@/data/lagu";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [breadcrumbDropdownOpen, setBreadcrumbDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/cari?kata-kunci=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBreadcrumbDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Breadcrumb logic
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const isSearch = pathSegments[0] === "cari";
  const currentLagu = !isSearch && pathSegments[0] ? getLaguBySlug(pathSegments[0]) : undefined;
  const isDetailPage = !!currentLagu;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-4 px-4 md:px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0 p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Music className="h-5 w-5 text-accent" />
            <span className="font-display text-lg font-semibold hidden sm:inline">
              Animasi Partitur Musik
            </span>
          </Link>

          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground ml-2">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              Beranda
            </Link>

            {isSearch && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-medium">Pencarian</span>
              </>
            )}

            {isDetailPage && (
              <>
                <ChevronRight className="h-3 w-3" />
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setBreadcrumbDropdownOpen(!breadcrumbDropdownOpen)}
                    className="flex items-center gap-1 text-foreground font-medium hover:text-accent transition-colors"
                  >
                    {currentLagu.judul}
                    <ChevronDown className={cn("h-3 w-3 transition-transform", breadcrumbDropdownOpen && "rotate-180")} />
                  </button>

                  {breadcrumbDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-56 rounded-lg border bg-popover shadow-lg z-[60] py-1 animate-in fade-in-0 zoom-in-95">
                      <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Pilih Lagu
                      </p>
                      {daftarLagu.map((lagu) => (
                        <Link
                          key={lagu.slug}
                          to={`/${lagu.slug}`}
                          onClick={() => setBreadcrumbDropdownOpen(false)}
                          className={cn(
                            "block px-3 py-2 text-sm transition-colors",
                            lagu.slug === currentLagu.slug
                              ? "bg-accent/15 text-accent-foreground font-medium"
                              : "text-popover-foreground hover:bg-muted"
                          )}
                        >
                          {lagu.judul}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Cari judul lagu..."
                className="pl-9 w-48 md:w-64 h-9 bg-muted/50 border-none focus-visible:ring-accent"
              />
            </div>
          </form>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed md:sticky top-14 z-40 h-[calc(100vh-3.5rem)] border-r bg-sidebar transition-all duration-300 overflow-hidden",
            sidebarOpen ? "w-64" : "w-0 border-r-0"
          )}
        >
          <div className="w-64 p-4">
            <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Daftar Lagu
            </h2>
            <ul className="space-y-1">
              {daftarLagu.map((lagu) => {
                const isActive = location.pathname === `/${lagu.slug}`;
                return (
                  <li key={lagu.slug}>
                    <Link
                      to={`/${lagu.slug}`}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "block px-3 py-2 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-accent/20 text-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-muted"
                      )}
                    >
                      {lagu.judul}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-foreground/20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 flex justify-center">
          <div className="w-full max-w-5xl">{children}</div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="px-6 md:px-8 py-8">
          <div className="max-w-4xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Music className="h-4 w-4 text-accent" />
                <span className="font-display font-semibold">Animasi Partitur Musik</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Koleksi partitur musik digital dengan animasi interaktif.
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:ml-auto">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Beranda
              </Link>
              {daftarLagu.slice(0, 3).map((lagu) => (
                <Link
                  key={lagu.slug}
                  to={`/${lagu.slug}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {lagu.judul}
                </Link>
              ))}
            </nav>
          </div>

          <div className="max-w-4xl mt-6 pt-4 border-t border-border/60">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Animasi Partitur Musik. Hak cipta dilindungi undang-undang.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
