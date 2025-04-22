export default function Header() {
    return (
      <header className="h-[60px] bg-dark-gray text-white flex items-center justify-between px-6">
        <div className="text-2xl font-bold">Logo</div>
        <div className="w-12 h-12 rounded-full bg-slate-500 flex items-center justify-center">
          <span className="sr-only">Perfil de usuario</span>
        </div>
      </header>
    )
  }
  